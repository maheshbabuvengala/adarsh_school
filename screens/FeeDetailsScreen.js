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
            <Icon name="arrow-left" size={24} color={colors.buttonText} />
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
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.headerCell]}>
                  Fee Name
                </Text>
                <Text style={[styles.tableCell, styles.headerCell]}>
                  Actual
                </Text>
                <Text style={[styles.tableCell, styles.headerCell]}>
                  Committed
                </Text>
                <Text style={[styles.tableCell, styles.headerCell]}>Paid</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>Due</Text>
                <Text style={[styles.tableCell, styles.headerCell]}>
                  Discount
                </Text>
              </View>

              {/* Fee Rows */}
              {Array.isArray(feeData)
                ? feeData
                    .filter((item) => item.FeeName !== "Totals")
                    .map((item, index) => (
                      <View style={styles.tableRow} key={index}>
                        <Text style={styles.tableCell}>{item.FeeName}</Text>
                        <Text style={styles.tableCell}>
                          ₹{formatAmount(item.Actual)}
                        </Text>
                        <Text style={styles.tableCell}>
                          ₹{formatAmount(item.Committed)}
                        </Text>
                        <Text style={[styles.tableCell, styles.paidText]}>
                          ₹{formatAmount(item.Paid)}
                        </Text>
                        <Text
                          style={[
                            styles.tableCell,
                            Number(item.Due) > 0
                              ? styles.dueText
                              : styles.paidText,
                          ]}
                        >
                          ₹{formatAmount(item.Due)}
                        </Text>
                        <Text style={[styles.tableCell, styles.discountText]}>
                          ₹{formatAmount(item.Discount)}
                        </Text>
                      </View>
                    ))
                : Object.keys(feeData)
                    .filter((key) => key !== "Total")
                    .map((key, index) => (
                      <View style={styles.tableRow} key={index}>
                        <Text style={styles.tableCell}>{key}</Text>
                        <Text style={styles.tableCell}>
                          ₹{formatAmount(feeData[key].Actual)}
                        </Text>
                        <Text style={styles.tableCell}>
                          ₹{formatAmount(feeData[key].Committed)}
                        </Text>
                        <Text style={[styles.tableCell, styles.paidText]}>
                          ₹{formatAmount(feeData[key].Paid)}
                        </Text>
                        <Text
                          style={[
                            styles.tableCell,
                            Number(feeData[key].Due) > 0
                              ? styles.dueText
                              : styles.paidText,
                          ]}
                        >
                          ₹{formatAmount(feeData[key].Due)}
                        </Text>
                        <Text style={[styles.tableCell, styles.discountText]}>
                          ₹{formatAmount(feeData[key].Discount)}
                        </Text>
                      </View>
                    ))}

              {/* Total Summary */}
              {feeData.Total && (
                <>
                  <View style={styles.tableHeader}>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.headerCell,
                        { color: colors.primary },
                      ]}
                    >
                      Total Summary
                    </Text>
                    <Text style={styles.tableCell}></Text>
                    <Text style={styles.tableCell}></Text>
                    <Text style={styles.tableCell}></Text>
                    <Text style={styles.tableCell}></Text>
                    <Text style={styles.tableCell}></Text>
                  </View>
                  <View
                    style={[styles.tableRow, { backgroundColor: "#f9f9f9" }]}
                  >
                    <Text style={styles.tableCell}>Total</Text>
                    <Text style={styles.tableCell}>
                      ₹{formatAmount(feeData.Total.Actual)}
                    </Text>
                    <Text style={styles.tableCell}>
                      ₹{formatAmount(feeData.Total.Committed)}
                    </Text>
                    <Text style={[styles.tableCell, styles.paidText]}>
                      ₹{formatAmount(feeData.Total.Paid)}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        Number(feeData.Total.Due) > 0
                          ? styles.dueText
                          : styles.paidText,
                      ]}
                    >
                      ₹{formatAmount(feeData.Total.Due)}
                    </Text>
                    <Text style={[styles.tableCell, styles.discountText]}>
                      ₹{formatAmount(feeData.Total.Discount)}
                    </Text>
                  </View>

                  {feeData.Total.Due > 0 && (
                    <TouchableOpacity style={styles.payNowButton}>
                      <Text style={styles.payNowButtonText}>
                        Pay Now (₹{formatAmount(feeData.Total.Due)})
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
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
    color: colors.buttonText,
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
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#EEE",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    textAlign: "center",
    color: colors.textPrimary,
  },
  headerCell: {
    fontWeight: "bold",
    color: colors.textTertiary,
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
  payNowButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payNowButtonText: {
    color: colors.buttonText,
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
    color: colors.buttonText,
    fontSize: 16,
  },
});

export default FeeDetailsScreen;
