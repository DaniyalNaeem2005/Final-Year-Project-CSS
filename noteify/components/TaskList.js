import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import TopBanner from "./Top_Banner";
import { groupTasksWithAI } from "./aiService";
import { checkNearbyForTask } from "./locationService";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [groupedTasks, setGroupedTasks] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [organizeType, setOrganizeType] = useState("priority");
  const [nearbyInfo, setNearbyInfo] = useState({});

  const navigation = useNavigation();

  // ===============================
  // LOAD NEARBY DATA
  // ===============================
  const loadNearbyData = async (tasksList) => {
    const results = {};

    await Promise.all(
      tasksList.map(async (task) => {
        const data = await checkNearbyForTask(task);
        if (data) {
          results[task.id] = data;
        }
      })
    );

    console.log("✅ Nearby Results:", results);

    setNearbyInfo(results);
  };

  // ===============================
  // LOAD TASKS
  // ===============================
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("TASKS");
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(parsedTasks);

      loadNearbyData(parsedTasks);
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
    const updatedTasks = tasks.filter((task) => String(task.id) !== String(taskId));
    setTasks(updatedTasks);
    setGroupedTasks(null);
    await AsyncStorage.setItem("TASKS", JSON.stringify(updatedTasks));
    loadNearbyData(updatedTasks);
  };

  // ===============================
  // AI ORGANIZE
  // ===============================
  const organizeTasks = async () => {
    if (tasks.length === 0) {
      alert("No tasks available");
      return;
    }

    if (loadingAI) return;

    setLoadingAI(true);

    try {
      const result = await groupTasksWithAI(tasks, organizeType);
      if (result && typeof result === "object") {
        setGroupedTasks(result);
      } else {
        alert("AI failed to organize tasks.");
      }
    } catch (error) {
      alert("Something went wrong.");
    }

    setLoadingAI(false);
  };

  const revertTasks = () => setGroupedTasks(null);

  // ===============================
  // TASK CARD
  // ===============================
  const renderTaskCard = (item) => (
    <View style={styles.card} key={item.id}>
      <Text style={styles.title}>{item.taskName}</Text>
      <Text style={styles.meta}>Type: {item.taskType}</Text>
      <Text style={styles.meta}>Due: {item.dueDate}</Text>

      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      {/* ✅ NEARBY INFO CLICKABLE */}
      {nearbyInfo[item.id] && nearbyInfo[item.id].places?.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            const places = nearbyInfo[item.id].places;
            if (Platform.OS === "web") {
              // Web: open Google Maps
              const { lat, lon, name } = places[0];
              const mapLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${name}`;
              Linking.openURL(mapLink);
            } else {
              // Mobile: navigate to Map tab
              navigation.navigate("Map", { places, taskName: item.taskName });
            }
          }}
        >
          <Text style={{ color: "green", marginTop: 5 }}>
            📍 {nearbyInfo[item.id].count} {nearbyInfo[item.id].type} place
            {nearbyInfo[item.id].count > 1 ? "s" : ""} nearby
          </Text>
        </TouchableOpacity>
      )}

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

      <TouchableOpacity style={styles.aiButton} onPress={organizeTasks}>
        <Text style={styles.aiText}>
          {loadingAI ? "Organizing..." : "✨ Organize Tasks"}
        </Text>
      </TouchableOpacity>

      {groupedTasks && (
        <TouchableOpacity style={styles.revertButton} onPress={revertTasks}>
          <Text style={styles.revertText}>↩ Revert</Text>
        </TouchableOpacity>
      )}

      {tasks.length === 0 ? (
  <Text style={styles.emptyText}>No tasks added yet.</Text>
) : groupedTasks ? (
  <>
    {/* HIGH PRIORITY */}
    {groupedTasks.High?.length > 0 && (
      <>
        <Text style={styles.groupHeader}>🔥 High Priority</Text>
        {groupedTasks.High.map((item) => renderTaskCard(item))}
      </>
    )}

    {/* MEDIUM PRIORITY */}
    {groupedTasks.Medium?.length > 0 && (
      <>
        <Text style={styles.groupHeader}>⚡ Medium Priority</Text>
        {groupedTasks.Medium.map((item) => renderTaskCard(item))}
      </>
    )}

    {/* LOW PRIORITY */}
    {groupedTasks.Low?.length > 0 && (
      <>
        <Text style={styles.groupHeader}>🌱 Low Priority</Text>
        {groupedTasks.Low.map((item) => renderTaskCard(item))}
      </>
    )}
  </>
) : (
  tasks.map((item) => renderTaskCard(item))
)}
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E2",
    paddingHorizontal: 20,
    marginBottom: '15%'
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
  groupHeader: {
  fontSize: 18,
  fontWeight: "bold",
  marginTop: 15,
  marginBottom: 5,
  color: "#333",
},
});