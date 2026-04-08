import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform, Text } from "react-native";
import * as Location from "expo-location";

let MapView, Marker;

if (Platform.OS !== "web") {
  MapView = require("react-native-maps").default;
  Marker = require("react-native-maps").Marker;
}

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);

    const lat = loc.coords.latitude;
    const lon = loc.coords.longitude;

    const url = `
https://overpass-api.de/api/interpreter?data=
[out:json];
node["shop"~"supermarket|grocery|convenience|general"](around:5000,${lat},${lon});
node["amenity"="marketplace"](around:5000,${lat},${lon});
out;
`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log("MAP PLACES:", data.elements.length);

      setPlaces(data.elements);
    } catch (err) {
      console.log("Map fetch error:", err);
    }
  };

  if (Platform.OS === "web") {
    return (
      <View style={{ padding: 20 }}>
        <Text>Map not supported on web</Text>
      </View>
    );
  }

  if (!location) return <ActivityIndicator />;

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="You are here"
      />

      {places.map((place, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: place.lat,
            longitude: place.lon,
          }}
          title={place.tags?.name || "Store"}
        />
      ))}
    </MapView>
  );
}