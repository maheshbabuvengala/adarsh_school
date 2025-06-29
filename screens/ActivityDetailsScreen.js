import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const ActivityDetailsScreen = ({ route, navigation }) => {
  const { activity } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity Details</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityDescription}>{activity.description}</Text>
            <View style={styles.dateContainer}>
              <Icon name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.galleryContainer}
          >
            {activity.images.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={styles.galleryImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>About the Event</Text>
            <Text style={styles.detailsText}>{activity.details}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
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
  scrollContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },
  activityHeader: {
    paddingVertical: 20,
  },
  activityTitle: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDate: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  galleryContainer: {
    marginVertical: 10,
  },
  galleryImage: {
    width: width * 0.85,
    height: 250,
    borderRadius: 12,
    marginRight: 15,
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailsTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
});

export default ActivityDetailsScreen;