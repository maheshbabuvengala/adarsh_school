import React, { useRef, useState } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../constants/colors"; // 👈 uses same theme as your FeeDetailsScreen

const CCAvenuePaymentScreen = ({ route, navigation }) => {
  const { branch, seqStudentId, amount } = route.params;
  const webviewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const paymentUrl = `https://oxfordjc.com/gatewaypayment.php?branch=${branch}&seqStudentId=${seqStudentId}&amount=${amount}`;

  const handleNavigationChange = (navState) => {
    const { url } = navState;
    // Detect callback or confirmation page
    if (
      url.includes("ccavResponseHandler") ||
      url.includes("paymentstatus") ||
      url.includes("success")
    ) {
      webviewRef.current.injectJavaScript(`
        window.ReactNativeWebView.postMessage(document.documentElement.outerHTML);
      `);
    }
  };

  const handleMessage = (event) => {
    const html = event.nativeEvent.data;

    if (html.includes("Success")) {
      Alert.alert("Payment Success", "Your payment was successful!");
      navigation.navigate("FeeDetailsScreen", { fromPaymentSuccess: true });
    } else if (html.includes("Failure")) {
      Alert.alert("Payment Failed", "Please try again.");
      navigation.goBack();
    } else if (html.includes("Aborted") || html.includes("Cancel")) {
      Alert.alert("Payment Cancelled", "You cancelled the payment.");
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.gradientBackground}
      >
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={colors.buttonText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pay Fee</Text>
          <View style={styles.headerRight} />
        </View>

        {/* WebView Container */}
        <View style={styles.container}>
          <WebView
            ref={webviewRef}
            source={{ uri: paymentUrl }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onNavigationStateChange={handleNavigationChange}
            onMessage={handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />

          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading payment page...</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: colors.buttonText,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginLeft: -24,
  },
  headerRight: {
    width: 24,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.textPrimary,
    fontSize: 14,
  },
});

export default CCAvenuePaymentScreen;
