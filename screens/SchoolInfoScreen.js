import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors"; // ✅ Global colors

export default function SchoolInfoScreen({ navigation }) {
  const [branches, setBranches] = useState({});
  const [branch, setBranch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const fetchData = async (selectedBranch = "") => {
    setLoading(true);
    setError("");
    try {
      const url = selectedBranch
        ? `https://adarshemschool.com/appservices/apphomepage.php?branch=${selectedBranch}`
        : `https://adarshemschool.com/appservices/apphomepage.php`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const text = await response.text();
      try {
        const jsonData = JSON.parse(text);

        if (!selectedBranch && jsonData.branch) {
          setBranches(jsonData.branch);
          const firstKey = Object.keys(jsonData.branch)[0];
          if (firstKey) setBranch(firstKey);
        }

        setData(jsonData);
      } catch {
        throw new Error("Invalid JSON response from API");
      }
    } catch (err) {
      setError(err.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (branch) {
      fetchData(branch);
    }
  }, [branch]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Image
            source={require("../assets/logo.png")} // ✅ change path to your logo
            style={styles.logo}
          />
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.header}>School Information</Text>

        {/* Branch Dropdown */}
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {branches[branch] || "Select Branch"}
          </Text>
        </TouchableOpacity>

        {/* Dropdown Modal */}
        <Modal
          visible={dropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setDropdownVisible(false)}
          >
            <View style={styles.dropdownList}>
              <FlatList
                data={Object.entries(branches)}
                keyExtractor={([key]) => key}
                renderItem={({ item: [key, value] }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setBranch(key);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{value}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {loading && <ActivityIndicator size="large" color={colors.primary} />}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {data && (
          <>
            {data.notifications && (
              <>
                <Text style={styles.subHeader}>Notifications:</Text>
                {Object.values(data.notifications).map((n, idx) => (
                  <View key={idx} style={styles.card}>
                    <Text style={styles.text}>📅 {n.Date}</Text>
                    <Text style={styles.text}>{n.Message}</Text>
                  </View>
                ))}
              </>
            )}

            {data.activities && (
              <>
                <Text style={styles.subHeader}>Activities:</Text>
                <View style={styles.card}>
                  {data.activities.activityImage && (
                    <Image
                      source={{
                        uri:
                          "https://" +
                          data.activities.activityImage.replace(/#/g, "/"),
                      }}
                      style={styles.activityImage}
                    />
                  )}
                  <Text style={styles.text}>
                    {data.activities.activityName} (ID:{" "}
                    {data.activities.activityId})
                  </Text>
                  {data.activities.subject && (
                    <Text style={styles.text}>
                      Subject: {data.activities.subject}
                    </Text>
                  )}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundGradient[0],
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: colors.backgroundGradient[0],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 50,
    resizeMode: "contain",
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: colors.textPrimary,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    color: colors.textSecondary,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.cardBackground,
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  error: {
    color: colors.error,
    marginTop: 10,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.backgroundGradient[1],
    marginBottom: 15,
  },
  dropdownButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.modalOverlay,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownList: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    width: "80%",
    maxHeight: "50%",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  activityImage: {
    width: "100%",
    height: 180,
    borderRadius: 6,
    marginBottom: 8,
    resizeMode: "cover",
  },
});
