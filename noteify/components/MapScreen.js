import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import * as Location from "expo-location";



const classifyTaskIntent = (text) => {
  const t = text.toLowerCase();

// GYM
  if (
    t.includes("gym") ||
    t.includes("workout") ||
    t.includes("fitness") ||
    t.includes("exercise") ||
    t.includes("train") ||
    t.includes("training") ||
    t.includes("run") ||
    t.includes("running") ||
    t.includes("jog") ||
    t.includes("cardio") ||
    t.includes("weight") ||
    t.includes("lifting")
  ) return "gym";

  // GROCERY
  if (
    t.includes("grocery") ||
    t.includes("groceries") ||
    t.includes("buy") ||
    t.includes("shopping") ||
    t.includes("store") ||
    t.includes("mart") ||
    t.includes("supermarket") ||
    t.includes("market") ||
    t.includes("shop") ||
    t.includes("purchase") ||
    t.includes("get milk") ||
    t.includes("buy food")
  ) return "grocery";

//  MEDICAL
  if (
    t.includes("doctor") ||
    t.includes("clinic") ||
    t.includes("hospital") ||
    t.includes("appointment") ||
    t.includes("checkup") ||
    t.includes("medical") ||
    t.includes("dentist") ||
    t.includes("pharmacy") ||
    t.includes("medicine") ||
    t.includes("health")
  ) return "clinic";

  // FOOD
  if (
    t.includes("food") ||
    t.includes("restaurant") ||
    t.includes("eat") ||
    t.includes("dinner") ||
    t.includes("lunch") ||
    t.includes("breakfast") ||
    t.includes("snack") ||
    t.includes("order food") ||
    t.includes("takeaway") ||
    t.includes("delivery") ||
    t.includes("coffee") ||
    t.includes("cafe") ||
    t.includes("eat out")
  ) return "restaurant";

  // EDUCATION
  if (
    t.includes("study") ||
    t.includes("school") ||
    t.includes("university") ||
    t.includes("college") ||
    t.includes("assignment") ||
    t.includes("homework") ||
    t.includes("exam") ||
    t.includes("revision") ||
    t.includes("class")
  ) return "study";

  return null;
};

const getOSMQuery = (type) => {
  switch (type) {

  //  GYM
    case "gym":
      return `
        (
          node["leisure"="fitness_centre"];
          node["leisure"="sports_centre"];
          node["sport"="gymnastics"];
          node["sport"="fitness"];
        )
      `;

    // GROCERY
    case "grocery":
      return `
        (
          node["shop"="supermarket"];
          node["shop"="grocery"];
          node["shop"="convenience"];
          node["shop"="mall"];
          node["shop"="department_store"];
        )
      `;

    // HEALTH
    case "clinic":
      return `
        (
          node["amenity"="clinic"];
          node["amenity"="hospital"];
          node["amenity"="doctors"];
          node["amenity"="pharmacy"];
          node["healthcare"="clinic"];
        )
      `;

    // FOOD
    case "restaurant":
      return `
        (
          node["amenity"="restaurant"];
          node["amenity"="cafe"];
          node["amenity"="fast_food"];
          node["amenity"="food_court"];
        )
      `;

    // STUDY
    case "study":
      return `
        (
          node["amenity"="library"];
          node["amenity"="university"];
          node["amenity"="college"];
          node["amenity"="school"];
        )
      `;
    default:
      return null;
  }
};

// DISTANCE CALCULATION (Haversine formulae)
// Calculates distance between two points on Earth using lat and long
// Returns in km 

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; //Earth radius in km

// Converting latitude and longitude from degrees to radians
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

// Haversine formulae to calculate distance on a sphere
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

// Concert into kilometers
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Overpass API to fetch places
const fetchOverpassSafe = async (query) => {
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
    });

    const text = await res.text();

// Ignores API if HTML is returned
    if (
      text.includes("<html") ||
      text.includes("<?xml") ||
      !text.trim().startsWith("{")
    ) {
      console.log("⚠️ Overpass fallback triggered (non-JSON)");
      return null;
    }

    return JSON.parse(text);
  } catch (err) {
    console.log("❌ Fetch error:", err.message);
    return null;
  }
};

// Cache Key to save results locally
const getCacheKey = (intent) => `OSM_CACHE_${intent}`;

