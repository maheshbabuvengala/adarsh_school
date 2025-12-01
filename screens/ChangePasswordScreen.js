import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info"); // 'info', 'success', 'error'
  const [modalAction, setModalAction] = useState(null);

  // Refs for scrolling and focusing
  const scrollViewRef = useRef(null);
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useEffect(() => {
    loadUserData();
    
    // Optional: Add keyboard listeners if needed for specific behavior
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Scroll to position when keyboard appears if needed
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Reset scroll position when keyboard hides if needed
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");

      if (userDataString) {
        const parsedUserData = JSON.parse(userDataString);
        console.log("User data loaded:", parsedUserData.loginId);
        setUserData(parsedUserData);
      }
    } catch (error) {
      console.log("Error loading user data", error);
      showModal("Error", "Failed to load user data", "error");
    }
  };

  // Focus next input
  const focusNextInput = (nextRef) => {
    nextRef.current?.focus();
  };

  // Show modal function
  const showModal = (title, message, type = "info", action = null) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalAction(() => action);
    setModalVisible(true);
  };

  // Hide modal function
  const hideModal = () => {
    setModalVisible(false);
    setModalAction(null);
  };

  // Handle modal OK button press
  const handleModalOK = () => {
    hideModal();
    // Execute the stored action after modal closes
    if (modalAction) {
      // Add a small delay for smoother transition
      setTimeout(() => {
        modalAction();
      }, 100);
    }
  };

  const validatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showModal("Error", "Please fill in all fields", "error");
      return false;
    }

    if (newPassword !== confirmPassword) {
      showModal("Error", "New passwords do not match", "error");
      return false;
    }

    if (newPassword.length < 6) {
      showModal("Error", "Password must be at least 6 characters long", "error");
      return false;
    }

    if (newPassword === currentPassword) {
      showModal(
        "Error",
        "New password must be different from current password",
        "error"
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    // Dismiss keyboard when submitting
    Keyboard.dismiss();
    
    if (!validatePassword()) {
      return;
    }

    if (!userData) {
      showModal("Error", "User data not loaded. Please try again.", "error");
      return;
    }

    if (!userData.branch || !userData.seqStudentId) {
      showModal(
        "Error",
        "Incomplete user information. Please contact support.",
        "error"
      );
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const apiUrl = "https://oxfordjc.com/appservices/updatestudentpw.php";

      const formData = new FormData();
      formData.append("branch", userData.branch);
      formData.append("seqStudentId", userData.seqStudentId.toString());
      formData.append("password", newPassword);

      console.log("Sending request with data:", {
        branch: userData.branch,
        seqStudentId: userData.seqStudentId,
        password: newPassword,
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      let responseData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        const textResponse = await response.text();
        console.log("Raw response:", textResponse);
        try {
          responseData = JSON.parse(textResponse);
        } catch (e) {
          responseData = { message: textResponse };
        }
      }

      console.log("API Response:", responseData);

      if (response.ok) {
        if (
          responseData.Status === "Success" ||
          responseData.status === "success" ||
          responseData.message === "success" ||
          responseData.success
        ) {
          showModal(
            "Success",
            "Password updated successfully!",
            "success",
            () => {
              // Clear form fields
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              // Navigate to dashboard after modal OK button is pressed
              // Replace "Dashboard" with your actual dashboard screen name
              navigation.navigate("Dashboard");
            }
          );
        } else {
          const errorMessage =
            responseData.message ||
            responseData.error ||
            responseData.Message ||
            "Password update failed";
          setApiError(errorMessage);
          showModal("Error", errorMessage, "error");
        }
      } else {
        const errorMessage =
          responseData.message ||
          responseData.error ||
          responseData.Message ||
          `Server error: ${response.status}`;
        setApiError(errorMessage);
        showModal("Error", errorMessage, "error");
      }
    } catch (error) {
      console.error("API Error:", error);
      const errorMessage =
        error.message || "Network error. Please check your connection.";
      setApiError(errorMessage);
      showModal("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Get modal icon based on type
  const getModalIcon = () => {
    switch (modalType) {
      case "success":
        return "check-circle";
      case "error":
        return "alert-circle";
      default:
        return "information";
    }
  };

  // Get modal icon color based on type
  const getModalIconColor = () => {
    switch (modalType) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      default:
        return colors.primary;
    }
  };

  // Get modal button color based on type
  const getModalButtonColor = () => {
    switch (modalType) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#F44336";
      default:
        return colors.primary;
    }
  };

  // Handle container press to dismiss keyboard
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Scroll to input when focused (simplified version)
  const scrollToInput = (reactNode) => {
    if (scrollViewRef.current) {
      // You can implement custom scroll logic here if needed
      scrollViewRef.current.scrollTo({ y: 100, animated: true });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
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
              disabled={loading}
            >
              <Icon name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={styles.headerRight} />
          </View>

          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              // Remove the problematic Animated.event and use a simple handler
              onScroll={(event) => {
                // You can handle scroll events here if needed
                // For example: handleScroll(event.nativeEvent.contentOffset.y);
              }}
              scrollEventThrottle={16}
            >
              <View style={styles.userIdContainer}>
                <Text style={styles.userIdLabel}>User ID:</Text>
                <Text style={styles.userIdValue}>
                  {userData ? userData.loginId : "Loading..."}
                </Text>
              </View>

              {apiError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{apiError}</Text>
                </View>
              ) : null}

              <View style={styles.formContainer}>
                {/* Current Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Current Password</Text>
                  <View style={styles.passwordInput}>
                    <TextInput
                      ref={currentPasswordRef}
                      style={styles.input}
                      placeholder="Enter current password"
                      secureTextEntry={!showCurrentPassword}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      autoCapitalize="none"
                      editable={!loading}
                      returnKeyType="next"
                      onSubmitEditing={() => focusNextInput(newPasswordRef)}
                      blurOnSubmit={false}
                      onFocus={() => scrollToInput(currentPasswordRef)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      style={styles.eyeIcon}
                      disabled={loading}
                    >
                      <Icon
                        name={showCurrentPassword ? "eye-off" : "eye"}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Password</Text>
                  <View style={styles.passwordInput}>
                    <TextInput
                      ref={newPasswordRef}
                      style={styles.input}
                      placeholder="Enter new password"
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      autoCapitalize="none"
                      editable={!loading}
                      returnKeyType="next"
                      onSubmitEditing={() => focusNextInput(confirmPasswordRef)}
                      blurOnSubmit={false}
                      onFocus={() => scrollToInput(newPasswordRef)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      style={styles.eyeIcon}
                      disabled={loading}
                    >
                      <Icon
                        name={showNewPassword ? "eye-off" : "eye"}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.passwordHint}>
                    Must be at least 6 characters long
                  </Text>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.passwordInput}>
                    <TextInput
                      ref={confirmPasswordRef}
                      style={styles.input}
                      placeholder="Confirm new password"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      autoCapitalize="none"
                      editable={!loading}
                      returnKeyType="done"
                      onSubmitEditing={handleChangePassword}
                      onFocus={() => scrollToInput(confirmPasswordRef)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeIcon}
                      disabled={loading}
                    >
                      <Icon
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Modal Component */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={hideModal}
          >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                      <Icon
                        name={getModalIcon()}
                        size={40}
                        color={getModalIconColor()}
                      />
                    </View>
                    
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>{modalTitle}</Text>
                      <Text style={styles.modalMessage}>{modalMessage}</Text>
                    </View>

                    <View style={styles.modalFooter}>
                      <Pressable
                        style={[
                          styles.modalButton,
                          { backgroundColor: getModalButtonColor() },
                        ]}
                        onPress={handleModalOK}
                      >
                        <Text style={styles.modalButtonText}>
                          {modalType === "success" ? "OK" : "Try Again"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </LinearGradient>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  keyboardAvoidingView: {
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
    marginLeft: -10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
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
    paddingBottom: 40,
  },
  userIdContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  userIdLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 5,
  },
  userIdValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 4,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: "500",
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 10,
  },
  passwordHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    fontStyle: "italic",
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalContent: {
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  modalButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePasswordScreen;