# app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from PyPDF2 import PdfReader
from difflib import SequenceMatcher
from werkzeug.utils import secure_filename

# ---------- Config básica ----------
app = Flask(__name__)
CORS(app)  # libera acesso do app React Native

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_DOCS = {".pdf", ".txt"}
ALLOWED_AUDIO = {".wav", ".mp3", ".m4a", ".mp4", ".ogg"}

# OpenAI
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# ---------- Utilitários ----------
def _ext(name: str) -> str:
    return os.path.splitext(name)[1].lower()

def _path_in_uploads(filename: str) -> str:
    return os.path.join(UPLOAD_FOLDER, secure_filename(filename))

def extract_text_from_pdf(path: str) -> str:
    reader = PdfReader(path)
    out = []
    for p in reader.pages:
        t = p.extract_text() or ""
        if t.strip():
            out.append(t)
    return "\n".join(out)

def similarity_percent(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return round(SequenceMatcher(None, a.lower(), b.lower()).ratio() * 100, 2)

# ---------- Endpoints ----------
@app.route("/")
def home():
    return "Quiz AI Backend funcionando " 

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/api/generate-questions", methods=["POST"])
def generate_questions():
    """
    Recebe PDF/TXT (campo 'file') e retorna até 3 perguntas.
    Resposta: { "questions": [...], "source_text_snippet": "..." }
    """
    if "file" not in request.files:
        return jsonify({"error": "Envie o arquivo no campo 'file'."}), 400

    f = request.files["file"]
    if not f.filename:
        return jsonify({"error": "Arquivo sem nome."}), 400

    ext = _ext(f.filename)
    if ext not in ALLOWED_DOCS:
        return jsonify({"error": f"Extensão não suportada ({ext}). Envie .pdf ou .txt."}), 400

    save_path = _path_in_uploads(f.filename)
    f.save(save_path)

    try:
        if ext == ".pdf":
            text = extract_text_from_pdf(save_path)
        else:
            with open(save_path, "r", encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
    except Exception as e:
        return jsonify({"error": "Falha ao ler o arquivo.", "detail": str(e)}), 400

    text = (text or "").strip()
    if not text:
        return jsonify({"error": "Não foi possível extrair texto legível do arquivo."}), 400

    # corta para evitar prompts enormes
    text_cut = text[:4000]

    if not client or True:
        # sem chave OpenAI -> resposta de desenvolvimento
        mock = [
            "Qual é o tema principal do texto?",
            "Quais são os argumentos centrais apresentados?",
            "Qual a conclusão do autor?"
        ]
        return jsonify({"questions": mock, "source_text_snippet": text_cut[:800], "note": "OPENAI_API_KEY ausente; usando perguntas mock."})

    prompt = (
        "Gere até 3 perguntas objetivas de compreensão do texto a seguir. "
        "Responda em JSON: [\"Pergunta 1\", \"Pergunta 2\", ...]\n\n"
        f"{text_cut}"
    )

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=400,
        )
        content = resp.choices[0].message.content.strip()
        # tenta interpretar como JSON; caso contrário, quebra por linhas
        import json
        try:
            questions = json.loads(content)
            if not isinstance(questions, list):
                raise ValueError()
        except Exception:
            questions = [ln.strip("-• \t") for ln in content.splitlines() if ln.strip()]
            questions = questions[:3]
        return jsonify({"questions": questions, "source_text_snippet": text_cut[:800]})
    except Exception as e:
        # erro típico: quota (429) ou credencial
        return jsonify({"error": "Falha ao gerar perguntas com OpenAI.", "detail": str(e)}), 502

@app.route("/api/transcribe", methods=["POST"])
def transcribe():
    """
    Recebe áudio (campo 'audio') e retorna transcrição.
    Resposta: { "transcript": "..." }
    """
    if "audio" not in request.files:
        return jsonify({"error": "Envie o áudio no campo 'audio'."}), 400

    f = request.files["audio"]
    if not f.filename:
        return jsonify({"error": "Áudio sem nome."}), 400

    ext = _ext(f.filename)
    if ext not in ALLOWED_AUDIO:
        return jsonify({"error": f"Formato de áudio não suportado ({ext}). Envie wav/mp3/m4a/mp4/ogg."}), 400

    save_path = _path_in_uploads(f.filename)
    f.save(save_path)

    if not client:
        return jsonify({"transcript": "", "note": "OPENAI_API_KEY ausente; sem transcrição."})

    try:
        with open(save_path, "rb") as fh:
            trans = client.audio.transcriptions.create(
                model="whisper-1",
                file=fh
            )
        return jsonify({"transcript": trans.text})
    except Exception as e:
        return jsonify({"error": "Falha ao transcrever com OpenAI.", "detail": str(e)}), 502

@app.route("/api/evaluate", methods=["POST"])
def evaluate():
    """
    Recebe JSON: { "correct_answer": "...", "user_answer": "..." }
    Retorna: { "score": 0..100 }
    """
    data = request.get_json(silent=True) or {}
    correct = (data.get("correct_answer") or "").strip()
    user = (data.get("user_answer") or "").strip()

    if not correct or not user:
        return jsonify({"error": "Envie 'correct_answer' e 'user_answer' no corpo JSON."}), 400

    # tentamos IA; se falhar, usamos similaridade local
    if client:
        try:
            prompt = (
                "Compare semanticamente as duas respostas e retorne apenas um número de 0 a 100.\n"
                f"Resposta correta: {correct}\n"
                f"Resposta do usuário: {user}\n"
                "Apenas o número."
            )
            resp = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0
            )
            import re
            m = re.search(r"(\d+(\.\d+)?)", resp.choices[0].message.content)
            if m:
                return jsonify({"score": float(m.group(1))})
        except Exception:
            pass  # cai no fallback local

    # fallback local (não-semântico, mas útil para continuar testando)
    return jsonify({"score": similarity_percent(correct, user)})

if __name__ == "__main__":
    # host 0.0.0.0 facilita rodar em rede local; porta 5000 padrão
    app.run(debug=True, host="0.0.0.0", port=5000)