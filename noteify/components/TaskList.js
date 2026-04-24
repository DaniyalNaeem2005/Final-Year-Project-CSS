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
import { logAllStorage } from "./storageDebugger";

export default function TaskList() {
  const [tasks, setTasks] = useState([]); // all tasks from storage
  const [groupedTasks, setGroupedTasks] = useState(null); //AI grouped tasks
  const [loadingAI, setLoadingAI] = useState(false); //loading state for AI
  const [nearbyInfo, setNearbyInfo] = useState({}); //nearby places data
  const navigation = useNavigation();
  const [filter, setFilter] = useState("All"); 

// Dashboard
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

//load nearby places data
  const loadNearbyData = async (tasksList) => {
    const results = {};

    await Promise.all(
      tasksList.map(async (task) => {
        const data = await checkNearbyForTask(task);
        if (data) results[task.id] = data;
      })
    );

    setNearbyInfo(results);
  };

//Load tasks from storage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("TASKS");
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      await logAllStorage();
      setTasks(parsedTasks);
      loadNearbyData(parsedTasks);
    } catch (error) {
      console.log("Error loading tasks:", error);
    }
  };

// reload tasks whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

// Delete Task
  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter((task) => String(task.id) !== String(taskId));
    setTasks(updatedTasks);
    setGroupedTasks(null); //reset AI grouping  
    await AsyncStorage.setItem("TASKS", JSON.stringify(updatedTasks));
    loadNearbyData(updatedTasks); //refresh nearby places
  };

// Mark task as done
  const markTaskDone = async (taskId) => {
    const updatedTasks = tasks.map((task) =>
      String(task.id) === String(taskId)
        ? { ...task, completed: true }
        : task
    );

    setTasks(updatedTasks);
    setGroupedTasks(null);

    await AsyncStorage.setItem("TASKS", JSON.stringify(updatedTasks));
  };

// AI Task organizer
  const organizeTasks = async () => {
    if (tasks.length === 0) {
      alert("No tasks available");
      return;
    }

    setLoadingAI(true);

    try {
      // send tasks to AI for grouping
      const result = await groupTasksWithAI(tasks, "priority");
      if (result && typeof result === "object") {
        setGroupedTasks(result);
      }
    } catch (error) {
      alert("Something went wrong.");
    }

    setLoadingAI(false);
  };

// rest back to normal task view
  const revertTasks = () => setGroupedTasks(null);

//  Task Card
  const renderTaskCard = (item) => (
    <View style={styles.card} key={item.id}>
      <Text style={styles.title}>{item.taskName}</Text>
      <Text style={styles.meta}>Type: {item.taskType}</Text>
      <Text style={styles.meta}>Due: {item.dueDate}</Text>

      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      {nearbyInfo[item.id]?.places?.length > 0 && (
        <>
          <TouchableOpacity
            onPress={() => {
              const places = nearbyInfo[item.id].places;

              if (Platform.OS === "web") {
                Linking.openURL(places[0]?.mapLink);
              } else {
                navigation.navigate("Map", {
                  places,
                  taskName: item.taskName,
                });
              }
            }}
          >
            
          </TouchableOpacity>
        </>
      )}

      {!item.completed && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => markTaskDone(item.id)}
        >
          <Text style={styles.doneText}>✔ Task Done</Text>
        </TouchableOpacity>
      )}

      {item.completed && (
        <Text style={{ color: "#4CAF50", marginTop: 5 }}>
          ✅ Completed
        </Text>
      )}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(item.id)}
      >
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // Dashboard Header
  const renderDashboard = () => (
    <View style={styles.dashboard}>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalTasks}</Text>
        <Text style={styles.statLabel}>Total Tasks</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{completedTasks}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{pendingTasks}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{completionRate}%</Text>
        <Text style={styles.statLabel}>Progress</Text>
      </View>

    </View>
  );

  const filteredTasks = tasks.filter((task) => {
  if (filter === "All") return true;
  if (filter === "In Progress") return !task.completed;
  return true;
});

  return (
    <ScrollView style={styles.container}>
      <TopBanner />

      <Text style={styles.heading}>Dashboard</Text>

      {renderDashboard()}


      <View style={styles.filterRow}>
  <TouchableOpacity onPress={() => setFilter("All")}>
    <Text style={[styles.filterBtn, filter === "All" && styles.activeFilter]}>
      All
    </Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => setFilter("In Progress")}>
    <Text
      style={[
        styles.filterBtn,
        filter === "In Progress" && styles.activeFilter,
      ]}
    >
      In Progress
    </Text>
  </TouchableOpacity>
</View>

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
          {groupedTasks.High?.map(renderTaskCard)}
          {groupedTasks.Medium?.map(renderTaskCard)}
          {groupedTasks.Low?.map(renderTaskCard)}
        </>
      ) : (
        filteredTasks.map(renderTaskCard)
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
doneButton: {
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  backgroundColor: "#9E090F",
  alignItems: "center",
},

doneText: {
  color: "#fff",
  fontWeight: "bold",
},
filterRow: {
  flexDirection: "row",
  justifyContent: "space-around",
  marginVertical: 10,
},

filterBtn: {
  fontSize: 14,
  color: "#555",
  padding: 8,
},

activeFilter: {
  color: "#9E090F",
  fontWeight: "bold",
  borderBottomWidth: 2,
  borderBottomColor: "#9E090F",
},
dashboard: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: 15,
  paddingHorizontal: 10,
},

statCard: {
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 12,
  alignItems: "center",
  width: "23%",
  elevation: 3,
},

statNumber: {
  fontSize: 18,
  fontWeight: "bold",
  color: "#333",
},

statLabel: {
  fontSize: 11,
  color: "#777",
  marginTop: 3,
},
});
