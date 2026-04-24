import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopBanner from "./Top_Banner";
import { useFocusEffect } from "@react-navigation/native";

export default function HomePage() {
  // controls the next week and previous week CTAs
  // 0 = current week
  // +1 = next week, -1 = last week
  const [weekOffset, setWeekOffset] = useState(0);

  // All tasks loaded from AsynchStorage
  const [tasks, setTasks] = useState([]);

  // Today's date will be hightlighted
  const today = new Date();

// Load tasks from storage
  const loadTasks = async () => {
    try {
      //retrieve stored tasks using key 'TASKS"
      const stored = await AsyncStorage.getItem("TASKS");
      //converts string to JS array
      const parsed = stored ? JSON.parse(stored) : [];

      parsed.forEach((t, i) => {
        console.log(`TASK ${i + 1}:`, t.taskName, "| Due:", t.dueDate);
      });

// Save tasks to state
      setTasks(parsed);
    } catch (error) {
      console.log("ERROR LOADING TASKS:", error);
    }
  };

  // Reload tasks every time this screen is opened
  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

//  Get the start of the week starting from Monday
  const getStartOfWeek = (baseDate) => {
    // Create a copy to avoid mutating original date
    const date = new Date(baseDate);

    // Get day of the Week 0 = Sunday, 1 = Monday
    const day = date.getDay();

    // Convert so week starts from Monday
    // sunday (0) -> 6
    // Monday (1) -> 0
    const diff = (day + 6) % 7;

// Move date backward to Monday
    date.setDate(date.getDate() - diff);
    return date;
  };

// Converts date from YYYY-MM-DD to DD/MM/YYYY
  const parseDate = (dateString, taskName = "UNKNOWN") => {
    if (!dateString) {
      console.log("Missing date for task:", taskName);
      return null;
    }

    // YYYY-MM-DD
    if (dateString.includes("-")) {
      const [y, m, d] = dateString.split("-").map(Number);

      // Month is 0 based in JS
      const result = new Date(y, m - 1, d);
      return result;
    }

    // DD/MM/YYYY
    // Splits the string into parts using "/"
    if (dateString.includes("/")) {
      const [d, m, y] = dateString.split("/").map(Number);
      // Converts string value to numbers
      // Creates a JS object
      // Since Jan is 0, we subtract 1 from month
      const result = new Date(y, m - 1, d);
      return result;
    }
    return null;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;

// Checks to see if two days are the same day
// JS dates include time thus splitting and verifying is a better way
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

// Calculates the current week range
  const baseDate = new Date();
  baseDate.setDate(today.getDate() + weekOffset * 7);

  const startOfWeek = getStartOfWeek(baseDate);

// Calculates an array of 7 days for the week view 
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    return {
      fullDate: date,
      dateNumber: date.getDate(),
      dayLetter: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    };
  });

// Gets tasks for a specific day
//This filters and returns only the tasks that belong to a specific day
  const getTasksForDay = (dayDate) => {
    return tasks.filter((task) => {
      //ParseDate converts the stored dueDate string into a JS object (Tue Apr 22 2026)
      const taskDate = parseDate(task.dueDate, task.taskName);
      //Checks if 2 the due date set by the user and the date object represent the same Calendar Day
      const match = isSameDay(taskDate, dayDate);
      return match;
    });
  };

//Converts a Date object into a readable string
//April 2026
  const monthYear = startOfWeek.toLocaleString("default", {
  month: "long",
  year: "numeric",
});

//Extracts the month name from the Date object
const monthName = startOfWeek.toLocaleString("default", {
  month: "long",
});

  return (
    <ScrollView style={styles.container}>
      <TopBanner />

      <Text style={styles.scheduleHeading}>Schedule</Text>


      {/* WEEK NAV */}
      <View style={styles.weekHeader}>
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
          <Text style={styles.weekText}>Previous Week</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
          <Text style={styles.weekText}>Next Week</Text>
        </TouchableOpacity>
      </View>
            <Text style={styles.monthText}>{monthName}</Text>


      {/* Week Header Row */}
      <View style={styles.weekContainer}>
        <View style={styles.daysRow}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayItem}>
              <Text style={styles.dateNumber}>{day.dateNumber}</Text>
              <Text style={styles.dayLetter}>{day.dayLetter}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        {weekDays.map((day, index) => {
          const dailyTasks = getTasksForDay(day.fullDate);

          console.log(
            `Day: ${day.dayLetter} ${day.dateNumber} → Tasks:`,
            dailyTasks.map((t) => t.taskName)
          );

          return (
            <View key={index} style={styles.calendarRow}>
              <View style={styles.dateWrapper}>
                <Text style={styles.calendarDate}>
                  {day.dayLetter} {day.dateNumber}
                </Text>
              </View>

              <View style={styles.taskContainer}>
                {dailyTasks.length === 0 ? (
                  <Text style={styles.noTask}>No tasks</Text>
                ) : (
                  dailyTasks.map((task) => (
                    <View key={task.id} style={styles.taskBubble}>
                      <Text style={styles.taskText}>{task.taskName}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E2",
    marginBottom: 50,
  },

  scheduleHeading: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 20,
    marginTop: 15,
  },

  weekContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 4,
  },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  weekText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9E090F",
    marginRight: 12,
    marginLeft: 12
  },

  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  dayItem: {
    alignItems: "center",
  },

  dateNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  dayLetter: {
    fontSize: 13,
    color: "#777",
  },

  calendarContainer: {
    marginHorizontal: 20,
    marginTop: 7,
    padding: 15,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 4,
  },

  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  dateWrapper: {
    width: 60,
  },

  calendarDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  taskContainer: {
    flex: 1,
  },

  taskBubble: {
    backgroundColor: "#9E090F",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 5,
    alignSelf: "flex-start",
  },

  taskText: {
    color: "#fff",
    fontSize: 12,
  },

  noTask: {
    fontSize: 12,
    color: "#aaa",
  },
  monthText: {
  fontSize: 18,
  fontWeight: "600",
  textAlign: "center",
  color: "#333",
},
});
