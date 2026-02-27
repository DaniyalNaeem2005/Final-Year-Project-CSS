import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import TopBanner from "./Top_Banner";

export default function Page3() {
  const [tasks, setTasks] = useState([]);

  // ===============================
  // LOAD TASKS
  // ===============================
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("TASKS");
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(parsedTasks);
    } catch (error) {
      console.log("Error loading tasks:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  // ===============================
  // DELETE TASK (NO ALERT)
  // ===============================
  const deleteTask = async (taskId) => {
    console.log("Deleting:", taskId);

    const updatedTasks = tasks.filter(
      (task) => String(task.id) !== String(taskId)
    );

    console.log("After filter:", updatedTasks);

    // Update UI immediately
    setTasks(updatedTasks);

    // Update storage
    await AsyncStorage.setItem(
      "TASKS",
      JSON.stringify(updatedTasks)
    );
  };

  // ===============================
  // RENDER CARD
  // ===============================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{item.taskName}</Text>
        <Text style={styles.meta}>Type: {item.taskType}</Text>
        <Text style={styles.meta}>Due: {item.dueDate}</Text>
        {item.description ? (
          <Text style={styles.description}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBanner />

      <Text style={styles.heading}>Dashboard</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        extraData={tasks}   // 🔥 Forces re-render
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No tasks added yet.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E2",
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
    marginTop: 15,
    color: "#9E090F",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#eee",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#9E090F",
  },

  meta: {
    fontSize: 13,
    marginTop: 4,
    color: "#444",
  },

  description: {
    marginTop: 8,
    fontSize: 13,
    color: "#666",
  },

  deleteButton: {
    marginTop: 12,
    backgroundColor: "#9E090F",
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
  },

  deleteText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 60,
    color: "#777",
    fontSize: 15,
  },
});