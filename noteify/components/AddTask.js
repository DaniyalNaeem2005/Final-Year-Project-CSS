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
  const [dueTime, setDueTime] = useState("Anytime");

// Converting the date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    //If input is null returns empty
    if (!dateString) return "";

//Split the string using a seperator '-'
//2026-04-22 -> ["2026", "04", "22"]
    const [year, month, day] = dateString.split("-");
    //Rearrange values into DD/MM/YYYY format
    // ` used to easily input values in the variables
    return `${day}/${month}/${year}`;
  };

// Saves tasks to the local AsynchStorage
  const saveTask = async () => {
    //.trim() removes extra spaces from start/end
    //If after trmiinig the string is empty -> invaid input
    if (!taskName.trim()) {
      Alert.alert("Validation", "Task Name is required");
      return;
    }

  // Check if due date is empty
    if (!dueDate.trim()) {
      Alert.alert("Validation", "Please select a due date");
    //  Stop execution if due date is missing
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
  dueTime, // NEW
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
    <ScrollView
  style={styles.container}
  contentContainerStyle={{ paddingBottom: 50 }}
  showsVerticalScrollIndicator={false}
>
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
          <Picker.Item label="Study" value="Study" />
          <Picker.Item label="Personal" value="Personal" />
          <Picker.Item label="Work" value="Work" />
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
          editable={false}
          readOnly={true}
          onChangeText={setDueDate}
          placeholder="DD/MM/YYYY"
          placeholderTextColor="#999"
          onKeyDown={(e) => e.preventDefault()}
        />
      )}

      {/* Due Time */}
<Text style={styles.label}>Due Time</Text>

{Platform.OS === "web" ? (
  <div style={{ width: "90%" }}>
    <input
      type="time"
      onChange={(e) => setDueTime(e.target.value)}
      style={{
        width: "100%",
        padding: 15,
        borderRadius: 15,
        border: "1px solid #eee",
        fontSize: 14,
        marginBottom: 10,
      }}
    />

    <TouchableOpacity onPress={() => setDueTime("Anytime")}>
      <Text style={{ color: "#9E090F", fontWeight: "600" }}>
        No specific time (Anytime)
      </Text>
    </TouchableOpacity>
  </div>
) : (
  <View style={styles.dropdownWrapper}>
    <Picker
      selectedValue={dueTime}
      onValueChange={(itemValue) => setDueTime(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="Anytime" value="Anytime" />
      <Picker.Item label="09:00 AM" value="09:00 AM" />
      <Picker.Item label="12:00 PM" value="12:00 PM" />
      <Picker.Item label="03:00 PM" value="03:00 PM" />
      <Picker.Item label="05:00 PM" value="05:00 PM" />
      <Picker.Item label="08:00 PM" value="08:00 PM" />
    </Picker>
  </View>
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

