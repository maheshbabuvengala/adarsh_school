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
    notifications: 0,
    attendance: '85%',
    upcomingActivities: 0,
    feeDue: 0,
  });
  const [branchData, setBranchData] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);

          // Update your state with data from storage
          setUserData(prev => ({
            ...prev,
            name: parsedData.userName || '',
            school: parsedData.branch || '',
          }));

          // Fetch fee data if student ID and branch are available
          if (parsedData.seqStudentId && parsedData.branch) {
            const feeResponse = await fetch(
              `https://oxfordjc.com/appservices/studentfees.php?branch=${parsedData.branch}&seqStudentId=${parsedData.seqStudentId}`
            );
            const feeData = await feeResponse.json();
            
            // Fetch app homepage data
            const homepageResponse = await fetch(
              'https://adarshemschool.com/appservices/apphomepage.php'
            );
            const homepageData = await homepageResponse.json();
            
            // Process the data
            setBranchData(homepageData.branch || {});
            
            // Process notifications
            const notificationList = homepageData.notifications ? 
              Object.values(homepageData.notifications) : [];
            setNotifications(notificationList);
            
            // Process activities
            const activityList = homepageData.activities ? 
              [homepageData.activities] : [];
            setActivities(activityList);
            
            // Update user data with counts
            setUserData(prev => ({
              ...prev,
              feeDue: feeData.Total?.Due || 0,
              notifications: notificationList.length,
              upcomingActivities: activityList.length,
              school: homepageData.branch[parsedData.branch] || parsedData.branch
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('isLoggedIn');
      await AsyncStorage.removeItem('userData');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout.');
    }
  };

  const quickAccessItems = [
    { 
      icon: 'bell', 
      name: 'Notifications', 
      screen: 'Notifications',
      params: { notifications }
    },
    { 
      icon: 'calendar-text', 
      name: 'Activities', 
      screen: 'Activities',
      params: { activities }
    },
    { icon: 'calendar-check', name: 'Attendance', screen: 'Attendance' },
    { icon: 'cash', name: 'Fee Details', screen: 'FeeDetails' },
  ];

  const categorizedMenu = [
    {
      title: 'Academics',
      items: [
        { icon: 'calendar-check', name: 'Attendance', screen: 'Attendance', value: userData.attendance },
        { icon: 'book-open', name: 'Exam Syllabus', screen: 'ExamSyllabus' },
        { icon: 'clipboard-text', name: 'Exam Results', screen: 'ExamResults' },
        { 
          icon: 'calendar-text', 
          name: 'Activities', 
          screen: 'Activities',
          params: { activities },
          count: userData.upcomingActivities 
        },
      ],
    },
    {
      title: 'Finance',
      items: [
        { icon: 'cash', name: 'Fee Details', screen: 'FeeDetails', badge: userData.feeDue > 0 },
      ],
    },
    {
      title: 'Account',
      items: [
        { 
          icon: 'bell', 
          name: 'Notifications', 
          screen: 'Notifications',
          params: { notifications },
          count: userData.notifications 
        },
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
    else if (item.screen) {
      navigation.navigate(item.screen, item.params || {});
    }
  };

  // Function to render the latest notification preview
  const renderLatestNotification = () => {
    if (notifications.length === 0) return null;
    
    const latest = notifications[0];
    return (
      <TouchableOpacity 
        style={styles.notificationPreview}
        onPress={() => navigation.navigate('Notifications', { notifications })}
      >
        <View style={styles.notificationHeader}>
          <Icon name="bell" size={16} color={colors.primary} />
          <Text style={styles.notificationTitle}>Latest Notification</Text>
          <Text style={styles.notificationDate}>{latest.Date}</Text>
        </View>
        <Text 
          style={styles.notificationMessage} 
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {latest.Message}
        </Text>
      </TouchableOpacity>
    );
  };

  // Function to render upcoming activity
  const renderUpcomingActivity = () => {
    if (activities.length === 0) return null;
    
    const activity = activities[0];
    return (
      <TouchableOpacity 
        style={styles.activityPreview}
        onPress={() => navigation.navigate('Activities', { activities })}
      >
        <View style={styles.activityHeader}>
          <Icon name="calendar-text" size={16} color={colors.primary} />
          <Text style={styles.activityTitle}>Upcoming Activity</Text>
        </View>
        <Text style={styles.activityName}>{activity.activityName}</Text>
        {activity.subject && (
          <Text style={styles.activitySubject}>{activity.subject}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

          <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Welcome, {userData.name}</Text>
              <Text style={styles.schoolName}>{userData.school}</Text>
              {userData.feeDue > 0 && (
                <View style={styles.feeAlert}>
                  <Icon name="alert-circle" size={16} color="#FFF" />
                  <Text style={styles.feeAlertText}>Fee Due: ₹{userData.feeDue}</Text>
                </View>
              )}
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
            {renderLatestNotification()}
            {renderUpcomingActivity()}

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
                    {item.name === 'Notifications' && userData.notifications > 0 && (
                      <View style={styles.quickAccessBadge}>
                        <Text style={styles.quickAccessBadgeText}>{userData.notifications}</Text>
                      </View>
                    )}
                    {item.name === 'Activities' && userData.upcomingActivities > 0 && (
                      <View style={styles.quickAccessBadge}>
                        <Text style={styles.quickAccessBadgeText}>{userData.upcomingActivities}</Text>
                      </View>
                    )}
                    {item.name === 'Fee Details' && userData.feeDue > 0 && (
                      <View style={styles.quickAccessBadge}>
                        <Text style={styles.quickAccessBadgeText}>!</Text>
                      </View>
                    )}
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
                        {item.count && item.count > 0 && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.count}</Text>
                          </View>
                        )}
                        {item.value && (
                          <Text style={styles.valueText}>{item.value}</Text>
                        )}
                        {item.badge && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>!</Text>
                          </View>
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
  userName: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  schoolName: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
  },
  feeAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  feeAlertText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 5,
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
  notificationPreview: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  notificationDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  activityPreview: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginLeft: 8,
  },
  activityName: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  activitySubject: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  quickAccessContainer: {
    marginTop: 10,
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
    position: 'relative',
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
  quickAccessBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.warning,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAccessBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
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