import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors'; // Make sure this contains necessary color definitions

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      date: '24-04-2025',
      title: 'Summer Vacation Notice',
      message: 'Dear Parent, Please note that Summer Vacation is from 24-04-2025 (Thursday) to 11-06-2025(Wednesday). School resumes as usual from 12.06.2025 (Thursday).',
      read: false,
      important: true
    },
    {
      id: 2,
      date: '22-04-2025',
      title: 'Parent-Teacher Meeting',
      message: 'The next parent-teacher meeting is scheduled for 28-04-2025 from 2:00 PM to 4:30 PM. Please confirm your attendance by replying to this message.',
      read: true,
      important: true
    },
    {
      id: 3,
      date: '20-04-2025',
      title: 'Sports Day Announcement',
      message: 'Annual Sports Day will be held on 05-05-2025. Students should come in their sports uniforms. Parents are invited to attend from 9:00 AM onwards.',
      read: false,
      important: false
    },
    {
      id: 4,
      date: '18-04-2025',
      title: 'Library Book Due Reminder',
      message: 'This is a reminder that your child has a library book due for return on 25-04-2025. Late returns will incur fines as per school policy.',
      read: true,
      important: false
    },
    {
      id: 5,
      date: '15-04-2025',
      title: 'School Bus Route Change',
      message: 'Please note that from 20-04-2025, Bus Route #4 will have a modified schedule. The updated timings have been posted on the school portal.',
      read: false,
      important: true
    },
    {
      id: 6,
      date: '12-04-2025',
      title: 'Exam Schedule Released',
      message: 'The term-end examination schedule for all classes is now available on the school website. Please check the dates for your child\'s class.',
      read: false,
      important: false
    },
    {
      id: 7,
      date: '10-04-2025',
      title: 'Field Trip Permission Slip',
      message: 'The permission slip for the upcoming science museum field trip is due by 15-04-2025. Please sign and return the form to your child\'s homeroom teacher.',
      read: true,
      important: false
    },
    {
      id: 8,
      date: '08-04-2025',
      title: 'URGENT: School Closure Tomorrow',
      message: 'Due to unforeseen circumstances, the school will be closed tomorrow (09-04-2025). All classes will resume on 10-04-2025 as usual.',
      read: false,
      important: true
    },
    {
      id: 9,
      date: '05-04-2025',
      title: 'After-School Clubs Registration',
      message: 'Registration for the new term of after-school clubs is now open. Please visit the school portal to view available options and sign up.',
      read: true,
      important: false
    },
    {
      id: 10,
      date: '01-04-2025',
      title: 'School Uniform Policy Update',
      message: 'Starting next term, there will be minor updates to the school uniform policy. Please check the attached document for details about the changes.',
      read: false,
      important: false
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 15, paddingBottom: 60 }}
          >
            {notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationCard,
                  notification.important && styles.importantCard,
                  notification.read && styles.readCard
                ]}
              >
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationDate}>{notification.date}</Text>
                  {notification.important && (
                    <View style={styles.importantBadge}>
                      <Icon name="alert-circle" size={16} color="#FFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>

                <View style={styles.notificationActions}>
                  {!notification.read && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => markAsRead(notification.id)}
                    >
                      <Icon name="check" size={18} color={colors.primary} />
                      <Text style={styles.actionText}>Mark as Read</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <Icon name="trash-can-outline" size={18} color={colors.error} />
                    <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {notifications.length === 0 && (
              <View style={styles.emptyState}>
                <Icon name="bell-off" size={50} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No notifications yet</Text>
                <Text style={styles.emptySubtext}>You'll see important notices here</Text>
              </View>
            )}
          </ScrollView>
        </View>
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
  notificationCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  importantCard: {
    borderLeftColor: colors.error,
    backgroundColor: '#FFF9F9',
  },
  readCard: {
    opacity: 0.8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  importantBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notificationMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  notificationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    marginLeft: 5,
    color: colors.primary,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },
});

export default NotificationsScreen;
