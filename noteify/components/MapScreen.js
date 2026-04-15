import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearPlace, setNearPlace] = useState(null);

  const alertedRef = useRef({});

  // ===============================
  // TASK → TYPE
  // ===============================
  const getType = (taskName) => {
    const lower = taskName.toLowerCase();

    if (
      lower.includes("gym") ||
      lower.includes("workout") ||
      lower.includes("exercise")
    )
      return "Gym";

    if (
      lower.includes("grocery") ||
      lower.includes("groceries") ||
      lower.includes("shopping") ||
      lower.includes("mart") ||
      lower.includes("store")
    )
      return "Grocery";

    if (
      lower.includes("coffee") ||
      lower.includes("cafe") ||
      lower.includes("tea")
    )
      return "Cafe";

    if (
      lower.includes("food") ||
      lower.includes("eat") ||
      lower.includes("restaurant") ||
      lower.includes("dinner") ||
      lower.includes("lunch")
    )
      return "Restaurant";

    if (
      lower.includes("doctor") ||
      lower.includes("hospital") ||
      lower.includes("clinic")
    )
      return "Hospital";

    return null;
  };

  // ===============================
  // COLOR SYSTEM
  // ===============================
  const getDistanceColor = (minutes) => {
    if (minutes < 1) return "#22c55e";
    if (minutes < 5) return "#f59e0b";
    if (minutes < 10) return "#ec4899";
    return "#ef4444";
  };

  // ===============================
  // FAKE DEMO LOCATION
  // ===============================
  const [fakeLocation, setFakeLocation] = useState(null);
  const activeLocation = fakeLocation || location;

  // 🔥 CENTRAL PROXIMITY CHECK (FIXED LOGIC)
  const checkProximity = (user, list) => {
    if (!user || !list.length) return;

    list.forEach((place) => {
      const dist = getDistance(
        user.latitude,
        user.longitude,
        place.latitude,
        place.longitude
      );

      const meters = dist * 1000;
      const minutes = meters / 80;

      // ✅ YOUR REQUIREMENT: 2 minutes or less
      if (minutes <= 2 && !alertedRef.current[place.id]) {
        alertedRef.current[place.id] = true;

        setNearPlace({
          ...place,
          distance: Math.round(meters),
        });
      }
    });
  };

  // ===============================
  // DEMO CONTROLS (FIXED)
  // ===============================
  const moveCloser = () => {
    if (!activeLocation || !places.length) return;

    const target = places[0];

    const newLoc = {
      latitude:
        activeLocation.latitude +
        (target.latitude - activeLocation.latitude) * 0.5,
      longitude:
        activeLocation.longitude +
        (target.longitude - activeLocation.longitude) * 0.5,
    };

    setFakeLocation(newLoc);
    checkProximity(newLoc, places);
  };

  const moveFarther = () => {
    if (!activeLocation) return;

    const target = places[0];

    const newLoc = {
      latitude:
        activeLocation.latitude -
        (target.latitude - activeLocation.latitude) * 0.5,
      longitude:
        activeLocation.longitude -
        (target.longitude - activeLocation.longitude) * 0.5,
    };

    setFakeLocation(newLoc);
    checkProximity(newLoc, places);
  };

  const resetLocation = () => {
    setFakeLocation(null);
    if (location) checkProximity(location, places);
  };

  // ===============================
  // GENERATE FAKE POINTS
  // ===============================
  const generateNearby = (lat, lon, type, taskName) => {
    const offset = () => (Math.random() - 0.5) * 0.005;

    return {
      id: Math.random().toString(),
      name: `${taskName} location`,
      latitude: lat + offset(),
      longitude: lon + offset(),
      type,
      taskName,
    };
  };

  // ===============================
  // DISTANCE FUNCTION
  // ===============================
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ===============================
  // LOAD DATA
  // ===============================
  const loadData = async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const stored = await AsyncStorage.getItem("TASKS");
      const tasks = stored ? JSON.parse(stored) : [];

      const generated = [];

      tasks.forEach((task) => {
        const type = getType(task.taskName);
        if (!type) return;

        generated.push(
          generateNearby(
            loc.coords.latitude,
            loc.coords.longitude,
            type,
            task.taskName
          )
        );
      });

      setPlaces(generated);

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
        },
        (pos) => {
          const user = pos.coords;
          setLocation(user);

          checkProximity(user, generated);
        }
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  if (loading || !activeLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ color: "#fff" }}>Loading smart map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerCard}>
        <Text style={styles.heading}>🗺️ Smart Task Map</Text>
        <Text style={styles.user}>
          📍 {activeLocation.latitude.toFixed(4)},{" "}
          {activeLocation.longitude.toFixed(4)}
        </Text>
      </View>

      {/* DEMO CONTROLS */}
      <View style={styles.demoRow}>
        <TouchableOpacity style={styles.demoBtn} onPress={moveCloser}>
          <Text style={styles.demoText}>📍 Closer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoBtn} onPress={moveFarther}>
          <Text style={styles.demoText}>📍 Farther</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.demoBtn} onPress={resetLocation}>
          <Text style={styles.demoText}>🔁 Reset</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <View style={styles.list}>
        {places.map((place) => {
          const dist = getDistance(
            activeLocation.latitude,
            activeLocation.longitude,
            place.latitude,
            place.longitude
          );

          const meters = dist * 1000;
          const minutes = meters / 80;
          const color = getDistanceColor(minutes);

          return (
            <View key={place.id} style={styles.row}>
              <View style={styles.pinCol}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={styles.line} />
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>📌 {place.taskName}</Text>

                <Text style={[styles.meta, { color }]}>
                  {Math.round(meters)}m away • {minutes.toFixed(1)} min walk
                </Text>

                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>{place.type}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* MODAL */}
      <Modal visible={!!nearPlace} transparent animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>📍 You're Nearby!</Text>

            {nearPlace && (
              <>
                <Text style={styles.modalText}>
                  You are {nearPlace.distance} meters away from
                </Text>
                <Text style={styles.modalPlace}>
                  {nearPlace.taskName}
                </Text>
              </>
            )}

            <Text style={styles.close} onPress={() => setNearPlace(null)}>
              Close
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ===============================
// STYLES (BRAND MATCHED)
// ===============================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4E2",
    padding: 16,
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 16,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#9E090F",
  },

  heading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },

  user: {
    color: "#444",
    fontSize: 12,
    marginTop: 4,
  },

  list: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    marginBottom: 18,
  },

  pinCol: {
    width: 30,
    alignItems: "center",
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#D6C7B2",
    marginTop: 2,
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },

  title: {
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 6,
  },

  meta: {
    fontSize: 12,
    color: "#333",
    marginBottom: 8,
  },

  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },

  modalText: {
    marginTop: 10,
    textAlign: "center",
  },

  modalPlace: {
    fontWeight: "700",
    marginTop: 6,
    color: "#9E090F",
  },

  close: {
    marginTop: 15,
    color: "#9E090F",
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  demoRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 12,
},

demoBtn: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  paddingVertical: 10,
  marginHorizontal: 4,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#E5E5E5",
  alignItems: "center",

  // subtle elevation
  shadowColor: "#000",
  shadowOpacity: 0.05,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
},

demoText: {
  color: "#9E090F",
  fontWeight: "700",
  fontSize: 12,
},
});