// Map Screen components
export default function MapScreen() {
  const [location, setLocation] = useState(null); // user location
  const [places, setPlaces] = useState([]); // nearby places
  const [loading, setLoading] = useState(true); // loading state
  const [nearPlace, setNearPlace] = useState(null); //when user reaches place
  const [fakeLocation, setFakeLocation] = useState(null); // for testing movement
  const [visitedTasks, setVisitedTasks] = useState({}); // completed tracking
  const activeLocation = fakeLocation || location; // real or fake location
  const [showLocationModal, setShowLocationModal] = useState(false);
const navigation = useNavigation();
const alertedRef = useRef({}); //prevents repeated alerts

// Check if user is near a place
useEffect(() => {
  if (!activeLocation || !places.length) return;

  let closest = null;

  places.forEach((place) => {
    const dist = getDistance(
      activeLocation.latitude,
      activeLocation.longitude,
      place.latitude,
      place.longitude
    );

    const meters = dist * 1000;
    const minutes = meters / 80; //estimate walking time

// If user is withing 1 minute walking distance
    if (minutes < 1 && !visitedTasks[place.id]) {
      closest = place;
    }
  });

  setNearPlace(closest);
}, [activeLocation, places, visitedTasks]);

// Auto close popup 
useEffect(() => {
  if (!nearPlace) return;

  const timer = setTimeout(() => {
    setNearPlace(null);
  }, 2000);

  return () => clearTimeout(timer);
}, [nearPlace]);


  const getDistanceColor = (minutes) => {
    if (minutes <= 2) return "#2ecc71";
    if (minutes <= 5) return "#f39c12";
    return "#e74c3c";
  };

// Moving closer to the location
  const moveCloser = () => {
  if (!activeLocation || !places.length) return;

  const target = places[0];

  setFakeLocation({
    latitude:
      activeLocation.latitude +
      (target.latitude - activeLocation.latitude) * 0.5,
    longitude:
      activeLocation.longitude +
      (target.longitude - activeLocation.longitude) * 0.5,
  });
};

// Moving farther to the location
const moveFarther = () => {
  if (!activeLocation || !places.length) return;

  const target = places[0];

  setFakeLocation({
    latitude:
      activeLocation.latitude -
      (target.latitude - activeLocation.latitude) * 0.5,
    longitude:
      activeLocation.longitude -
      (target.longitude - activeLocation.longitude) * 0.5,
  });
};

const resetLocation = () => {
  setFakeLocation(null);
};

console.log('RUN STARTED')
// Loads location, tasks and places
useFocusEffect(
  useCallback(() => {
    const run = async () => {

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setShowLocationModal(true);
        setLoading(false); 
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const user = loc.coords;
      setLocation(user);
      const stored = await AsyncStorage.getItem("TASKS");
      const tasks = stored ? JSON.parse(stored) : [];
      const activeTasks = tasks.filter((t) => !t.completed);
      const finalPlaces = [];

// Loops through each task and finds matching place
      for (const task of activeTasks) {
        const intent = classifyTaskIntent(task.taskName);
        if (!intent) continue;

        const cacheKey = getCacheKey(intent);
        const cached = await AsyncStorage.getItem(cacheKey);

        let bestPlace = cached ? JSON.parse(cached) : null;

// If no cached result, fetches from API
        if (!bestPlace) {
          const query = getOSMQuery(intent);

          const overpassQuery = `
            [out:json];
            (
              ${query}(around:5000,${user.latitude},${user.longitude});
            );
            out center;
          `;

          const data = await fetchOverpassSafe(overpassQuery);

          if (data?.elements?.length) {
            let closest = null;
            let minDist = Infinity;

            for (const el of data.elements) {
              const lat = el.lat || el.center?.lat;
              const lon = el.lon || el.center?.lon;

              const d = getDistance(user.latitude, user.longitude, lat, lon);

              if (d < minDist) {
                minDist = d;
                closest = el;
              }
            }

            bestPlace = {
              name: closest?.tags?.name || "Unknown",
              latitude: closest?.lat || closest?.center?.lat,
              longitude: closest?.lon || closest?.center?.lon,
              distanceMeters: Math.round(minDist * 1000),
            };

// Save to cache for faster future loads
            await AsyncStorage.setItem(cacheKey, JSON.stringify(bestPlace));
          }
        }

        if (bestPlace) {
          finalPlaces.push({
            id: task.id,
            taskName: task.taskName,
            type: intent,
            ...bestPlace,
          });
        }
      }

      setPlaces(finalPlaces);
      setLoading(false);
      console.log('RUN STARTED')

    };

    run();
  }, [])
);



  if (loading || !location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Running smart map pipeline...</Text>
      </View>
    );
  }

 
  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.heading}>🗺️ Smart Task Map</Text>
        <Text style={styles.user}>
          📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </Text>
      </View>

      <View style={styles.ctaRow}>
      <TouchableOpacity style={styles.ctaBtn} onPress={moveCloser}>
        <Text style={styles.ctaText}>📍 Closer</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ctaBtn} onPress={moveFarther}>
        <Text style={styles.ctaText}>📍 Farther</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.ctaBtn} onPress={resetLocation}>
        <Text style={styles.ctaText}>🔁 Reset</Text>
      </TouchableOpacity>
    </View>

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
                <Text style={styles.placeName}>🏷 {place.name}</Text>

                <Text style={[styles.meta, { color }]}>
                  {Math.round(meters)}m • {minutes.toFixed(1)} min
                </Text>

                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>{place.type}</Text>
                </View>


                {nearPlace?.id === place.id && !nearPlace && (
  <TouchableOpacity
    style={styles.doneButton}
    onPress={async () => {
      const stored = await AsyncStorage.getItem("TASKS");
      const tasks = stored ? JSON.parse(stored) : [];

      const updatedTasks = tasks.map((t) =>
        String(t.id) === String(place.id)
          ? { ...t, completed: true }
          : t
      );

      await AsyncStorage.setItem("TASKS", JSON.stringify(updatedTasks));

      setVisitedTasks((prev) => ({
        ...prev,
        [place.id]: true,
      }));

      alert("Task marked as completed!");
    }}
  >
    <Text style={styles.doneText}>✔ Task Done</Text>
  </TouchableOpacity>
)}
              </View>
                </View>
            
          );
          
        })}
        
      </View>

    
