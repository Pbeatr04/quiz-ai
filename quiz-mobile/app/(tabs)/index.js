import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

export default function GeradorQuiz({ navigation }) {
  const [file, setFile] = useState(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      } else {
        Alert.alert("Nenhum arquivo selecionado");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro ao selecionar arquivo");
    }
  };

  const uploadPDF = async () => {
    if (!file) {
      Alert.alert("Escolha um arquivo primeiro!");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: "application/pdf",
      name: file.name || "documento.pdf",
    });

    try {
      const response = await fetch("http://192.168.0.15:5000/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (data.questions) {
        navigation.navigate("Voz", { questions: data.questions });
      } else {
        Alert.alert("Erro", data.error || "Erro ao gerar perguntas.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro de conexão com o servidor");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Gerador de Quiz Interativo</Text>

        <TouchableOpacity style={styles.button} onPress={pickDocument}>
          <Text style={styles.buttonText}>📄 Escolher arquivo (PDF)</Text>
        </TouchableOpacity>

        <Text style={styles.fileText}>
          {file ? file.name : "Nenhum arquivo selecionado"}
        </Text>

        <TouchableOpacity style={styles.generateButton} onPress={uploadPDF}>
          <Text style={styles.buttonText}>⚡ Gerar Perguntas</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#222",
  },
  button: {
    backgroundColor: "#2C2C2C",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  generateButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 16,
    borderRadius: 10,
    marginVertical: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  fileText: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    fontSize: 13,
  },
});
