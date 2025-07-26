import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../constants/colors";

const FeeDetailsScreen = ({ navigation }) => {
  const [feeData, setFeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seqStudentId, setSeqStudentId] = useState(null);
  const [branch, setBranch] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userData");
        if (!userDataString) throw new Error("User data not found");
        const userData = JSON.parse(userDataString);
        if (!userData.branch || !userData.seqStudentId) {
          throw new Error("Branch or Student ID missing");
        }

        setSeqStudentId(userData.seqStudentId);
        setBranch(userData.branch);
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", error.message || "Failed to load user data");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (seqStudentId && branch) {
      fetchFeeData();
    }
  }, [seqStudentId, branch]);

  const fetchFeeData = async () => {
    try {
      const response = await fetch(
        `https://oxfordjc.com/appservices/studentfees.php?branch=${branch}&seqStudentId=${seqStudentId}`
      );

      const responseText = await response.text();
      console.log("API Response:", responseText);

      if (
        responseText.includes("<html") ||
        responseText.includes("<!DOCTYPE")
      ) {
        throw new Error(
          "Server returned HTML instead of JSON. Please try again later."
        );
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Parsed Result:", JSON.stringify(result, null, 2));
      } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("Invalid server response format");
      }

      if (!result || (Array.isArray(result) && result.length === 0)) {
        throw new Error("No fee data found");
      }

      setFeeData(result);
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert(
        "Error",
        error.message ||
          "Failed to fetch fee data. Please check your connection."
      );
      setFeeData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value) => {
    const num = Number(value ?? 0);
    return num.toLocaleString("en-IN");
  };

  const renderFeeItem = (title, data) => {
    return (
      <View style={styles.feeItem} key={title}>
        <View style={styles.feeNameContainer}>
          <Text style={styles.feeNameText}>{title}</Text>
        </View>
        <View style={styles.feeItemDetails}>
          <View style={styles.feeDetailColumn}>
            <Text style={styles.feeDetailLabel}>Actual</Text>
            <Text style={styles.feeDetailValue}>
              ₹{formatAmount(data.Actual)}
            </Text>
          </View>
          <View style={styles.feeDetailColumn}>
            <Text style={styles.feeDetailLabel}>Committed</Text>
            <Text style={styles.feeDetailValue}>
              ₹{formatAmount(data.Committed)}
            </Text>
          </View>
          <View style={styles.feeDetailColumn}>
            <Text style={styles.feeDetailLabel}>Paid</Text>
            <Text style={[styles.feeDetailValue, styles.paidText]}>
              ₹{formatAmount(data.Paid)}
            </Text>
          </View>
          <View style={styles.feeDetailColumn}>
            <Text style={styles.feeDetailLabel}>Due</Text>
            <Text
              style={[
                styles.feeDetailValue,
                Number(data.Due) > 0 ? styles.dueText : styles.paidText,
              ]}
            >
              ₹{formatAmount(data.Due)}
            </Text>
          </View>
          <View style={styles.feeDetailColumn}>
            <Text style={styles.feeDetailLabel}>Discount</Text>
            <Text style={[styles.feeDetailValue, styles.discountText]}>
              ₹{formatAmount(data.Discount)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.gradientBackground}
      >
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fee Details</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loadingIndicator}
            />
          ) : feeData ? (
            <View style={styles.container}>
              {Array.isArray(feeData)
                ? feeData
                    .filter((item) => item.FeeName !== "Totals")
                    .map((item, index) =>
                      renderFeeItem(item.FeeName || `Fee ${index + 1}`, item)
                    )
                : Object.keys(feeData)
                    .filter((key) => key !== "Total")
                    .map((key) => renderFeeItem(key, feeData[key]))}

              {/* Total Summary */}
              {feeData.Total && (
                <View style={[styles.feeItem, styles.totalContainer]}>
                  <Text style={styles.totalTitle}>Total Summary</Text>
                  <View style={styles.feeItemDetails}>
                    <View style={styles.feeDetailColumn}>
                      <Text style={styles.feeDetailLabel}>Actual</Text>
                      <Text style={styles.feeDetailValue}>
                        ₹{formatAmount(feeData.Total.Actual)}
                      </Text>
                    </View>
                    <View style={styles.feeDetailColumn}>
                      <Text style={styles.feeDetailLabel}>Committed</Text>
                      <Text style={styles.feeDetailValue}>
                        ₹{formatAmount(feeData.Total.Committed)}
                      </Text>
                    </View>
                    <View style={styles.feeDetailColumn}>
                      <Text style={styles.feeDetailLabel}>Paid</Text>
                      <Text style={[styles.feeDetailValue, styles.paidText]}>
                        ₹{formatAmount(feeData.Total.Paid)}
                      </Text>
                    </View>
                    <View style={styles.feeDetailColumn}>
                      <Text style={styles.feeDetailLabel}>Due</Text>
                      <Text
                        style={[
                          styles.feeDetailValue,
                          Number(feeData.Total.Due) > 0
                            ? styles.dueText
                            : styles.paidText,
                        ]}
                      >
                        ₹{formatAmount(feeData.Total.Due)}
                      </Text>
                    </View>
                    <View style={styles.feeDetailColumn}>
                      <Text style={styles.feeDetailLabel}>Discount</Text>
                      <Text
                        style={[styles.feeDetailValue, styles.discountText]}
                      >
                        ₹{formatAmount(feeData.Total.Discount)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {feeData.Total?.Due > 0 && (
                <TouchableOpacity style={styles.payNowButton}>
                  <Text style={styles.payNowButtonText}>
                    Pay Now (₹{formatAmount(feeData.Total.Due)})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon
                name="alert-circle"
                size={40}
                color={colors.textSecondary}
              />
              <Text style={styles.noDataText}>No fee data available</Text>
              <TouchableOpacity
                onPress={fetchFeeData}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
    padding: 15,
    marginLeft: -10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: "#FFF",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginLeft: -24,
  },
  headerRight: {
    width: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  container: {
    padding: 15,
  },
  loadingIndicator: {
    marginVertical: 40,
  },
  feeItem: {
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feeNameContainer: {
    marginBottom: 10,
  },
  feeNameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  feeItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feeDetailColumn: {
    alignItems: "center",
  },
  feeDetailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  feeDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  paidText: {
    color: "#4CAF50",
  },
  dueText: {
    color: "#F44336",
    fontWeight: "bold",
  },
  discountText: {
    color: "#FF9800",
  },
  totalContainer: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  totalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  payNowButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payNowButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noDataText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginVertical: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});

export default FeeDetailsScreen;
