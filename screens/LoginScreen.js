import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
  Linking,
  Dimensions,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../constants/colors";
// import logo from "../assets/logo.png";
import schoolConfig from "../config/schoolConfig";

const LoginScreen = ({ navigation }) => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = React.useRef(null);

  const windowWidth = Dimensions.get("window").width;
  const isLargeScreen = windowWidth > 768;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          navigation.navigate("Dashboard");
        }
      } catch (error) {
        console.error("Error checking login status:", error);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (!loginId.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both login ID and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://oxfordjc.com/appservices/logincheck.php?loginId=${encodeURIComponent(loginId)}&password=${encodeURIComponent(password)}`
      );

      const result = await response.json();

      if (result.Status === 1) {
        // Successful login
        const userData = {
          loginId: result.LoginId,
          userName: result.UserName,
          seqStudentId: result.seqStudentId,
          branch: result.branch,
          isLoggedIn: true,
        };

        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        console.log("User data stored:", userData);

        navigation.navigate("Dashboard");
      } else {
        Alert.alert("Error", "Invalid login ID or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        "Failed to login. Please check your internet connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    setTimeout(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }, 100);
  };

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            isLargeScreen && styles.scrollLarge,
            Platform.OS === "web" ? { minHeight: "100vh" } : {},
          ]}
          style={Platform.OS === "web" ? { height: "100vh" } : {}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[
              styles.innerContainer,
              isLargeScreen && styles.innerContainerLarge,
            ]}
            keyboardVerticalOffset={Platform.OS === "ios" ? hp("2%") : 0}
          >
            <View style={styles.header}>
              <Image
                source={schoolConfig.logo}
                style={[styles.logo, isLargeScreen && styles.logoLarge]}
                resizeMode="contain"
              />
            </View>

            <View style={[styles.card, isLargeScreen && styles.cardLarge]}>
              {schoolConfig.splashscreencaption ? (<Text style={styles.loginTitle}>{schoolConfig.splashscreencaption}</Text>):null}
              <Text style={styles.loginSubtitle}>Sign in to continue</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  label="Login ID"
                  mode="outlined"
                  value={loginId}
                  onChangeText={setLoginId}
                  style={styles.input}
                  left={
                    <TextInput.Icon icon="account" color={colors.inputIcon} />
                  }
                  theme={{
                    colors: {
                      primary: colors.primary,
                      placeholder: colors.inputPlaceholder,
                      text: colors.inputText,
                      background: colors.inputBackground,
                    },
                    roundness: 10,
                  }}
                />
                <TextInput
                  ref={passwordInputRef}
                  label="Password"
                  mode="outlined"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" color={colors.inputIcon} />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? "eye-off" : "eye"}
                      color={colors.inputIcon}
                      onPress={togglePasswordVisibility}
                    />
                  }
                  theme={{
                    colors: {
                      primary: colors.primary,
                      placeholder: colors.inputPlaceholder,
                      text: colors.inputText,
                      background: colors.inputBackground,
                    },
                    roundness: 10,
                  }}
                />
              </View>

              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.primary}
                  style={styles.loadingIndicator}
                />
              ) : (
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  labelStyle={styles.loginButtonText}
                  contentStyle={styles.loginButtonContent}
                  icon="login"
                  theme={{
                    colors: {
                      primary: colors.primary,
                    },
                  }}
                >
                  Login
                </Button>
              )}
            </View>

            <View
              style={[
                styles.contactContainer,
                isLargeScreen && styles.contactContainerLarge,
              ]}
            >
              <View
                style={[
                  styles.contactRow,
                  isLargeScreen && styles.contactRowLarge,
                ]}
              >
                {/* <View style={styles.contactItem}>
                  <Icon
                    name="phone"
                    size={hp("2.5%")}
                    color={colors.primary}
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>{schoolConfig.phoneno}</Text>
                </View> */}
                {schoolConfig.phoneno?(<View style={styles.contactItem}>
                  <Icon
                    name="phone"
                    size={hp("2.5%")}
                    color={colors.primary}
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>{schoolConfig.phoneno}</Text>
                </View>):null}
                
                {schoolConfig.email?(<View style={styles.contactItem}>
                  <Icon
                    name="email"
                    size={hp("2.5%")}
                    color={colors.primary}
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>
                    {schoolConfig.email}
                  </Text>
                </View>):null}
                
                {schoolConfig.location ? (<View style={styles.contactItem}>
                  <Icon
                    name="map-marker"
                    size={hp("2.5%")}
                    color={colors.primary}
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>{schoolConfig.location}</Text>
                </View>) : null}
              </View>

              {/* <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://adarshemschool.com/stulogin2024/privacy_policy.php"
                  )
                }
                style={styles.privacyButton}
              >
                <Icon
                  name="shield-lock"
                  size={hp("2.2%")}
                  color={colors.primary}
                  style={styles.privacyIcon}
                />
                <Text style={styles.privacyText}>Privacy Policy</Text>
              </TouchableOpacity> */}
              {schoolConfig.privacypolicy ? (<TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    schoolConfig.privacypolicy
                  )
                }
                style={styles.privacyButton}
              >
                <Icon
                  name="shield-lock"
                  size={hp("2.2%")}
                  color={colors.primary}
                  style={styles.privacyIcon}
                />
                <Text style={styles.privacyText}>Privacy Policy</Text>
              </TouchableOpacity>) : null}
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: hp("2%"),
    paddingBottom: hp("4%"),
  },
  scrollLarge: {
    maxWidth: 500,
    marginHorizontal: "auto",
    paddingTop: 40,
    paddingBottom: 40,
  },
  innerContainer: {
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
  },
  innerContainerLarge: {
    maxWidth: 450,
  },
  header: {
    alignItems: "center",
    marginBottom: hp("3%"),
  },
  logo: {
    width: wp("80%"),
    height: hp("18%"),
    marginBottom: hp("0.3%"),
  },
  logoLarge: {
    width: wp("60%"),
    height: hp("13%"),
    marginBottom: hp("0.3%"),
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: wp("6%"),
    paddingVertical: hp("3.5%"),
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: hp("3%"),
  },
  cardLarge: {
    maxWidth: 450,
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  loginTitle: {
    fontSize: hp("3.2%"),
    fontFamily: "Roboto-Bold",
    textAlign: "center",
    color: colors.textPrimary,
    marginBottom: hp("0.5%"),
  },
  loginSubtitle: {
    fontSize: hp("1.9%"),
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    color: colors.textSecondary,
    marginBottom: hp("3%"),
  },
  inputContainer: {
    marginBottom: hp("1%"),
  },
  input: {
    marginBottom: hp("2%"),
    backgroundColor: colors.inputBackground,
    fontSize: hp("1.9%"),
    fontFamily: "Roboto-Regular",
  },
  loginButton: {
    marginTop: hp("1%"),
    borderRadius: 10,
    paddingVertical: hp("0.8%"),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: hp("2.1%"),
    fontFamily: "Roboto-Medium",
    letterSpacing: 0.5,
    color: colors.buttonText,
  },
  loginButtonContent: {
    height: hp("5.5%"),
  },
  loadingIndicator: {
    marginTop: hp("3%"),
    marginBottom: hp("1%"),
  },
  contactContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("3%"),
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  contactContainerLarge: {
    maxWidth: 450,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: wp("2%"),
    marginBottom: hp("1.5%"),
  },
  contactRowLarge: {
    flexDirection: "row",
    gap: 20,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    minWidth: "45%",
    flexGrow: 1,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("3%"),
    backgroundColor: colors.contactBackground,
    borderRadius: 10,
    minHeight: hp("5%"),
  },
  contactIcon: {
    marginRight: wp("2%"),
  },
  contactText: {
    fontSize: hp("1.8%"),
    fontFamily: "Roboto-Regular",
    color: colors.textTertiary,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  privacyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("2%"),
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("6%"),
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: "center",
  },
  privacyIcon: {
    marginRight: wp("1%"),
  },
  privacyText: {
    color: colors.primary,
    fontFamily: "Roboto-Medium",
    fontSize: hp("1.8%"),
  },
});

export default LoginScreen;