import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import schoolConfig from "../config/schoolConfig";

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
            if (schoolConfig.InfoScreen) {
              navigation.replace("Info");
            } else {
              navigation.replace("Login");
            }
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
      <Image source={schoolConfig.login} style={styles.logo} />
      <Text style={styles.title}>{schoolConfig.splashscreencaption}</Text>
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
    width: "80%",
    height: 150,
    marginBottom: 10,
    resizeMode: "contain",
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
});