<Modal visible={!!nearPlace} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>📍 You have reached</Text>

      {nearPlace && (
        <Text style={styles.modalPlace}>
          {nearPlace.name || nearPlace.taskName}
        </Text>
      )}

     

      <TouchableOpacity
  onPress={() => {
    setNearPlace(null);
    navigation.navigate("Tasks");
  }}
  style={styles.closeBtn}
>
  <Text style={styles.closeText}>Mark It As Done</Text>
</TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal visible={showLocationModal} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>⚠️ Location Required</Text>

      <Text style={styles.modalPlace}>
        Please enable your device's location to use the Smart Map.
      </Text>

      <TouchableOpacity
        onPress={() => setShowLocationModal(false)}
        style={styles.closeBtn}
      >
        <Text style={styles.closeText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
  
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF4E2", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 16,
    marginBottom: 15,
  },

  heading: { fontSize: 20, fontWeight: "800" },
  user: { fontSize: 12, color: "#444" },

  list: { flex: 1 },

  row: { flexDirection: "row", marginBottom: 18 },

  pinCol: { width: 30, alignItems: "center" },

  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 6 },

  line: { width: 2, flex: 1, backgroundColor: "#ddd" },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginLeft: 10,
  },

  title: { fontWeight: "700", fontSize: 14 },
  meta: { fontSize: 12, marginTop: 4 },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6,
  },
  ctaRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 12,
},

ctaBtn: {
  flex: 1,
  backgroundColor: "#fff",
  paddingVertical: 10,
  marginHorizontal: 4,
  borderRadius: 10,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#ddd",
},

ctaText: {
  fontWeight: "700",
  color: "#9E090F",
  fontSize: 12,
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},

modalBox: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 16,
  width: "80%",
  alignItems: "center",
},

modalTitle: {
  fontSize: 18,
  fontWeight: "800",
  marginBottom: 10,
},

modalPlace: {
  fontSize: 16,
  fontWeight: "700",
  color: "#9E090F",
  marginBottom: 15,
},

closeBtn: {
  backgroundColor: "#9E090F",
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 10,
},

closeText: {
  color: "#fff",
  fontWeight: "700",
},

placeName: {
  fontSize: 12,
  color: "#666",
  marginTop: 2,
},

  badgeText: { fontSize: 11, fontWeight: "600", color: "#fff" },
});
