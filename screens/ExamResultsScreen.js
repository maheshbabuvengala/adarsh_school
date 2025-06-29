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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const ExamResultsScreen = ({ navigation }) => {
  // Sample exam data
  const examData = {
    studentName: "SHANMUKHA PRIVA YAKKATILI",
    className: "5TH CLASS/A",
    exams: {
      unitExams: [
        {
          name: "FA-3",
          total: "148/150",
          percentage: "98.67",
          subjects: [
            { name: "Telugu", marks: "25/25" },
            { name: "Hindi", marks: "25/25" },
            { name: "English", marks: "25/25" },
            { name: "Maths", marks: "24/25" },
            { name: "Science", marks: "24/25" },
            { name: "Social", marks: "25/25" },
          ]
        },
        {
          name: "FA-2",
          total: "147/150",
          percentage: "98.00",
          subjects: [
            { name: "Telugu", marks: "25/25" },
            { name: "Hindi", marks: "25/25" },
            { name: "English", marks: "25/25" },
            { name: "Maths", marks: "23/25" },
            { name: "Science", marks: "24/25" },
            { name: "Social", marks: "25/25" },
          ]
        },
        {
          name: "FA-1",
          total: "142/150",
          percentage: "94.67",
          subjects: [
            { name: "Telugu", marks: "23/25" },
            { name: "Hindi", marks: "24/25" },
            { name: "English", marks: "25/25" },
            { name: "Maths", marks: "22/25" },
            { name: "Science", marks: "24/25" },
            { name: "Social", marks: "24/25" },
          ]
        }
      ],
      termExams: [
        {
          name: "SA-1",
          total: "582/600",
          percentage: "97.00",
          subjects: [
            { name: "Telugu", marks: "98/100" },
            { name: "Hindi", marks: "90/100" },
            { name: "English", marks: "98/100" },
            { name: "Maths", marks: "100/100" },
            { name: "Science", marks: "100/100" },
            { name: "Social", marks: "96/100" },
          ]
        }
      ]
    }
  };

  const [selectedExamType, setSelectedExamType] = useState('unitExams');
  const [selectedExam, setSelectedExam] = useState(0);

  // Reset selected exam index when exam type changes
  useEffect(() => {
    setSelectedExam(0);
  }, [selectedExamType]);

  // Get current exam data safely
  const currentExams = examData.exams[selectedExamType] || [];
  const currentExam = currentExams[selectedExam] || { subjects: [] };

  const handleExamTypeChange = (type) => {
    setSelectedExamType(type);
  };

  const handleExamSelect = (index) => {
    setSelectedExam(index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityHint="Navigates to previous screen"
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
          <View style={styles.userInfoContainer}>
            <Text style={styles.schoolName}>English Medium School</Text>
            <Text style={styles.userName}>Adarsh</Text>
          </View>

          <View style={styles.studentInfoContainer}>
            <Text style={styles.studentInfoText}>Name: {examData.studentName}</Text>
            <Text style={styles.studentInfoText}>Class: {examData.className}</Text>
          </View>

          {/* Exam Type Toggle */}
          <View style={styles.examTypeContainer}>
            <TouchableOpacity
              style={[
                styles.examTypeButton,
                selectedExamType === 'unitExams' && styles.selectedExamType
              ]}
              onPress={() => handleExamTypeChange('unitExams')}
              accessible={true}
              accessibilityLabel="Unit exams"
              accessibilityRole="button"
            >
              <Text style={[
                styles.examTypeText,
                selectedExamType === 'unitExams' && styles.selectedExamTypeText
              ]}>
                Unit Exams
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.examTypeButton,
                selectedExamType === 'termExams' && styles.selectedExamType
              ]}
              onPress={() => handleExamTypeChange('termExams')}
              accessible={true}
              accessibilityLabel="Term exams"
              accessibilityRole="button"
            >
              <Text style={[
                styles.examTypeText,
                selectedExamType === 'termExams' && styles.selectedExamTypeText
              ]}>
                Term Exams
              </Text>
            </TouchableOpacity>
          </View>

          {/* Exam List */}
          <View style={styles.examListContainer}>
            {currentExams.length > 0 ? (
              <FlatList
                horizontal
                data={currentExams}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.examCard,
                      selectedExam === index && styles.selectedExamCard
                    ]}
                    onPress={() => handleExamSelect(index)}
                    accessible={true}
                    accessibilityLabel={`${item.name} exam results`}
                    accessibilityHint={`Shows marks for ${item.name} exam`}
                  >
                    <Text style={styles.examName}>{item.name}</Text>
                    <Text style={styles.examTotal}>{item.total}</Text>
                    <Text style={styles.examPercentage}>{item.percentage}%</Text>
                    <Text style={styles.viewMarksText}>View Marks</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.examListContent}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No exams available</Text>
              </View>
            )}
          </View>

          {/* Subject Marks Table */}
          {currentExams.length > 0 && currentExam.subjects && currentExam.subjects.length > 0 ? (
            <View style={styles.marksTable}>
              <Text style={styles.tableTitle}>{currentExam.name} Marks</Text>
              
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.subjectColumn]}>Subject</Text>
                <Text style={[styles.headerCell, styles.marksColumn]}>Marks</Text>
              </View>

              {/* Table Rows */}
              {currentExam.subjects.map((subject, index) => (
                <View 
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.evenRow : styles.oddRow,
                    index === currentExam.subjects.length - 1 && styles.lastRow
                  ]}
                  accessible={true}
                  accessibilityLabel={`${subject.name}: ${subject.marks}`}
                >
                  <Text style={[styles.tableCell, styles.subjectColumn]}>{subject.name}</Text>
                  <Text style={[styles.tableCell, styles.marksColumn]}>{subject.marks}</Text>
                </View>
              ))}

              {/* Total Row */}
              <View style={[styles.tableRow, styles.totalRow]}>
                <Text style={[styles.tableCell, styles.subjectColumn, styles.totalText]}>Total</Text>
                <Text style={[styles.tableCell, styles.marksColumn, styles.totalText]}>
                  {currentExam.total}
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
    fontSize: 16,
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
    width: 150,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
    textAlign: 'center',
  },
  examTotal: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 3,
  },
  examPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  viewMarksText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
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