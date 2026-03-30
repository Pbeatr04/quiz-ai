import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Resultados({ route }) {
  const { pergunta, resposta, porcentagem } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.text}>Resultados</Text>

        <View style={styles.column}>
          <Text style={styles.text2}>Pergunta:</Text>
          <Text style={styles.text3}>{pergunta}</Text>
        </View>

        <View style={styles.column2}>
          <Text style={styles.text4}>Sua resposta (Transcrita)</Text>
          <Text style={styles.text5}>{resposta}</Text>
        </View>

        <View style={styles.buttonColumn}>
          <Text style={styles.text6}>Porcentagem</Text>
          <Text style={styles.text7}>{porcentagem}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1 },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 40,
  },
  column: {
    alignItems: "center",
    backgroundColor: "#E6E3E3",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 30,
    marginBottom: 20,
  },
  column2: {
    alignItems: "center",
    backgroundColor: "#E6E3E3",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 30,
    marginBottom: 25,
  },
  buttonColumn: {
    alignItems: "center",
    backgroundColor: "#E6E3E3",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 60,
  },
  text2: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  text3: { fontSize: 13, textAlign: "center" },
  text4: { fontSize: 14, fontWeight: "bold", marginBottom: 10 },
  text5: { fontSize: 13, textAlign: "center" },
  text6: { fontSize: 14, fontWeight: "bold" },
  text7: { fontSize: 24, fontWeight: "bold" },
});
