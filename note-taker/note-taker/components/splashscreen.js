import React from "react";
import { View, Text, StyleSheet, ActivityIndicator,Image } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/notes_logo.png')} style={styles.image} />
      <Text style={styles.title}>TrustBite</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E2",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,

  },
});