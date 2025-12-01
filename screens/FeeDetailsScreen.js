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
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import colors from "../constants/colors";
import * as WebBrowser from "expo-web-browser";

const FeeDetailsScreen = ({ navigation, route }) => {
  const [feeData, setFeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [seqStudentId, setSeqStudentId] = useState(null);
  const [branch, setBranch] = useState(null);
  const [totalDue, setTotalDue] = useState(0);
  const [totalCommitted, setTotalCommitted] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const isFocused = useIsFocused();

  // Check if coming from payment success deep link
  useEffect(() => {
    if (route.params?.fromPaymentSuccess) {
      Alert.alert(
        "Payment Successful!",
        "Thank you for your payment. Your fee details have been updated."
      );
    }
  }, [route.params]);

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

  // Refresh data when screen comes into focus (including from deep link)
  useEffect(() => {
    if (isFocused && seqStudentId && branch) {
      fetchFeeData();
    }
  }, [isFocused, seqStudentId, branch]);

  const fetchFeeData = async () => {
    try {
      setIsLoading(true);
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

      // Use backend calculated totals directly
      extractBackendTotals(result);
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert(
        "Error",
        error.message ||
          "Failed to fetch fee data. Please check your connection."
      );
      setFeeData(null);
      setTotalDue(0);
      setTotalCommitted(0);
      setTotalPaid(0);
    } finally {
      setIsLoading(false);
    }
  };

  const extractBackendTotals = (data) => {
    // Use the totals provided by backend API directly
    if (Array.isArray(data)) {
      // Find the total row in array data
      const totalRow = data.find(
        (item) => item.FeeName && item.FeeName.toLowerCase().includes("total")
      );
      if (totalRow) {
        setTotalCommitted(Number(totalRow.Committed) || 0);
        setTotalPaid(Number(totalRow.Paid) || 0);
        setTotalDue(Number(totalRow.Due) || 0);
      }
    } else if (data.Total) {
      // If data has a Total object
      setTotalCommitted(Number(data.Total.Committed) || 0);
      setTotalPaid(Number(data.Total.Paid) || 0);
      setTotalDue(Number(data.Total.Due) || 0);
    } else {
      // If data is an object, look for total key
      const totalKey = Object.keys(data).find((key) =>
        key.toLowerCase().includes("total")
      );
      if (totalKey && data[totalKey]) {
        setTotalCommitted(Number(data[totalKey].Committed) || 0);
        setTotalPaid(Number(data[totalKey].Paid) || 0);
        setTotalDue(Number(data[totalKey].Due) || 0);
      }
    }
  };

  const handlePayNow = async (amount = totalDue) => {
    navigation.navigate("CCAvenuePaymentScreen", {
      branch,
      seqStudentId,
      amount,
    });
  };

  const handleCustomAmountPay = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    handlePayNow(amount);
  };

  const formatAmount = (value) => {
    const num = Number(value ?? 0);
    return num.toLocaleString("en-IN");
  };

  // Function to render fee rows based on data structure
  const renderFeeRows = () => {
    if (Array.isArray(feeData)) {
      return feeData
        .filter(
          (item) =>
            item.FeeName && !item.FeeName.toLowerCase().includes("total")
        )
        .map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCell}>{item.FeeName}</Text>
            <Text style={styles.tableCell}>
              ₹{formatAmount(item.Committed)}
            </Text>
            <Text style={[styles.tableCell, styles.paidText]}>
              ₹{formatAmount(item.Paid)}
            </Text>
            <Text
              style={[
                styles.tableCell,
                Number(item.Due) > 0 ? styles.dueText : styles.paidText,
              ]}
            >
              ₹{formatAmount(item.Due)}
            </Text>
          </View>
        ));
    } else {
      return Object.keys(feeData)
        .filter(
          (key) => key !== "Total" && !key.toLowerCase().includes("total")
        )
        .map((key, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCell}>{key}</Text>
            <Text style={styles.tableCell}>
              ₹{formatAmount(feeData[key].Committed)}
            </Text>
            <Text style={[styles.tableCell, styles.paidText]}>
              ₹{formatAmount(feeData[key].Paid)}
            </Text>
            <Text
              style={[
                styles.tableCell,
                Number(feeData[key].Due) > 0 ? styles.dueText : styles.paidText,
              ]}
            >
              ₹{formatAmount(feeData[key].Due)}
            </Text>
          </View>
        ));
    }
  };

  // Function to render total row from backend data
  const renderTotalRow = () => {
    if (Array.isArray(feeData)) {
      const totalRow = feeData.find(
        (item) => item.FeeName && item.FeeName.toLowerCase().includes("total")
      );
      if (totalRow) {
        return (
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.totalRowText]}>
              {totalRow.FeeName}
            </Text>
            <Text style={[styles.tableCell, styles.totalRowText]}>
              ₹{formatAmount(totalRow.Committed)}
            </Text>
            <Text
              style={[styles.tableCell, styles.paidText, styles.totalRowText]}
            >
              ₹{formatAmount(totalRow.Paid)}
            </Text>
            <Text
              style={[
                styles.tableCell,
                Number(totalRow.Due) > 0 ? styles.dueText : styles.paidText,
                styles.totalRowText,
              ]}
            >
              ₹{formatAmount(totalRow.Due)}
            </Text>
          </View>
        );
      }
    } else if (feeData.Total) {
      return (
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text style={[styles.tableCell, styles.totalRowText]}>Total</Text>
          <Text style={[styles.tableCell, styles.totalRowText]}>
            ₹{formatAmount(feeData.Total.Committed)}
          </Text>
          <Text
            style={[styles.tableCell, styles.paidText, styles.totalRowText]}
          >
            ₹{formatAmount(feeData.Total.Paid)}
          </Text>
          <Text
            style={[
              styles.tableCell,
              Number(feeData.Total.Due) > 0 ? styles.dueText : styles.paidText,
              styles.totalRowText,
            ]}
          >
            ₹{formatAmount(feeData.Total.Due)}
          </Text>
        </View>
      );
    } else {
      const totalKey = Object.keys(feeData).find((key) =>
        key.toLowerCase().includes("total")
      );
      if (totalKey && feeData[totalKey]) {
        return (
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.totalRowText]}>
              {totalKey}
            </Text>
            <Text style={[styles.tableCell, styles.totalRowText]}>
              ₹{formatAmount(feeData[totalKey].Committed)}
            </Text>
            <Text
              style={[styles.tableCell, styles.paidText, styles.totalRowText]}
            >
              ₹{formatAmount(feeData[totalKey].Paid)}
            </Text>
            <Text
              style={[
                styles.tableCell,
                Number(feeData[totalKey].Due) > 0
                  ? styles.dueText
                  : styles.paidText,
                styles.totalRowText,
              ]}
            >
              ₹{formatAmount(feeData[totalKey].Due)}
            </Text>
          </View>
        );
      }
    }

    // Fallback to calculated totals if no backend total found
    return (
      <View style={[styles.tableRow, styles.totalRow]}>
        <Text style={[styles.tableCell, styles.totalRowText]}>Total</Text>
        <Text style={[styles.tableCell, styles.totalRowText]}>
          ₹{formatAmount(totalCommitted)}
        </Text>
        <Text style={[styles.tableCell, styles.paidText, styles.totalRowText]}>
          ₹{formatAmount(totalPaid)}
        </Text>
        <Text
          style={[
            styles.tableCell,
            totalDue > 0 ? styles.dueText : styles.paidText,
            styles.totalRowText,
          ]}
        >
          ₹{formatAmount(totalDue)}
        </Text>
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
            <Icon name="arrow-left" size={24} color={colors.buttonText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fee Details</Text>
          <View style={styles.headerRight} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
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
                    Committed
                  </Text>
                  <Text style={[styles.tableCell, styles.headerCell]}>
                    Paid
                  </Text>
                  <Text style={[styles.tableCell, styles.headerCell]}>Due</Text>
                </View>

                {/* Fee Rows - Only individual fee items */}
                {renderFeeRows()}

                {/* Total Summary - Directly from backend API */}
                {renderTotalRow()}

                {/* Payment Options - Show when there's due amount */}
                {totalDue > 0 && (
                  <View style={styles.customAmountContainer}>
                    <View style={styles.amountInputRow}>
                      <Text style={styles.customAmountLabel}>
                        Paying Amount
                      </Text>
                      <View style={styles.amountInputWrapper}>
                        <View style={styles.amountInputContainer}>
                          <Text style={styles.currencySymbol}>₹</Text>
                          <TextInput
                            style={styles.amountInput}
                            placeholder="Enter amount"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={customAmount}
                            onChangeText={setCustomAmount}
                            maxLength={10}
                          />
                        </View>
                        <Text style={styles.maxAmountText}>
                          {`(Max Amount: ₹${formatAmount(totalDue)})`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.bottomRow}>
                      <TouchableOpacity
                        onPress={handleCustomAmountPay}
                        style={styles.confirmPayButton}
                        disabled={!customAmount}
                      >
                        <LinearGradient
                          colors={["#4CAF50", "#45a049"]}
                          style={styles.confirmPayGradient}
                        >
                          <Text style={styles.confirmPayButtonText}>
                            Pay ₹{customAmount || "0"}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
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
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Updated styles to remove discount column
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  gradientBackground: {
    flex: 1,
  },
  keyboardAvoid: {
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
  totalRow: {
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    marginVertical: 2,
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    textAlign: "center",
    color: colors.textPrimary,
  },
  totalRowText: {
    fontWeight: "bold",
    color: "black",
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
  customAmountContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  customAmountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 25,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  amountInput: {
    fontSize: 16,
    color: "#333",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  maxAmountText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    textAlign: "left",
    paddingLeft: 4,
  },
  confirmPayButton: {
    width: "40%",
    borderRadius: 8,
    overflow: "hidden",
  },
  confirmPayGradient: {
    padding: 12,
    alignItems: "center",
  },
  confirmPayButtonText: {
    color: "white",
    fontSize: 14,
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
