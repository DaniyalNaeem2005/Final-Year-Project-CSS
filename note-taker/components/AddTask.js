import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import TopBanner from "./Top_Banner";

export default function Page2({ navigation }) {
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState("Study");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const saveTask = async () => {
    if (!taskName.trim()) {
      Alert.alert("Validation", "Task Name is required");
      return;
    }

    if (!dueDate.trim()) {
      Alert.alert("Validation", "Please enter a due date");
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      taskName,
      taskType,
      description,
      dueDate: dueDate, // now stored as string
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const existingTasks = await AsyncStorage.getItem("TASKS");
      const parsedTasks = existingTasks ? JSON.parse(existingTasks) : [];
      const updatedTasks = [...parsedTasks, newTask];

      await AsyncStorage.setItem("TASKS", JSON.stringify(updatedTasks));

      setTaskName("");
      setTaskType("Study");
      setDescription("");
      setDueDate("");

      Alert.alert("Success", "Task Added Successfully");
      navigation.navigate("Profile");
    } catch (error) {
      console.log("Error saving task:", error);
    }
  };

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

      {/* Description */}
      <Text style={styles.label}>Task Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        multiline
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the task"
        placeholderTextColor="#999"
      />

      {/* Due Date Manual Entry */}
      <Text style={styles.label}>Due Date</Text>
      <TextInput
        style={styles.input}
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="Enter Due Date (DD/MM/YYYY)"
        placeholderTextColor="#999"
      />

      {/* 🚫 Date Picker Temporarily Disabled */}
      {/*
      {showPicker && (
        <DateTimePicker
          value={dueDate || today}
          mode="date"
          display="default"
          minimumDate={today}
          onChange={onDateChange}
        />
      )}
      */}

      {/* CTA Button */}
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

  dateInput: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
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