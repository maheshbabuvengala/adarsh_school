import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

const AttendanceSummaryScreen = ({ navigation }) => {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [seqStudentId, setSeqStudentId] = useState(null);
  const [branch, setBranch] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [monthDetails, setMonthDetails] = useState({});
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (!userDataString) throw new Error('User data not found');
        const userData = JSON.parse(userDataString);
        if (!userData.branch || !userData.seqStudentId) {
          throw new Error('Branch or Student ID missing');
        }

        setSeqStudentId(userData.seqStudentId);
        setBranch(userData.branch);
      } catch (error) {
        console.error('Error fetching user data:', error);
        showError(error.message || 'Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (seqStudentId && branch) {
      fetchAttendanceSummary();
    }
  }, [seqStudentId, branch]);

  const fetchAttendanceSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const response = await fetch(
        `https://oxfordjc.com/appservices/stuattendancesummary.php?seqStudentId=${encodeURIComponent(seqStudentId)}`
      );

      const responseText = await response.text();
      console.log('Summary API Response:', responseText);

      if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
        throw new Error('Server returned HTML instead of JSON. Please try again later.');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error('Invalid server response format');
      }

      if (!result.attendanceData) {
        throw new Error('No attendance summary data found');
      }

      setMonthDetails(result.monthDetails || {});
      const summaryData = result.attendanceData;
      setAttendanceSummary(summaryData);

      const availableMonthNames = Object.values(result.monthDetails || {});
      setAvailableMonths(availableMonthNames);

    } catch (error) {
      console.error('Summary API Error:', error);
      showError(error.message || 'Failed to fetch attendance summary. Please check your connection.');
      setAttendanceSummary([]);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleMonthSelect = (monthName) => {
    // Find month number from monthDetails
    const monthNumber = Object.keys(monthDetails).find(
      key => monthDetails[key] === monthName
    );
    
    if (monthNumber) {
      navigation.navigate('AttendanceDetail', {
        monthName: monthName,
        monthVal: monthNumber.toString().padStart(2, '0'),
        seqStudentId: seqStudentId,
        branch: branch,
        monthDetails: monthDetails
      });
    }
  };

  // Group summary data by month
  const groupedSummary = attendanceSummary.reduce((acc, item) => {
    const monthName = monthDetails[item.monthVal];
    if (!acc[monthName]) {
      acc[monthName] = [];
    }
    acc[monthName].push(item);
    return acc;
  }, {});

  const renderErrorModal = () => (
    <Modal
      visible={errorModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setErrorModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setErrorModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.errorModalContainer}>
              <View style={styles.errorIconContainer}>
                <Icon name="alert-circle" size={50} color="#F44336" />
              </View>
              <Text style={styles.errorModalTitle}>Error</Text>
              <Text style={styles.errorModalMessage}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.errorModalButton}
                onPress={() => setErrorModalVisible(false)}
              >
                <Text style={styles.errorModalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance Summary</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.userInfoContainer}>
            {/* <Text style={styles.sectionTitle}>Overall Attendance Summary</Text> */}
            
            {isLoadingSummary ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
            ) : (
              <ScrollView style={styles.summaryScroll} showsVerticalScrollIndicator={false}>
                {Object.entries(groupedSummary).map(([monthName, monthData]) => (
                  <TouchableOpacity
                    key={monthName}
                    style={styles.monthSummaryCard}
                    onPress={() => handleMonthSelect(monthName)}
                  >
                    <View style={styles.monthHeader}>
                      <Text style={styles.monthName}>{monthName}</Text>
                      <Icon name="chevron-right" size={20} color={colors.primary} />
                    </View>
                    
                    {monthData.map((shiftData, index) => (
                      <View key={index} style={styles.shiftSummary}>
                        <View style={styles.shiftStats}>
                          <View style={[styles.statItem, styles.shiftCodeContainer]}>
                            <Text style={styles.shiftCode}>{shiftData.shiftcode}</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>{shiftData.presentDays}</Text>
                            <Text style={styles.statLabel}>Present</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>{shiftData.absentDays}</Text>
                            <Text style={styles.statLabel}>Absent</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>{shiftData.workingDays}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                          </View>
                          <View style={styles.statItem}>
                            <Text style={[styles.statValue, styles.percentage]}>
                              {shiftData.presentPer}
                            </Text>
                            <Text style={styles.statLabel}>Percentage</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </ScrollView>

        {renderErrorModal()}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0,
  },
  backButton: {
    padding: 15,
    marginLeft: -10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  headerRight: {
    width: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  userInfoContainer: {
    padding: 20,
    alignItems: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryScroll: {
    width: '100%',
  },
  monthSummaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  shiftSummary: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  shiftStats: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftCodeContainer: {
    // flex: 1,
  },
  shiftCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  percentage: {
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorModalContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    padding: 25,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  errorIconContainer: {
    marginBottom: 15,
  },
  errorModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorModalMessage: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorModalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  errorModalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AttendanceSummaryScreen;