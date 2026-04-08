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

  if (
    text.includes("grocery") ||
    text.includes("groceries") ||
    text.includes("milk") ||
    text.includes("shopping")
  ) {
    return "grocery";
  }

  if (text.includes("gym") || text.includes("workout")) {
    return "gym";
  }

  if (
    text.includes("eat") ||
    text.includes("food") ||
    text.includes("restaurant")
  ) {
    return "restaurant";
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
    if (type === "grocery") query = "grocery";
    if (type === "gym") query = "gym";
    if (type === "restaurant") query = "restaurant";

    return [
      {
        name: `See nearby ${type} on Google Maps`,
        mapLink: `https://www.google.com/maps/search/${query}+near+${lat},${lon}`,
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

    return (data.results || []).map((place) => ({
      id: place.fsq_id,
      name: place.name,
      lat: place.geocodes.main.latitude,
      lon: place.geocodes.main.longitude,
      address: place.location.formatted_address,
    }));
  } catch (err) {
    console.log("❌ Foursquare API error:", err);
    return [];
  }
};

// ===============================
// MAIN FUNCTION
// ===============================
export const checkNearbyForTask = async (task) => {
  const location = await getUserLocation();
  if (!location) return null;

  const type = getPlaceType(task.taskName);
  if (!type) return null;

  const places = await findNearbyPlaces(location.latitude, location.longitude, type);

  return {
    count: places.length,
    type,
    places,
  };
};