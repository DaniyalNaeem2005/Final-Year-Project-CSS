import * as Location from "expo-location";
import { Platform, Linking } from "react-native";

// ===============================
// FOURSQUARE API CONFIG
// ===============================
const FOURSQUARE_API_KEY = "N4DU3QTLMRWLQ2QQBEUI40VOW0LRWTYFAPVTYYDHMTAWN4JX"; // replace with your key
const FOURSQUARE_BASE_URL = "https://api.foursquare.com/v3/places/search";

// ===============================
// GET USER LOCATION
// ===============================
export const getUserLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    console.log("❌ Location permission denied");
    return null;
  }

  const location = await Location.getCurrentPositionAsync({});
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};

// ===============================
// DETECT TASK TYPE
// ===============================
export const getPlaceType = (taskName) => {
  const text = taskName.toLowerCase();

  // 🛒 Grocery / shopping
  if (
    text.includes("grocery") ||
    text.includes("groceries") ||
    text.includes("milk") ||
    text.includes("shopping") ||
    text.includes("supermarket")
  ) {
    return "grocery";
  }

  // 🏋️ Gym
  if (
    text.includes("gym") ||
    text.includes("workout") ||
    text.includes("fitness")
  ) {
    return "gym";
  }

  // 🍽️ Food
  if (
    text.includes("eat") ||
    text.includes("food") ||
    text.includes("restaurant") ||
    text.includes("dinner") ||
    text.includes("lunch")
  ) {
    return "restaurant";
  }

  // ✏️ Stationery / books
  if (
    text.includes("stationery") ||
    text.includes("books") ||
    text.includes("notebook") ||
    text.includes("print") ||
    text.includes("photocopy")
  ) {
    return "stationery";
  }

  return null;
};

// ===============================
// FIND NEARBY PLACES
// ===============================
export const findNearbyPlaces = async (lat, lon, type) => {
  // 🌐 WEB FALLBACK: Return Google Maps link
  if (Platform.OS === "web") {
  let query = "store";

  if (type === "grocery") query = "grocery store";
  if (type === "gym") query = "gym";
  if (type === "restaurant") query = "restaurant";
  if (type === "stationery") query = "stationery shop";

  return [
    {
      name: `Search ${query} nearby`,
      mapLink: `https://www.google.com/maps/search/${encodeURIComponent(
        query
      )}/@${lat},${lon},14z`,
    },
  ];
}

  // MOBILE: Use Foursquare API
  let category = "";
  switch (type) {
    case "grocery":
      category = "13065"; // grocery stores
      break;
    case "gym":
      category = "18018"; // fitness center
      break;
    case "restaurant":
      category = "13065"; // restaurants
      break;
    case "stationery":
      category = "17114"; // bookstore / office supplies
      break;
    default:
      return [];
  }

  const url = `${FOURSQUARE_BASE_URL}?ll=${lat},${lon}&categories=${category}&radius=5000&limit=20`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: FOURSQUARE_API_KEY,
      },
    });

    const data = await res.json();
    console.log("✅ Places found:", data.results?.length || 0);
    console.log("PLACES FOR TASK:", task.taskName, places);
    return (data.results || []).map((place) => ({
      id: place.fsq_id,
      name: place.name || place.location?.address || "Unknown place",
      lat: place.geocodes?.main?.latitude,
      lon: place.geocodes?.main?.longitude,
      address: place.location?.formatted_address || "No address",
    }));
    
  } catch (err) {
    console.log("❌ Foursquare API error:", err);
    return [];
  }
};

// ===============================
// MAIN FUNCTION
// ===============================
let cachedLocation = null;

export const checkNearbyForTask = async (task) => {
  if (!cachedLocation) {
    cachedLocation = await getUserLocation();
  }

  if (!cachedLocation) return null;

  const type = getPlaceType(task.taskName);
  if (!type) return null;

  const places = await findNearbyPlaces(
    cachedLocation.latitude,
    cachedLocation.longitude,
    type
  );

  return {
    count: places.length,
    type,
    places,
  };
};