
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

// Importa as telas
import GeradorQuiz from "../app/(tabs)/index";
import Resultados from "../app/(tabs)/resultados";
import Voz from "../app/(tabs)/voz";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    
      <Stack.Navigator initialRouteName="GeradorQuiz" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GeradorQuiz" component={GeradorQuiz} />
        <Stack.Screen name="Voz" component={Voz} />
        <Stack.Screen name="Resultados" component={Resultados} />
      </Stack.Navigator>
    
  );
}

