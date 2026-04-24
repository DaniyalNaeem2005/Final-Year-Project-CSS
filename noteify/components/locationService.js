import * as Location from "expo-location";
import { Platform, Linking } from "react-native";


// ===============================
// GET USER LOCATION
// ===============================
export const getUserLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    console.log("Location permission denied");
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

  // Grocery / shopping
  if (
    text.includes("grocery") ||
    text.includes("groceries") ||
    text.includes("milk") ||
    text.includes("shopping") ||
    text.includes("supermarket")
  ) {
    return "grocery";
  }

  // Gym
  if (
    text.includes("gym") ||
    text.includes("workout") ||
    text.includes("fitness")
  ) {
    return "gym";
  }

  // Food
  if (
    text.includes("eat") ||
    text.includes("food") ||
    text.includes("restaurant") ||
    text.includes("dinner") ||
    text.includes("lunch")
  ) {
    return "restaurant";
  }

  // Stationery / books
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
