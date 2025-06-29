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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const ExamSyllabusScreen = ({ navigation }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Sample data structure
  const examData = {
    examName: "Fx-4",
    subjects: [
      { name: "Telugu", date: "15-07-2024", syllabus: "Chapters 1-5, Grammar rules" },
      { name: "Hindi", date: "16-07-2024", syllabus: "Chapters 3-6, Essay writing" },
      { name: "English", date: "17-07-2024", syllabus: "Literature: Poems 1-3, Grammar tenses" },
      { name: "Maths", date: "18-07-2024", syllabus: "Algebra: Equations, Geometry: Shapes" },
      { name: "Science", date: "19-07-2024", syllabus: "Physics: Motion, Chemistry: Elements" },
      { name: "Social", date: "20-07-2024", syllabus: "History: Freedom movement, Geography: Maps" },
      { name: "Abacus", date: "21-07-2024", syllabus: "Mental arithmetic exercises" },
    ],
  };

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
          <Text style={styles.headerTitle}>Exam Syllabus</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.examHeader}>
            <Text style={styles.examName}>Exam Name: {examData.examName}</Text>
          </View>

          <View style={styles.syllabusContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.subjectColumn]}>Subject Name</Text>
              <Text style={[styles.headerCell, styles.dateColumn]}>Exam Date</Text>
              <Text style={[styles.headerCell, styles.syllabusColumn]}>Syllabus</Text>
            </View>

            {/* Subjects List */}
            {examData.subjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.subjectRow,
                  selectedSubject === index && styles.selectedSubject,
                  index === examData.subjects.length - 1 && styles.lastRow
                ]}
                onPress={() => setSelectedSubject(selectedSubject === index ? null : index)}
              >
                <Text style={[styles.subjectCell, styles.subjectColumn]}>{subject.name}</Text>
                <Text style={[styles.subjectCell, styles.dateColumn]}>{subject.date}</Text>
                <Text style={[styles.subjectCell, styles.syllabusColumn]} numberOfLines={selectedSubject === index ? 0 : 1}>
                  {subject.syllabus}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  examHeader: {
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
    marginTop:15
  },
  examName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  syllabusContainer: {
    marginHorizontal: 15,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
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
    paddingLeft: 10,
    textAlign: 'left',
  },
  dateColumn: {
    flex: 1.5,
  },
  syllabusColumn: {
    flex: 2,
  },
  subjectRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  selectedSubject: {
    backgroundColor: '#f5f5f5',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  subjectCell: {
    fontSize: 14,
    color: colors.textPrimary,
    paddingHorizontal: 5,
  },
});

export default ExamSyllabusScreen;