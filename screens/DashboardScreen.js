import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    name: '',
    school: '',
    notifications: 3,
    attendance: '85%',
    upcomingActivities: 2,
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUserData(prev => ({
            ...prev,
            ...JSON.parse(storedData),
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout.');
    }
  };

  const quickAccessItems = [
    { icon: 'bell', name: 'Notifications', screen: 'Notifications' },
    { icon: 'calendar-text', name: 'Activities', screen: 'Activities' },
    { icon: 'calendar-check', name: 'Attendance', screen: 'Attendance' },
    { icon: 'account', name: 'Profile', screen: 'Profile' },
  ];

  const categorizedMenu = [
    {
      title: 'Academics',
      items: [
        { icon: 'calendar-check', name: 'Attendance', screen: 'Attendance', value: userData.attendance },
        { icon: 'book-open', name: 'Exam Syllabus', screen: 'ExamSyllabus' },
        { icon: 'clipboard-text', name: 'Exam Results', screen: 'ExamResults' },
        { icon: 'calendar-text', name: 'Activities', screen: 'Activities', count: userData.upcomingActivities },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: 'bell', name: 'Notifications', screen: 'Notifications', count: userData.notifications },
        { icon: 'account', name: 'My Profile', screen: 'Profile' },
        { icon: 'lock-reset', name: 'Change Password', screen: 'ChangePassword' },
      ],
    },
    {
      title: 'System',
      items: [
        { icon: 'logout', name: 'Logout', action: handleLogout },
      ],
    },
  ];

  const navigateToScreen = (item) => {
    if (item.action) item.action();
    else if (item.screen) navigation.navigate(item.screen);
  };

  return (
    <View style={styles.outerContainer}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

          <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <View style={styles.userDetails}>
              <Text style={styles.schoolName}>{userData.school}</Text>
              <Text style={styles.userName}>Welcome, {userData.name}</Text>
            </View>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            style={Platform.OS === 'web' ? { height: '100vh' } : {}}
          >
            <View style={styles.quickAccessContainer}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <View style={styles.quickAccessGrid}>
                {quickAccessItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickAccessCard}
                    onPress={() => navigateToScreen(item)}
                  >
                    <View style={styles.quickAccessIconContainer}>
                      <Icon name={item.icon} size={24} color={colors.primary} />
                    </View>
                    <Text style={styles.quickAccessText}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {categorizedMenu.map((section, idx) => (
              <View key={idx} style={styles.menuContainer}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.menuItemsContainer}>
                  {section.items.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => navigateToScreen(item)}
                    >
                      <View style={styles.menuItemContent}>
                        <Icon name={item.icon} size={20} color={colors.primary} style={styles.menuIcon} />
                        <Text style={styles.menuText}>{item.name}</Text>
                      </View>
                      <View style={styles.menuRightContent}>
                        {item.count && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.count}</Text>
                          </View>
                        )}
                        {item.value && (
                          <Text style={styles.valueText}>{item.value}</Text>
                        )}
                        <Icon name="chevron-right" size={20} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            <View style={{ height: 60 }} />
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: { flex: 1 },
  gradientBackground: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
  },
  userDetails: { flex: 1 },
  schoolName: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 10,
    marginBottom: 5,
  },
  userName: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  logoWrapper: {
    width: 100,
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 15,
  },
  logo: {
    width: 80,
    height: 50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
    ...(Platform.OS === 'web' && { minHeight: '100vh' }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  quickAccessContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  quickAccessCard: {
    width: '48%',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  quickAccessIconContainer: {
    backgroundColor: colors.contactBackground,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickAccessText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItemsContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 15,
    paddingHorizontal: 15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  menuRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  valueText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 10,
  },
});

export default DashboardScreen;