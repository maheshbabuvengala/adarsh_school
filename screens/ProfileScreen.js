import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../constants/colors";
import schoolConfig from "../config/schoolConfig";

const ProfileScreen = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (!userDataString) throw new Error("User data not found");

      const userData = JSON.parse(userDataString);
      const { branch, seqStudentId } = userData;

      if (!branch || !seqStudentId)
        throw new Error("Branch or Student ID missing");

      const response = await fetch(
        ` https://oxfordjc.com/appservices/studentprofile.php?seqStudentId=${seqStudentId}&branch=${branch}`
      );
      const responseText = await response.text();

      if (responseText.includes("<html")) throw new Error("Invalid response");

      const json = JSON.parse(responseText);
      setProfileData(json[0]);
      // console.log(profileData)
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "red" }}>No profile data available.</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Student Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  profileData.stuphoto
                    ? { uri: profileData.stuphoto }
                    : require("../assets/avatar.png")
                }
                style={styles.avatar}
                resizeMode="contain"
              />
              <View style={styles.verifiedBadge}>
                <Icon name="check-decagram" size={20} color="#FFF" />
              </View>
            </View>
            <Text style={styles.schoolName}>{schoolConfig.title}</Text>
            <Text
              style={styles.userName}
            >{`${profileData.name} ${profileData.surname}`}</Text>
            <Text style={styles.userClass}>
              <Icon name="school" size={16} color={colors.primary} />{" "}
              {`${profileData.className} / ${profileData.groupName} / ${profileData.sectionName}`}
            </Text>
            <Text>Admision No:{`${profileData.admissionNo}`}</Text>
          </View>

          {/* Profile Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              <DetailItem
                icon="account"
                label="Father's Name"
                value={profileData.fatherName}
              />
              <DetailItem
                icon="phone"
                label="Contact Number"
                value={profileData.mobileNo}
              />
              <DetailItem
                icon="map-marker"
                label="Address"
                value={profileData.address}
              />
              <DetailItem
                icon="map"
                label="Location"
                value={profileData.location}
              />
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Academic Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <View
                    style={[
                      styles.infoIconContainer,
                      { backgroundColor: "#E3F2FD" },
                    ]}
                  >
                    <Icon name="calendar" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.infoLabel}>Academic Year</Text>
                  <Text style={styles.infoValue}>2024-2025</Text>
                </View>
                <View style={styles.infoItem}>
                  <View
                    style={[
                      styles.infoIconContainer,
                      { backgroundColor: "#E8F5E9" },
                    ]}
                  >
                    <Icon name="account-badge" size={20} color="#4CAF50" />
                  </View>
                  <Text style={styles.infoLabel}>Mode</Text>
                  <Text style={styles.infoValue}>
                    {profileData.modeOfAdmission}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <View style={styles.detailItem}>
    <View style={styles.detailIconContainer}>
      <Icon name={icon} size={20} color="#FFF" />
    </View>
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  gradientBackground: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0,
  },
  backButton: { padding: 10 },
  headerTitle: {
    fontSize: 22,
    color: "#FFF",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginLeft: -24,
  },
  headerRight: { width: 24 },
  scrollContent: { paddingBottom: 30 },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  verifiedBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  schoolName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 5,
    fontWeight: "500",
  },
  userName: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  userClass: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  detailsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailIconContainer: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  detailTextContainer: { flex: 1 },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  infoItem: {
    width: "48%",
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;
