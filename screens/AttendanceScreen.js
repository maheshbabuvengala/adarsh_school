import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const AttendanceScreen = ({ navigation }) => {
  // Sample attendance data for multiple months
  const allAttendanceData = [
    { date: '01-05-2024 (Wednesday)', status: 'Present', month: 'May' },
    { date: '02-05-2024 (Thursday)', status: 'Present', month: 'May' },
    { date: '03-05-2024 (Friday)', status: '', month: 'May' },
    { date: '04-05-2024 (Saturday)', status: '', month: 'May' },
    { date: '05-05-2024 (Sunday)', status: '', month: 'May' },
    { date: '06-05-2024 (Monday)', status: 'Present', month: 'May' },
    { date: '01-06-2024 (Saturday)', status: '', month: 'June' },
    { date: '02-06-2024 (Sunday)', status: '', month: 'June' },
    { date: '03-06-2024 (Monday)', status: '', month: 'June' },
    { date: '04-06-2024 (Tuesday)', status: '', month: 'June' },
    { date: '05-06-2024 (Wednesday)', status: '', month: 'June' },
    { date: '06-06-2024 (Thursday)', status: '', month: 'June' },
    { date: '07-06-2024 (Friday)', status: '', month: 'June' },
    { date: '08-06-2024 (Saturday)', status: '', month: 'June' },
    { date: '09-06-2024 (Sunday)', status: '', month: 'June' },
    { date: '10-06-2024 (Monday)', status: '', month: 'June' },
    { date: '11-06-2024 (Tuesday)', status: '', month: 'June' },
    { date: '12-06-2024 (Wednesday)', status: '', month: 'June' },
    { date: '13-06-2024 (Thursday)', status: 'Present', month: 'June' },
    { date: '14-06-2024 (Friday)', status: 'Present', month: 'June' },
  ];

  // Get unique months from data
  const availableMonths = [...new Set(allAttendanceData.map(item => item.month))];
  
  // State for selected month and modal visibility
  const [selectedMonth, setSelectedMonth] = useState('June');
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Filter data by selected month
  const filteredData = allAttendanceData.filter(item => item.month === selectedMonth);

  // Calculate attendance summary
  const totalDays = filteredData.length;
  const presentDays = filteredData.filter(item => item.status === 'Present').length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Attendance Report</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.userInfoContainer}>
            {/* Month Filter */}
            <TouchableOpacity 
              style={styles.monthFilterContainer}
              onPress={() => setShowMonthPicker(true)}
            >
              <Text style={styles.monthFilterText}>{selectedMonth}</Text>
              <Icon name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
            
            {/* Attendance Summary */}
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
          </View>

          <View style={styles.attendanceTable}>
            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeader, styles.dateColumn]}>Date/Shift</Text>
              <Text style={[styles.tableHeader, styles.statusColumn]}>MS</Text>
            </View>

            {/* Table Rows */}
            {filteredData.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow,
                  index === filteredData.length - 1 && styles.lastRow
                ]}
              >
                <Text style={[styles.tableCell, styles.dateColumn]}>{item.date}</Text>
                <Text style={[
                  styles.tableCell, 
                  styles.statusColumn,
                  item.status === 'Present' ? styles.presentStatus : styles.absentStatus
                ]}>
                  {item.status}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Month Picker Modal */}
        <Modal
          visible={showMonthPicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMonthPicker(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowMonthPicker(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.monthPickerContainer}>
                {availableMonths.map((month, index) => (
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
  schoolName: {
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 5,
    fontWeight: '600',
  },
  userName: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 15,
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
    minWidth: 70,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 14,
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
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  statusColumn: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
  },
  presentStatus: {
    color: '#4CAF50', // Green for present
  },
  absentStatus: {
    color: colors.textSecondary,
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
});

export default AttendanceScreen;