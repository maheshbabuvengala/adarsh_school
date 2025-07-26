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
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../constants/colors';

const AttendanceScreen = ({ navigation }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seqStudentId, setSeqStudentId] = useState(null);
  const [branch, setBranch] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [shifts, setShifts] = useState({});

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
        Alert.alert('Error', error.message || 'Failed to load user data');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (seqStudentId && branch) {
      fetchAttendanceData();
    }
  }, [seqStudentId, branch, selectedMonth]);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const monthNumber = months.indexOf(selectedMonth) + 1;
      const monthVal = monthNumber.toString().padStart(2, '0');

      const response = await fetch(
        `https://oxfordjc.com/appservices/studentmonthattendance.php?monthVal=${monthVal}&seqStudentId=${encodeURIComponent(seqStudentId)}&branch=${encodeURIComponent(branch)}`
      );

      const responseText = await response.text();
      console.log('API Response:', responseText);

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

      if (!result.data) {
        throw new Error('No attendance data found');
      }

      let parsedShifts = {};
      if (result.shifts) {
        parsedShifts = result.shifts;
        setShifts(parsedShifts);
      }

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
          month: selectedMonth
        };
      });

      setAttendanceData(transformedData);
      setAvailableMonths([selectedMonth]);
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', error.message || 'Failed to fetch attendance data. Please check your connection.');
      setAttendanceData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = attendanceData.filter(item => item.month === selectedMonth);
  const totalDays = filteredData.length;
  const presentDays = filteredData.reduce((count, day) => {
    return count + (day.shifts.some(shift => shift.status === 'Present') ? 1 : 0);
  }, 0);
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance Report</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.userInfoContainer}>
            <TouchableOpacity
              style={styles.monthFilterContainer}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.monthFilterText}>{selectedMonth}</Text>
              <Icon name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>

            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
            ) : (
              <>
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{presentDays}</Text>
                    <Text style={styles.summaryLabel}>Present</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalDays - presentDays}</Text>
                    <Text style={styles.summaryLabel}>Absent</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalDays}</Text>
                    <Text style={styles.summaryLabel}>Total Days</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{attendancePercentage}%</Text>
                    <Text style={styles.summaryLabel}>Percentage</Text>
                  </View>
                </View>

                {Object.keys(shifts).length > 0 && (
                  <View style={styles.attendanceTable}>
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.tableHeader, styles.dateColumn]}>Date</Text>
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
                )}
              </>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={showMonthPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowMonthPicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.monthPickerContainer}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthItem,
                      month === selectedMonth && styles.selectedMonthItem
                    ]}
                    onPress={() => {
                      setSelectedMonth(month);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthItemText,
                        month === selectedMonth && styles.selectedMonthText
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
  },
  monthFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "95%"
  },
  monthFilterText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    marginRight: 10,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  summaryItem: {
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 12,
    minWidth: 60,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 5,
  },
  attendanceTable: {
    marginHorizontal: 15,
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
    width:"100%"
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
  },
  tableCell: {
    padding: 15,
    fontSize: 14,
  },
  dateColumn: {
    flex: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 15,
    width: '80%',
    maxHeight: '60%',
  },
  monthItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedMonthItem: {
    backgroundColor: '#f0f0f0',
  },
  monthItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectedMonthText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: 20,
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
});

export default AttendanceScreen;