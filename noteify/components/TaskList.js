import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import TopBanner from "./Top_Banner";
import { groupTasksWithAI } from "./aiService";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [groupedTasks, setGroupedTasks] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [organizeType, setOrganizeType] = useState("priority");

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
  // DELETE TASK
  // ===============================
  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(
      (task) => String(task.id) !== String(taskId)
    );

    setTasks(updatedTasks);
    setGroupedTasks(null);

    await AsyncStorage.setItem("TASKS", JSON.stringify(updatedTasks));
  };

  // ===============================
  // AI ORGANIZE
  // ===============================
  const organizeTasks = async () => {
  console.log("🟢 Organize button clicked");

  if (tasks.length === 0) {
    console.log("❌ No tasks found");
    alert("No tasks available");
    return;
  }

  if (loadingAI) {
    console.log("⚠️ Already loading");
    return;
  }

  setLoadingAI(true);

  try {
    console.log("📡 Calling AI...");

    const result = await groupTasksWithAI(tasks, organizeType);

    console.log("📥 AI RESULT RECEIVED:", result);

    if (result && typeof result === "object") {
      console.log("✅ Setting grouped tasks");
      setGroupedTasks(result);
    } else {
      console.log("❌ Invalid result from AI");
      alert("AI failed to organize tasks.");
    }
  } catch (error) {
    console.log("🔥 ERROR IN ORGANIZE:", error);
    alert("Something went wrong.");
  }

  setLoadingAI(false);
};

  // ===============================
  // REVERT TO NORMAL
  // ===============================
  const revertTasks = () => {
    setGroupedTasks(null);
  };

  // ===============================
  // NORMAL CARD
  // ===============================
  const renderTaskCard = (item) => (
    <View style={styles.card} key={item.id}>
      <Text style={styles.title}>{item.taskName}</Text>
      <Text style={styles.meta}>Type: {item.taskType}</Text>
      <Text style={styles.meta}>Due: {item.dueDate}</Text>

      {item.description ? (
        <Text style={styles.description}>{item.description}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <TopBanner />

      <Text style={styles.heading}>Dashboard</Text>

      {/* ===============================
          ORGANIZE OPTIONS
      =============================== */}
      <View style={styles.optionsRow}>
        {["priority", "time", "category", "smart"].map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setOrganizeType(type)}
            style={[
              styles.optionBtn,
              organizeType === type && styles.activeOption,
            ]}
          >
            <Text style={styles.optionText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===============================
          ORGANIZE BUTTON
      =============================== */}
      <TouchableOpacity style={styles.aiButton} onPress={organizeTasks}>
        <Text style={styles.aiText}>
          {loadingAI
            ? "Organizing..."
            : `✨ Organize by ${organizeType}`}
        </Text>
      </TouchableOpacity>

      {/* ===============================
          REVERT BUTTON
      =============================== */}
      {groupedTasks && (
        <TouchableOpacity style={styles.revertButton} onPress={revertTasks}>
          <Text style={styles.revertText}>↩ Revert</Text>
        </TouchableOpacity>
      )}

      {/* ===============================
          AI GROUPED VIEW
      =============================== */}
      {groupedTasks ? (
        Object.keys(groupedTasks).map((group) => (
          <View key={group}>
            <Text style={styles.groupTitle}>{group}</Text>

            {groupedTasks[group].map((task, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.title}>{task.taskName}</Text>
                <Text style={styles.meta}>Due: {task.dueDate}</Text>
              </View>
            ))}
          </View>
        ))
      ) : (
        <>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>No tasks added yet.</Text>
          ) : (
            tasks.map((item) => renderTaskCard(item))
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E2",
    paddingHorizontal: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#9E090F",
  },

  optionsRow: {
    flexDirection: "row",
    marginTop: 15,
  },

  optionBtn: {
    backgroundColor: "#ccc",
    padding: 8,
    marginRight: 5,
    borderRadius: 10,
  },

  activeOption: {
    backgroundColor: "#000",
  },

  optionText: {
    color: "#fff",
    fontSize: 12,
  },

  aiButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },

  aiText: {
    color: "#fff",
    fontWeight: "bold",
  },

  revertButton: {
    backgroundColor: "#9E090F",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  revertText: {
    color: "#fff",
    fontWeight: "bold",
  },

  groupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    color: "#9E090F",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
    marginTop: 10,
    elevation: 3,
  },

  title: {
    fontWeight: "bold",
    color: "#9E090F",
  },

  meta: {
    fontSize: 12,
    marginTop: 3,
  },

  description: {
    marginTop: 5,
    fontSize: 12,
  },

  deleteButton: {
    marginTop: 10,
    backgroundColor: "#9E090F",
    padding: 8,
    borderRadius: 10,
  },

  deleteText: {
    color: "#fff",
    textAlign: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#777",
  },
});