import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Linking from 'expo-linking';

// Screens
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/DashboardScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import AttendanceSummaryScreen from "./screens/AttendanceSummaryScreen";
import AttendanceDetailScreen from "./screens/AttendanceDetailScreen";
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
import CCAvenuePaymentScreen from "./screens/CCAvenuePaymentScreen";

const Stack = createStackNavigator();

// Deep linking configuration
const linking = {
  prefixes: ['oxfordjc://'],
  config: {
    screens: {
      FeeDetails: 'payment-success',
      // Add other screens if needed
    },
  },
};

function App() {
  const navigationRef = useRef();

  // Handle deep links when app is already running
  useEffect(() => {
    const handleDeepLink = (event) => {
      const { url } = event;
      console.log('Deep link received:', url);
      
      const route = url.replace(/.*?:\/\//g, '');
      const routeName = route.split('/')[0];
      
      if (routeName === 'payment-success' && navigationRef.current) {
        // Navigate to FeeDetails screen with parameter
        navigationRef.current.navigate('FeeDetails', { fromPaymentSuccess: true });
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer 
      ref={navigationRef}
      linking={linking}
      onReady={() => {
        // Handle initial URL when app is launched from deep link
        Linking.getInitialURL().then((url) => {
          if (url) {
            const route = url.replace(/.*?:\/\//g, '');
            const routeName = route.split('/')[0];
            
            if (routeName === 'payment-success' && navigationRef.current) {
              navigationRef.current.navigate('FeeDetails', { fromPaymentSuccess: true });
            }
          }
        });
      }}
    >
      <Stack.Navigator
        initialRouteName="Splash"
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
          <>
            <Stack.Screen name="AttendanceSummary" component={AttendanceSummaryScreen} />
            <Stack.Screen name="AttendanceDetail" component={AttendanceDetailScreen} />
          </>
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
        {schoolConfig.FeeDetailsScreen &&(<Stack.Screen name="CCAvenuePaymentScreen" component={CCAvenuePaymentScreen}/>)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;