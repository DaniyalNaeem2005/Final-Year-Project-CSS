import React from "react";
import { View, Text, StyleSheet, Image, SafeAreaView } from "react-native";

export default function TopBanner() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.banner}>
        <Image
          source={require("../assets/notes_logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>Noteify</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#9E090F",
  },
  banner: {
    width: "100%",
    height: 50,
    backgroundColor: "#FFF4E2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 10,
  },
  title: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});