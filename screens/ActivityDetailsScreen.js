import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../constants/colors";

const ActivityDetailsScreen = ({ route, navigation }) => {
  const { activity } = route.params;

  const getIconByType = (type) => {
    switch (type?.toLowerCase()) {
      case "science":
        return "flask";
      case "quiz":
        return "help-circle";
      case "cultural":
        return "music";
      default:
        return "calendar-text";
    }
  };

  const getColorByType = (type) => {
    switch (type?.toLowerCase()) {
      case "science":
        return "#4CAF50";
      case "quiz":
        return "#2196F3";
      case "cultural":
        return "#9C27B0";
      default:
        return colors.primary;
    }
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


          <Text style={styles.headerTitle}>Activity Details</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getColorByType(activity.type) },
            ]}
          >
            <Icon name={getIconByType(activity.type)} size={48} color="#FFF" />
          </View>

          {activity.image ? (
            <Image
              source={{ uri: activity.image }}
              style={styles.activityImage}
              resizeMode="cover"
            />
          ) : null}

          <Text style={styles.activityTitle}>{activity.title}</Text>

          {activity.date ? (
            <Text style={styles.activityDate}>{activity.date}</Text>
          ) : null}

          <Text style={styles.activityDescription}>{activity.description}</Text>
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0,
  },
  backButton: {
  minWidth: 48,
  minHeight: 45,
  justifyContent: "center",
  alignItems: "center",
  // padding: 8,
},
headerTitle: {
  flex: 1,
  color: "#FFF",
  fontSize: 22,
  fontWeight: "bold",
  textAlign: "center",
  marginLeft: 0, // remove negative margin here to avoid overlapping
},

  headerRight: {
    width: 34,
  },
  contentContainer: {
    padding: 20,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  activityImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  activityDate: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    fontWeight: "600",
  },
  activityDescription: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 26,
    textAlign: "center",
  },
});

export default ActivityDetailsScreen;
