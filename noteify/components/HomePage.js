import React, { useState, useEffect, useCallback } from "react";
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [tasks, setTasks] = useState([]);

  const today = new Date();

  // ==============================
  // LOAD + DEBUG TASKS
  // ==============================
  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem("TASKS");

      console.log("🟡 RAW AsyncStorage TASKS:", stored);

      const parsed = stored ? JSON.parse(stored) : [];

      console.log("🟢 PARSED TASKS:", parsed);

      console.log("📊 TOTAL TASKS LOADED:", parsed.length);

      parsed.forEach((t, i) => {
        console.log(`➡️ TASK ${i + 1}:`, t.taskName, "| Due:", t.dueDate);
      });

      setTasks(parsed);
    } catch (error) {
      console.log("🔴 ERROR LOADING TASKS:", error);
    }
  };

  // 🔥 IMPORTANT: reload every time screen opens
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 HomePage focused → reloading tasks");
      loadTasks();
    }, [])
  );

  // ==============================
  // WEEK START
  // ==============================
  const getStartOfWeek = (baseDate) => {
    const date = new Date(baseDate);
    const day = date.getDay();
    const diff = (day + 6) % 7;
    date.setDate(date.getDate() - diff);
    return date;
  };

  // ==============================
  // SAFE DATE PARSER (DEBUG READY)
  // ==============================
  const parseDate = (dateString, taskName = "UNKNOWN") => {
    if (!dateString) {
      console.log("⚠️ Missing date for task:", taskName);
      return null;
    }

    console.log("🧪 Parsing date:", dateString, "| Task:", taskName);

    // YYYY-MM-DD
    if (dateString.includes("-")) {
      const [y, m, d] = dateString.split("-").map(Number);
      const result = new Date(y, m - 1, d);
      console.log("✔ Converted ISO → Date:", result.toDateString());
      return result;
    }

    // DD/MM/YYYY
    if (dateString.includes("/")) {
      const [d, m, y] = dateString.split("/").map(Number);
      const result = new Date(y, m - 1, d);
      console.log("✔ Converted DD/MM/YYYY → Date:", result.toDateString());
      return result;
    }

    console.log("❌ Unknown date format:", dateString);
    return null;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;

    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // ==============================
  // WEEK CALC
  // ==============================
  const baseDate = new Date();
  baseDate.setDate(today.getDate() + weekOffset * 7);

  const startOfWeek = getStartOfWeek(baseDate);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    return {
      fullDate: date,
      dateNumber: date.getDate(),
      dayLetter: ["M", "T", "W", "Th", "F", "S", "S"][i],
    };
  });

  // ==============================
  // FILTER TASKS
  // ==============================
  const getTasksForDay = (dayDate) => {
    return tasks.filter((task) => {
      const taskDate = parseDate(task.dueDate, task.taskName);
      const match = isSameDay(taskDate, dayDate);

      console.log(
        `🔍 Checking ${task.taskName}:`,
        "taskDate =", taskDate,
        "| day =", dayDate.toDateString(),
        "| match =", match
      );

      return match;
    });
  };

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

      {/* WEEK BOX */}
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

      {/* CALENDAR */}
      <View style={styles.calendarContainer}>
        {weekDays.map((day, index) => {
          const dailyTasks = getTasksForDay(day.fullDate);

          console.log(
            `📅 Day: ${day.dayLetter} ${day.dateNumber} → Tasks:`,
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

/* ===== YOUR ORIGINAL STYLES (UNCHANGED) ===== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E2",
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
});





// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import TopBanner from "./Top_Banner";

// export default function HomePage() {
//   const [weekOffset, setWeekOffset] = useState(0);
//   const [tasks, setTasks] = useState([]);

//   const today = new Date();

//   // ===============================
//   // LOAD TASKS
//   // ===============================
//   const loadTasks = async () => {
//     const stored = await AsyncStorage.getItem("TASKS");
//     const parsed = stored ? JSON.parse(stored) : [];
//     setTasks(parsed);
//   };

//   useEffect(() => {
//     loadTasks();
//   }, []);

//   // ===============================
//   // DATE HELPERS
//   // ===============================
//   const getStartOfWeek = (baseDate) => {
//     const date = new Date(baseDate);
//     const day = date.getDay();
//     const diff = (day + 6) % 7; // Monday start
//     date.setDate(date.getDate() - diff);
//     return date;
//   };

//   const parseDate = (dateString) => {
//   if (!dateString) return null;

//   const [day, month, year] = dateString.split("/").map(Number);

//   return new Date(year, month - 1, day);
// };

//   const isSameDay = (d1, d2) => {
//   if (!d1 || !d2) return false;

//   return (
//     d1.getFullYear() === d2.getFullYear() &&
//     d1.getMonth() === d2.getMonth() &&
//     d1.getDate() === d2.getDate()
//   );
// }; 

//   // ===============================
//   // WEEK CALCULATION
//   // ===============================
//   const baseDate = new Date();
//   baseDate.setDate(today.getDate() + weekOffset * 7);

//   const startOfWeek = getStartOfWeek(baseDate);

//   const weekDays = Array.from({ length: 7 }).map((_, i) => {
//     const date = new Date(startOfWeek);
//     date.setDate(startOfWeek.getDate() + i);

//     return {
//       fullDate: date,
//       dateNumber: date.getDate(),
//       dayLetter: ["M", "T", "W", "Th", "F", "S", "S"][i],
//     };
//   });

//   // ===============================
//   // FILTER TASKS PER DAY
//   // ===============================
//   const getTasksForDay = (dayDate) => {
//     return tasks.filter((task) => {
//       if (!task.dueDate) return false;
//       const taskDate = parseDate(task.dueDate);
//       return isSameDay(taskDate, dayDate);
//     });
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <TopBanner />

//       <Text style={styles.scheduleHeading}>Schedule</Text>

//       {/* WEEK SELECTOR */}
//       <View style={styles.weekContainer}>
//         <View style={styles.weekHeader}>
//           <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
//             <Text style={styles.weekText}>Previous Week</Text>
//           </TouchableOpacity>

//           <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
//             <Text style={styles.weekText}>Next Week</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.daysRow}>
//           {weekDays.map((day, index) => (
//             <View key={index} style={styles.dayItem}>
//               <Text style={styles.dateNumber}>{day.dateNumber}</Text>
//               <Text style={styles.dayLetter}>{day.dayLetter}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* 🔥 TASK CALENDAR */}
//       <View style={styles.calendarContainer}>
//         {weekDays.map((day, index) => {
//           const dailyTasks = getTasksForDay(day.fullDate);

//           return (
//             <View key={index} style={styles.calendarRow}>
//               <View style={styles.dateWrapper}>
//                 <Text style={styles.calendarDate}>
//                   {day.dayLetter} {day.dateNumber}
//                 </Text>
//               </View>

//               <View style={styles.taskContainer}>
//                 {dailyTasks.length === 0 ? (
//                   <Text style={styles.noTask}>No tasks</Text>
//                 ) : (
//                   dailyTasks.map((task) => (
//                     <View key={task.id} style={styles.taskBubble}>
//                       <Text style={styles.taskText}>
//                         {task.taskName}
//                       </Text>
//                     </View>
//                   ))
//                 )}
//               </View>
//             </View>
//           );
//         })}
//       </View>
//     </ScrollView>
//   );
// }


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFF4E2",
//   },

//   scheduleHeading: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginLeft: 20,
//     marginTop: 15,
//   },

//   weekContainer: {
//     marginHorizontal: 20,
//     marginTop: 10,
//     padding: 15,
//     backgroundColor: "#ffffff",
//     borderTopLeftRadius: 10,
//     borderBottomLeftRadius: 10,
//     borderTopRightRadius: 50,
//     borderBottomRightRadius: 50,
//     elevation: 4,
//   },

//   weekHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },

//   weekText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#9E090F",
//   },

//   daysRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   dayItem: {
//     alignItems: "center",
//   },

//   dateNumber: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#333",
//   },

//   dayLetter: {
//     fontSize: 13,
//     color: "#777",
//   },

//   activeDate: {
//     color: "#9E090F",
//   },

//   activeDay: {
//     color: "#9E090F",
//     fontWeight: "bold",
//   },

//   /* CALENDAR STYLING */

//   calendarContainer: {
//   marginHorizontal: 20,
//   marginTop: 7,
//   padding: 15,
//   backgroundColor: "#ffffff",
//   borderTopLeftRadius: 10,
//   borderBottomLeftRadius: 10,
//   borderTopRightRadius: 50,
//   borderBottomRightRadius: 50,
//   elevation: 4,
// },

// calendarRow: {
//   flexDirection: "row",
//   alignItems: "center",
//   marginBottom: 20,
// },

// dateWrapper: {
//   width: 60, // controls where dotted line starts
// },

// calendarDate: {
//   fontSize: 14,
//   fontWeight: "600",
//   color: "#333",
// },

// dottedLine: {
//   flex: 1,
//   borderBottomWidth: 1,
//   borderStyle: "dotted",
//   borderColor: "#999",
// },
// taskContainer: {
//   flex: 1,
// },

// taskBubble: {
//   backgroundColor: "#9E090F",
//   paddingVertical: 4,
//   paddingHorizontal: 10,
//   borderRadius: 10,
//   marginBottom: 5,
//   alignSelf: "flex-start",
// },

// taskText: {
//   color: "#fff",
//   fontSize: 12,
// },

// noTask: {
//   fontSize: 12,
//   color: "#aaa",
// },
// });

