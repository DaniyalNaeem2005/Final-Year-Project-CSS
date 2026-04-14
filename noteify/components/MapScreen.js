
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform, Text } from "react-native";
import * as Location from "expo-location";
import { useRoute } from "@react-navigation/native";

let MapView, Marker;

if (Platform.OS !== "web") {
  MapView = require("react-native-maps").default;
  Marker = require("react-native-maps").Marker;
}

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);

  const route = useRoute();
  const { nearbyInfo } = route.params || {};

console.log("🧠 nearbyInfo received:", nearbyInfo);
  // ===============================
  // 🔄 EXTRACT PLACES FROM TASK LIST DATA
  // ===============================
  const extractPlacesFromNearby = (nearbyInfo) => {
    if (!nearbyInfo) return [];

    let allPlaces = [];

    Object.values(nearbyInfo).forEach((item) => {
      if (item?.places?.length > 0) {
        allPlaces = [...allPlaces, ...item.places];
      }
    });

    return allPlaces;
  };

  // ===============================
  // 📍 LOAD DATA
  // ===============================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);

    // ✅ USE EXISTING DATA FROM TASK LIST
    const extractedPlaces = extractPlacesFromNearby(nearbyInfo);

    console.log("📍 PLACES FROM TASK LIST:", extractedPlaces);

    setPlaces(extractedPlaces);
  };

  // ===============================
  // 🌐 WEB VIEW (GOOGLE MAPS)
  // ===============================
  if (Platform.OS === "web") {
    if (!location) return <ActivityIndicator />;

    const lat = location.latitude;
    const lon = location.longitude;

    if (!places.length) {
      return (
        <View style={{ padding: 20 }}>
          <Text>No nearby places found for your tasks.</Text>
        </View>
      );
    }

    // Use first place type for search
    const firstPlace = places[0];
    const query = firstPlace?.name || "places";

    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
      query
    )}+near+${lat},${lon}&z=14&output=embed`;

    return (
      <View style={{ flex: 1 }}>
        <iframe
          src={mapUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          loading="lazy"
        />
      </View>
    );
  }

  // ===============================
  // 📱 MOBILE MAP
  // ===============================
  if (!location) return <ActivityIndicator />;

  if (!places.length) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No nearby places found for your tasks.</Text>
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
    >
      {/* 📍 USER LOCATION */}
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="You are here"
      />

      {/* 📍 TASK-BASED PLACES */}
      {places.map((place, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: place.lat,
            longitude: place.lon,
          }}
          title={place.name || "Place"}
          description={place.address || ""}
        />
      ))}
    </MapView>
  );
}

// import React, { useEffect, useState } from "react";
// import { View, ActivityIndicator, Platform, Text } from "react-native";
// import * as Location from "expo-location";

// let MapView, Marker;

// if (Platform.OS !== "web") {
//   MapView = require("react-native-maps").default;
//   Marker = require("react-native-maps").Marker;
// }

// export default function MapScreen() {
//   const [location, setLocation] = useState(null);
//   const [places, setPlaces] = useState([]);

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") return;

//     const loc = await Location.getCurrentPositionAsync({});
//     setLocation(loc.coords);

//     const lat = loc.coords.latitude;
//     const lon = loc.coords.longitude;

//     const url = `
// https://overpass-api.de/api/interpreter?data=
// [out:json];
// node["shop"~"supermarket|grocery|convenience|general"](around:5000,${lat},${lon});
// node["amenity"="marketplace"](around:5000,${lat},${lon});
// out;
// `;

//     try {
//       const res = await fetch(url);
//       const data = await res.json();

//       console.log("MAP PLACES:", data.elements.length);

//       setPlaces(data.elements);
//     } catch (err) {
//       console.log("Map fetch error:", err);
//     }
//   };

//   if (Platform.OS === "web") {
//   if (!location) return <ActivityIndicator />;

//   const lat = location.latitude;
//   const lon = location.longitude;

//   const mapUrl = `https://www.google.com/maps?q=${lat},${lon}&z=14&output=embed`;

//   return (
//     <View style={{ flex: 1 }}>
//       <iframe
//         src={mapUrl}
//         style={{ width: "100%", height: "100%", border: "none" }}
//         loading="lazy"
//       />
//     </View>
//   );
// }

//   if (!location) return <ActivityIndicator />;

//   return (
//     <MapView
//       style={{ flex: 1 }}
//       initialRegion={{
//         latitude: location.latitude,
//         longitude: location.longitude,
//         latitudeDelta: 0.05,
//         longitudeDelta: 0.05,
//       }}
//     >
//       <Marker
//         coordinate={{
//           latitude: location.latitude,
//           longitude: location.longitude,
//         }}
//         title="You are here"
//       />

//       {places.map((place, index) => (
//         <Marker
//           key={index}
//           coordinate={{
//             latitude: place.lat,
//             longitude: place.lon,
//           }}
//           title={place.tags?.name || "Store"}
//         />
//       ))}
//     </MapView>
//   );
// }