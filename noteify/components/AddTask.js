import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import TopBanner from "./Top_Banner";

export default function Page2({ navigation }) {

  // Storing variables for storing user input
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState("Study");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

// Converting the date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

// Saves tasks to the local AsynchStorage
  const saveTask = async () => {
    if (!taskName.trim()) {
      Alert.alert("Validation", "Task Name is required");
      return;
    }

  // Check if due date is empty
    if (!dueDate.trim()) {
      Alert.alert("Validation", "Please select a due date");
      return;
    }

// creates a new task object
    const newTask = {
      id: Date.now().toString(),
      taskName,
      taskType,
      description,
      priority: "Medium",
      dueDate, 
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      // Get existing tasks from storage
      const existingTasks = await AsyncStorage.getItem("TASKS");
      const parsedTasks = existingTasks ? JSON.parse(existingTasks) : [];

      // Add existing tasks from storage
      const updatedTasks = [...parsedTasks, newTask];

// Save back to the sotrage
      await AsyncStorage.setItem("TASKS", JSON.stringify(updatedTasks));

// Reset input fields after saving
      setTaskName("");
      setTaskType("Study");
      setDescription("");
      setDueDate("");

// Show success message
      Alert.alert("Success", "Task Added Successfully");
      // Navigate to the Homepage
      navigation.navigate("Home");
    } catch (error) {
      console.log("Error saving task:", error);
    }
  };

// Showing the tasks on the homepage
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TopBanner />

      <Text style={styles.heading}>Add Task</Text>

      {/* Task Name */}
      <Text style={styles.label}>Task Name</Text>
      <TextInput
        style={styles.input}
        value={taskName}
        onChangeText={setTaskName}
        placeholder="Enter task name"
        placeholderTextColor="#999"
      />

      {/* Task Type */}
      <Text style={styles.label}>Task Type</Text>
      <View style={styles.dropdownWrapper}>
        <Picker
          selectedValue={taskType}
          onValueChange={(itemValue) => setTaskType(itemValue)}
          dropdownIconColor="#9E090F"
          style={styles.picker}
        >
          <Picker.Item label="📚 Study" value="Study" />
          <Picker.Item label="🏠 Personal" value="Personal" />
          <Picker.Item label="💼 Work" value="Work" />
        </Picker>
      </View>

      {/* Task Description */}
      <Text style={styles.label}>Task Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the task"
        placeholderTextColor="#999"
      />

      {/* Due Date Dropdown */}
      <Text style={styles.label}>Due Date</Text>

      {Platform.OS === "web" ? (
        <input
          type="date"
          onChange={(e) => {
            setDueDate(formatDate(e.target.value));
          }}
          style={{
            width: "90%",
            padding: 15,
            borderRadius: 15,
            border: "1px solid #eee",
            fontSize: 14,
          }}
        />
      ) : (
        <TextInput
          style={styles.input}
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#999"
        />
      )}

      <TouchableOpacity style={styles.button} onPress={saveTask}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
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
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 15,
    color: "#9E090F",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 5,
    color: "#333",
  },

  input: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 15,
    fontSize: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },

  multiline: {
    height: 50,
    textAlignVertical: "top",
  },

  dropdownWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
  },

  picker: {
    height: 50,
  },

  button: {
    backgroundColor: "#9E090F",
    padding: 18,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
    elevation: 4,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

