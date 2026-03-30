import { Audio } from "expo-av";
import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Voz({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  // 🎙️ Iniciar gravação
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permissão negada para usar o microfone!");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
    }
  };

  // ⏹️ Parar gravação (gera transcrição simulada)
  const stopRecording = async () => {
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    setRecording(null);

    // 🔸 Transcrição simulada (só pra teste)
    setTranscript("O tema principal é sobre inteligência artificial em aplicativos.");
  };

  // ✅ Enviar resposta (navegar para resultados)
  const sendAnswer = () => {
    if (!transcript) {
      Alert.alert("Você precisa gravar antes de enviar!");
      return;
    }

    navigation.navigate("Resultados", {
      question: "Qual é o tema central do texto?",
      answer: transcript,
      score: "80%",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Responda Por Voz</Text>

      <View style={styles.questionBox}>
        <Text style={styles.questionTitle}>Pergunta nº 1</Text>
        <Text style={styles.questionText}>Qual é o tema central do texto?</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isRecording ? styles.stopButton : styles.recordButton]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? "⏹️ Parar Gravação" : "🎙️ Gravar Resposta"}
        </Text>
      </TouchableOpacity>

      {transcript ? (
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>Transcrição:</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.sendButton} onPress={sendAnswer}>
        <Text style={styles.buttonText}>✅ Enviar Resposta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  questionBox: {
    backgroundColor: "#E6E3E3",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  questionText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 15,
  },
  recordButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#E53935",
  },
  sendButton: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  transcriptBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 15,
    width: "90%",
    marginVertical: 10,
  },
  transcriptLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  transcriptText: {
    color: "#333",
  },
  backButton: {
    marginTop: 20,
  },
  backText: {
    color: "#4A90E2",
    fontWeight: "bold",
  },
});
