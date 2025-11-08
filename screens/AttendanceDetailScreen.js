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
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const AttendanceDetailScreen = ({ route, navigation }) => {
  const { monthName, monthVal, seqStudentId, branch, monthDetails } = route.params;
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [shifts, setShifts] = useState({});
  const [monthSummary, setMonthSummary] = useState([]);
  const [detailViewStats, setDetailViewStats] = useState({
    presentDays: 0,
    absentDays: 0,
    totalDays: 0,
    percentage: 0,
    shiftPercentages: []
  });
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];

  useEffect(() => {
    if (monthVal && seqStudentId && branch) {
      fetchAttendanceData();
    }
  }, [monthVal, seqStudentId, branch]);

  const showError = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const showLoading = (show) => {
    if (show) {
      setLoadingModalVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setLoadingModalVisible(false);
      });
    }
  };

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    showLoading(true);
    
    try {
      const response = await fetch(
        `https://oxfordjc.com/appservices/studentmonthattendance.php?monthVal=${monthVal}&seqStudentId=${encodeURIComponent(seqStudentId)}&branch=${encodeURIComponent(branch)}`
      );

      const responseText = await response.text();
      console.log('Detail API Response:', responseText);

      if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
        throw new Error('Server returned HTML instead of JSON. Please try again later.');
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log(result);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error('Invalid server response format');
      }

      if (!result.data) {
        throw new Error('No attendance data found for selected month');
      }

      let parsedShifts = {};
      if (result.shifts) {
        parsedShifts = result.shifts;
        setShifts(parsedShifts);
      }

      // Store month summary data for percentage calculation
      const monthSummaryData = result.monthSummary || [];
      setMonthSummary(monthSummaryData);

      const transformedData = Object.entries(result.data).map(([date, shiftData]) => {
        const dateObj = new Date(date.split('-').reverse().join('-'));
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        return {
          date: `${date} (${dayName})`,
          shifts: Object.entries(shiftData).map(([shiftCode, status]) => ({
            code: shiftCode,
            name: parsedShifts[shiftCode] || shiftCode,
            status: status === 'P' ? 'Present' : status === 'A' ? 'Absent' : 'Not Marked'
          })),
          month: monthName
        };
      });

      setAttendanceData(transformedData);
      
      // Calculate total statistics from API monthSummary
      const totalStats = monthSummaryData.reduce((acc, shiftSummary) => ({
        totalWorkingDays: acc.totalWorkingDays + parseInt(shiftSummary.workingDays || 0),
        totalPresentDays: acc.totalPresentDays + parseInt(shiftSummary.presentDays || 0),
        totalAbsentDays: acc.totalAbsentDays + parseInt(shiftSummary.absentDays || 0),
        percentage: 0
      }), {
        totalWorkingDays: 0,
        totalPresentDays: 0,
        totalAbsentDays: 0,
        percentage: 0
      });

      // Calculate overall percentage
      const overallPercentage = totalStats.totalWorkingDays > 0 
        ? Math.round((totalStats.totalPresentDays / totalStats.totalWorkingDays) * 100)
        : 0;

      // Extract individual shift percentages
      const shiftPercentages = monthSummaryData.map(shift => ({
        shiftCode: shift.shiftcode,
        shiftName: parsedShifts[shift.shiftcode] || shift.shiftcode,
        percentage: shift.presentPer,
        presentDays: shift.presentDays,
        absentDays: shift.absentDays,
        workingDays: shift.workingDays
      }));

      console.log("Shift Percentages:", shiftPercentages);
      console.log("Total Stats:", totalStats);

      // Store the calculated stats for detail view
      setDetailViewStats({
        presentDays: totalStats.totalPresentDays,
        absentDays: totalStats.totalAbsentDays,
        totalDays: totalStats.totalWorkingDays,
        percentage: overallPercentage,
        shiftPercentages: shiftPercentages
      });

    } catch (error) {
      console.error('Detail API Error:', error);
      showError(error.message || 'Failed to fetch attendance data. Please check your connection.');
      setAttendanceData([]);
    } finally {
      setIsLoading(false);
      showLoading(false);
    }
  };

  // Filter data for display only
  const filteredData = attendanceData.filter(item => item.month === monthName);

  const renderLoadingModal = () => (
    <Modal
      visible={loadingModalVisible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.loadingModalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingModalText}>Loading {monthName} Attendance...</Text>
          <Text style={styles.loadingModalSubText}>Please wait while we fetch your data</Text>
        </Animated.View>
      </View>
    </Modal>
  );

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
          <Text style={styles.headerTitle}>{monthName} - Attendance Details</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.userInfoContainer}>
        
            {isLoading ? (
              <View style={styles.detailLoadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading Attendance Data...</Text>
              </View>
            ) : (
              <>
                  <Text style={styles.detailedSectionTitle}>Month Summary</Text>

                <View style={styles.shiftSummarySection}>
                  
                  {monthSummary.length > 0 ? (
                    monthSummary.map((shiftData, index) => (
                      <View key={index} style={styles.shiftSummaryCard}>
                        {/* <View style={styles.shiftHeader}>
                          <Text style={styles.shiftName}>
                            {shifts[shiftData.shiftcode] || shiftData.shiftcode}
                          </Text>
                        </View> */}
                        
                        
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
                    ))
                  ) : (
                    <View style={styles.noShiftData}>
                      <Text style={styles.noShiftDataText}>No shift data available</Text>
                    </View>
                  )}
                </View>


                {/* Detailed Attendance Table */}
                {Object.keys(shifts).length > 0 && (
                  <View style={styles.detailedSection}>
                    <Text style={styles.detailedSectionTitle}>Daily Attendance Details</Text>
                    <View style={styles.attendanceTable}>
                      <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableHeader]}>Date</Text>
                        {Object.entries(shifts).map(([code, name]) => (
                          <Text key={code} style={[styles.tableHeader, styles.shiftColumn]}>
                            {name}
                          </Text>
                        ))}
                      </View>

                      {filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <View
                            key={index}
                            style={[
                              styles.tableRow,
                              index % 2 === 0 ? styles.evenRow : styles.oddRow,
                              index === filteredData.length - 1 && styles.lastRow
                            ]}
                          >
                            <Text style={[styles.tableCell, styles.dateColumn]}>{item.date}</Text>
                            {item.shifts.map((shift, shiftIndex) => (
                              <Text
                                key={shiftIndex}
                                style={[
                                  styles.tableCell,
                                  styles.shiftColumn,
                                  shift.status === 'Present' ? styles.presentStatus :
                                  shift.status === 'Absent' ? styles.absentStatus : styles.notMarkedStatus
                                ]}
                              >
                                {shift.status}
                              </Text>
                            ))}
                          </View>
                        ))
                      ) : (
                        <View style={styles.noDataContainer}>
                          <Text style={styles.noDataText}>No attendance data available</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>

        {renderLoadingModal()}
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
    fontSize: 18,
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
  detailLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 15,
  },
  
  // Overall Summary Styles
  overallSummaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overallSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  overallSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  overallStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  overallStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  percentageText: {
    color: '#4CAF50',
  },
  overallStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },

  // Shift Summary Section (Similar to Summary Screen)
  shiftSummarySection: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    marginBottom: 20,borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shiftSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  shiftSummaryCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: colors.cardShadow,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  shiftName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
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

  // Shift Percentage Styles
  shiftPercentageContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shiftPercentageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  shiftPercentageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  shiftPercentageItem: {
    alignItems: 'center',
    padding: 10,
    minWidth: 100,
  },
  shiftPercentageValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  normalPercentage: {
    color: '#4CAF50',
  },
  zeroPercentage: {
    color: colors.textSecondary,
  },
  shiftStatss: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Detailed Section Styles
  detailedSection: {
    width: '100%',
  },
  detailedSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  attendanceTable: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 100,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    width: "100%"
  },
  evenRow: {
    backgroundColor: colors.cardBackground,
  },
  oddRow: {
    backgroundColor: '#f9f9f9',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableHeader: {
    padding: 15,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    flex: 1
  },
  tableCell: {
    padding: 15,
    fontSize: 14,
  },
  dateColumn: {
    flex: 1,
    color: colors.textPrimary,
  },
  shiftColumn: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  presentStatus: {
    color: '#4CAF50',
  },
  absentStatus: {
    color: '#F44336',
  },
  notMarkedStatus: {
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // No Data Styles
  noShiftData: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  noShiftDataText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingModalContainer: {
    backgroundColor: colors.cardBackground,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 200,
  },
  loadingModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 15,
    textAlign: 'center',
  },
  loadingModalSubText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
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

export default AttendanceDetailScreen;