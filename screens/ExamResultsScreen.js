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
  FlatList,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import colors from '../constants/colors';

const ExamResultsScreen = ({ navigation }) => {
  // State for exam data
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentInfo, setStudentInfo] = useState({
    studentName: '',
    className: ''
  });
  
  // Exam type states
  const [selectedExamType, setSelectedExamType] = useState('U'); // Default to Units
  const [selectedExam, setSelectedExam] = useState(null);

  // Reset selected exam when exam type changes
  useEffect(() => {
    if (examData && examData.data[selectedExamType]?.examMarks) {
      const exams = Object.values(examData.data[selectedExamType].examMarks);
      setSelectedExam(exams.length > 0 ? exams[0] : null);
    } else {
      setSelectedExam(null);
    }
  }, [selectedExamType, examData]);
// Fetch exam data from API
useEffect(() => {
  const fetchExamResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User data not found');
      }

      const userData = JSON.parse(userDataString);
      const { branch, seqStudentId, userName, className } = userData;

      if (!branch || !seqStudentId) {
        throw new Error('Branch or Student ID missing');
      }

      setStudentInfo({
        studentName: userName || '',
        className: className || ''
      });

      // Fetch exam results using fetch
      const response = await fetch(
        `https://oxfordjc.com/appservices/studentexamresults.php?branch=${encodeURIComponent(branch)}&examType=S&seqStudentId=${encodeURIComponent(seqStudentId)}`
      );

      const responseText = await response.text();

      // Check for HTML error response
      if (responseText.includes('<html')) {
        throw new Error('Invalid response from server');
      }

      const data = JSON.parse(responseText);

      if (data) {
        setExamData(data);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error('Error fetching exam results:', err);
      setError(err.message || 'Failed to load exam results');
    } finally {
      setLoading(false);
    }
  };

  fetchExamResults();
}, []);

  // Get exam type display name
  const getExamTypeName = (type) => {
    const examTypes = {
      'S': 'Schedules',
      'U': 'Units',
      'T': 'Terms',
      'C': 'Competitive'
    };
    return examTypes[type] || type;
  };

  // Get current exams for selected type
  const getCurrentExams = () => {
    if (!examData || !examData.data[selectedExamType]?.examMarks) return [];
    return Object.values(examData.data[selectedExamType].examMarks);
  };

  // Get subjects for selected exam type
  const getSubjects = () => {
    if (!examData || !examData.data[selectedExamType]?.subjects) return {};
    return examData.data[selectedExamType].subjects;
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading exam results...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={50} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                fetchExamResults();
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Render empty state if no data
  if (!examData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
          <View style={styles.emptyContainer}>
            <Icon name="book-remove" size={50} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No exam results available</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const currentExams = getCurrentExams();
  const subjects = getSubjects();

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
          <Text style={styles.headerTitle}>Exam Results</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.studentInfoContainer}>
            <Text style={styles.studentInfoText}>Name: {studentInfo.studentName}</Text>
            {/* <Text style={styles.studentInfoText}>Class: {studentInfo.className}</Text> */}
          </View>

          {/* Exam Type Toggle */}
          <View style={styles.examTypeContainer}>
            {Object.entries(examData.examType).map(([type, name]) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.examTypeButton,
                  selectedExamType === type && styles.selectedExamType
                ]}
                onPress={() => setSelectedExamType(type)}
              >
                <Text style={[
                  styles.examTypeText,
                  selectedExamType === type && styles.selectedExamTypeText
                ]}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exam List */}
          <View style={styles.examListContainer}>
            {currentExams.length > 0 ? (
              <FlatList
                horizontal
                data={currentExams}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.examCard,
                      selectedExam?.examName === item.examName && styles.selectedExamCard
                    ]}
                    onPress={() => setSelectedExam(item)}
                  >
                    <Text style={styles.examName}>{item.examName}</Text>
                    <Text style={styles.examDate}>{item.examDate}</Text>
                    <Text style={styles.examTotal}>
                      {item.totalGainedMarks}/{item.totalMaxMarks}
                    </Text>
                    <Text style={styles.examPercentage}>{item.percentage}%</Text>
                    {item.secRank && (
                      <Text style={styles.examRank}>Rank: {item.secRank}</Text>
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.examListContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No exams available for {getExamTypeName(selectedExamType)}</Text>
              </View>
            )}
          </View>

          {/* Subject Marks Table */}
          {selectedExam && selectedExam.subjectMarks && Object.keys(subjects).length > 0 ? (
            <View style={styles.marksTable}>
              <Text style={styles.tableTitle}>{selectedExam.examName} Marks</Text>
              
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.subjectColumn]}>Subject</Text>
                <Text style={[styles.headerCell, styles.marksColumn]}>Marks</Text>
                <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
              </View>

              {/* Table Rows */}
              {Object.entries(subjects).map(([subjectId, subjectName], index) => {
                const subjectMark = selectedExam.subjectMarks[subjectId];
                if (!subjectMark) return null;
                
                return (
                  <View 
                    key={subjectId}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.evenRow : styles.oddRow,
                      index === Object.keys(subjects).length - 1 && styles.lastRow
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.subjectColumn]}>{subjectName}</Text>
                    <Text style={[styles.tableCell, styles.marksColumn]}>
                      {subjectMark.gainedMarks}/{subjectMark.maxMarks}
                    </Text>
                    <Text style={[styles.tableCell, styles.statusColumn]}>
                      {subjectMark.subStatus === 'P' ? 'Present' : 'Absent'}
                    </Text>
                  </View>
                );
              })}

              {/* Total Row */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCell, styles.subjectColumn, styles.totalText]}>Total</Text>
                <Text style={[styles.tableCell, styles.marksColumn, styles.totalText]}>
                  {selectedExam.totalGainedMarks}/{selectedExam.totalMaxMarks}
                </Text>
                <Text style={[styles.tableCell, styles.statusColumn, styles.totalText]}>
                  {selectedExam.percentage}%
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No marks data available</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textPrimary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  studentInfoContainer: {
    backgroundColor: colors.cardBackground,
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop:10
  },
  studentInfoText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 5,
  },
  examTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  examTypeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  selectedExamType: {
    backgroundColor: colors.primary,
  },
  examTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  selectedExamTypeText: {
    color: '#FFF',
  },
  examListContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
    minHeight: 180,
  },
  examListContent: {
    paddingHorizontal: 5,
  },
  examCard: {
    width: 160,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedExamCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  examName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
    textAlign: 'center',
  },
  examDate: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 5,
  },
  examTotal: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 3,
  },
  examPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  examRank: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  marksTable: {
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
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    padding: 15,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 12,
  },
  headerCell: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subjectColumn: {
    flex: 2,
    paddingLeft: 15,
    textAlign: 'left',
  },
  marksColumn: {
    flex: 1,
    textAlign: 'center',
  },
  statusColumn: {
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
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
  totalRow: {
    backgroundColor: '#e3f2fd',
  },
  tableCell: {
    fontSize: 14,
    color: colors.textPrimary,
    paddingHorizontal: 5,
  },
  totalText: {
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default ExamResultsScreen;