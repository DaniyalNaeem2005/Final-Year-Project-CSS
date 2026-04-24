import AsyncStorage from "@react-native-async-storage/async-storage";

export const logAllStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);

    const formatted = items.map(([key, value]) => {
      try {
        return { key, value: JSON.parse(value) };
      } catch {
        return { key, value };
      }
    });

    console.log("FULL AsyncStorage:", formatted);
  } catch (e) {
    console.log("Storage log error:", e);
  }
};