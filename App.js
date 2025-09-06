import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Screens
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import AttendanceScreen from "./screens/AttendanceScreen";
import ExamSyllabusScreen from "./screens/ExamSyllabusScreen";
import ExamResultsScreen from "./screens/ExamResultsScreen";
import ActivitiesScreen from "./screens/ActivitiesScreen";
import ActivityDetailsScreen from "./screens/ActivityDetailsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import FeeDetailsScreen from "./screens/FeeDetailsScreen";
import SplashScreen from "./screens/SplashScreen";
import SchoolinfoScreen from "./screens/SchoolInfoScreen";

// Config
import schoolConfig from "./config/schoolConfig";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
  initialRouteName="Splash" // Always start here
  screenOptions={{ headerShown: false }}
>
  <Stack.Screen name="Splash" component={SplashScreen} />
  <Stack.Screen name="Info" component={SchoolinfoScreen} />
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="Dashboard" component={DashboardScreen} />

  {/* Conditional screens */}
  {schoolConfig.NotificationsScreen && (
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  )}
  {schoolConfig.AttendanceScreen && (
    <Stack.Screen name="Attendance" component={AttendanceScreen} />
  )}
  {schoolConfig.ExamSyllabusScreen && (
    <Stack.Screen name="ExamSyllabus" component={ExamSyllabusScreen} />
  )}
  {schoolConfig.ExamResultsScreen && (
    <Stack.Screen name="ExamResults" component={ExamResultsScreen} />
  )}
  {schoolConfig.ActivitiesScreen && (
    <Stack.Screen name="Activities" component={ActivitiesScreen} />
  )}
  {schoolConfig.ActivityDetailsScreen && (
    <Stack.Screen name="ActivityDetails" component={ActivityDetailsScreen} />
  )}
  {schoolConfig.ProfileScreen && (
    <Stack.Screen name="Profile" component={ProfileScreen} />
  )}
  {schoolConfig.ChangePasswordScreen && (
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
  )}
  {schoolConfig.FeeDetailsScreen && (
    <Stack.Screen name="FeeDetails" component={FeeDetailsScreen} />
  )}
</Stack.Navigator>

    </NavigationContainer>
  );
}

export default App;
