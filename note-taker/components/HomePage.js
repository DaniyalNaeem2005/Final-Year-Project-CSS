import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import TopBanner from "./Top_Banner";

export default function HomePage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const today = new Date();

  const getStartOfWeek = (baseDate) => {
    const date = new Date(baseDate);
    const day = date.getDay();
    const diff = (day + 6) % 7; // Monday = 0
    date.setDate(date.getDate() - diff);
    return date;
  };

  const baseDate = new Date();
  baseDate.setDate(today.getDate() + weekOffset * 7);

  const startOfWeek = getStartOfWeek(baseDate);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    const isCurrentWeek = weekOffset === 0;

    return {
      fullDate: date,
      dateNumber: date.getDate(),
      dayLetter: ["M", "T", "W", "Th", "F", "S", "S"][i],
      isToday:
        isCurrentWeek &&
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth(),
    };
  });

  return (
    <View style={styles.container}>
      <TopBanner />

      <Text style={styles.scheduleHeading}>Schedule</Text>

      {/* WEEK SELECTOR CONTAINER */}
      <View style={styles.weekContainer}>
        <View style={styles.weekHeader}>
          <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
            <Text style={styles.weekText}>Previous Week</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
            <Text style={styles.weekText}>Next Week</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysRow}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.dayItem}>
              <Text
                style={[
                  styles.dateNumber,
                  day.isToday && styles.activeDate,
                ]}
              >
                {day.dateNumber}
              </Text>
              <Text
                style={[
                  styles.dayLetter,
                  day.isToday && styles.activeDay,
                ]}
              >
                {day.dayLetter}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.calendarContainer}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.calendarRow}>
            <View style={styles.dateWrapper}>
              <Text style={styles.calendarDate}>
                {day.dayLetter} {day.dateNumber}
              </Text>
            </View>

            <View style={styles.dottedLine} />
          </View>
        ))}
      </View>
    </View>
  );
}

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

  activeDate: {
    color: "#9E090F",
  },

  activeDay: {
    color: "#9E090F",
    fontWeight: "bold",
  },

  /* CALENDAR STYLING */

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
  width: 60, // controls where dotted line starts
},

calendarDate: {
  fontSize: 14,
  fontWeight: "600",
  color: "#333",
},

dottedLine: {
  flex: 1,
  borderBottomWidth: 1,
  borderStyle: "dotted",
  borderColor: "#999",
},
});