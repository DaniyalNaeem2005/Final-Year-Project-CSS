import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet } from "react-native";

import Page1 from "./HomePage";
import Page2 from "./AddTask";
import Page3 from "./Page3";

const Tab = createBottomTabNavigator();

export default function NavigationBar() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFD583",
        tabBarInactiveTintColor: "#72716E",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Page1}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/home.png")} // Dummy icon
              style={{ width: 25, height: 25, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={Page2}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/add.png")} // Dummy icon
              style={{ width: 23, height: 23, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favourites"
        component={Page3}
        options={{
          tabBarIcon: ({ color }) => (
            <Image
              source={require("../assets/dashboard.png")} // Dummy icon
              style={{ width: 23, height: 23, tintColor: color }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 5,
    right: 5,
    // elevation: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    height: 50,
    // paddingBottom: 10,
    
  },
});
