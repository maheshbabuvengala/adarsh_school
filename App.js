import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import ExamSyllabusScreen from './screens/ExamSyllabusScreen'; // Add this import
import ExamResultsScreen from './screens/ExamResultsScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import ActivityDetailsScreen from './screens/ActivityDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen'
import FeeDetailsScreen from './screens/FeeDetailsScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Notifications" 
          component={NotificationsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Attendance" 
          component={AttendanceScreen} 
          options={{ headerShown: false }} 
        />
        {/* Add ExamSyllabusScreen to the navigation stack */}
        <Stack.Screen 
          name="ExamSyllabus" 
          component={ExamSyllabusScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ExamResults" 
          component={ExamResultsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Activities" 
          component={ActivitiesScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ActivityDetails" 
          component={ActivityDetailsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ChangePassword" 
          component={ChangePasswordScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="FeeDetails" 
          component={FeeDetailsScreen} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;