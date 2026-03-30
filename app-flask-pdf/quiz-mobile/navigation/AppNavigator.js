

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GeradorQuiz from "../app/(tabs)/index"; // Tela 1
import ResponderVoz from "../app/(tabs)/ResponderVoz"; // Tela 2
import Resultados from "../app/(tabs)/Resultados";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GeradorQuiz">
        <Stack.Screen name="GeradorQuiz" component={GeradorQuiz} options={{ title: "Gerar Perguntas" }} />
        <Stack.Screen name="ResponderVoz" component={ResponderVoz} options={{ title: "Responda por Voz" }} />
          <Stack.Screen name="Resultados" component={Resultados} />

      </Stack.Navigator>
      
    </NavigationContainer>
  );
}
