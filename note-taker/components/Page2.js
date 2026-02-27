import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TopBanner from "./Top_Banner";


export default function Page2() {
  return (
    <View style={styles.container}>
    <TopBanner/>
      <Text style={styles.text}>Add task</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
  },
});