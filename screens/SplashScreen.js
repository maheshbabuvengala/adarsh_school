import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");
        const parsedUser = storedUser ? JSON.parse(storedUser) : null;

        setTimeout(() => {
          if (parsedUser?.isLoggedIn) {
            navigation.replace("Dashboard");
          } else {
            navigation.replace("Info");
          }
        }, 2000);
      } catch (error) {
        console.error("Error checking login status:", error);
        navigation.replace("Info"); // fallback
      }
    };

    checkLoginStatus();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")} // Your splash logo
        style={styles.logo}
      />
      <Text style={styles.title}>Welcome to My School App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4CAF50", // Splash background color
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
});
