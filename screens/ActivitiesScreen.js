import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const ActivitiesScreen = ({ navigation }) => {
  const activities = [
    {
      id: 1,
      title: 'SCIENCE FAIR',
      description: 'ADARSH SCIENCE FAIR',
      date: '15-07-2025',
      type: 'science',
      images: [
        require('../assets/science1.jpeg'),
        require('../assets/science1.jpeg'),
        require('../assets/science1.jpeg'),
      ],
      details: 'Annual science fair showcasing student projects in physics, chemistry and biology.'
    },
    {
      id: 2,
      title: 'QUIZ COMPETITION',
      description: 'Term III Quiz Competition',
      date: '20-07-2025',
      type: 'quiz',
      images: [
        require('../assets/science1.jpeg'),
        require('../assets/science1.jpeg'),
      ],
      details: 'Inter-class quiz competition testing general knowledge and academic skills.'
    },
    {
      id: 3,
      title: 'CULTURAL FESTIVAL',
      description: 'Annual cultural festival',
      date: '25-07-2025',
      type: 'cultural',
      images: [
        require('../assets/science1.jpeg'),
        require('../assets/science1.jpeg'),
        require('../assets/science1.jpeg'),
      ],
      details: 'Cultural extravaganza featuring dance, music and drama performances.'
    },
  ];

  const getIconByType = (type) => {
    switch (type) {
      case 'science':
        return 'flask';
      case 'quiz':
        return 'help-circle';
      case 'cultural':
        return 'music';
      default:
        return 'calendar-text';
    }
  };

  const getColorByType = (type) => {
    switch (type) {
      case 'science':
        return '#4CAF50';
      case 'quiz':
        return '#2196F3';
      case 'cultural':
        return '#9C27B0';
      default:
        return colors.primary;
    }
  };

  const renderActivityCard = ({ item }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => navigation.navigate('ActivityDetails', { activity: item })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.activityIconContainer, { backgroundColor: getColorByType(item.type) }]}>
          <Icon name={getIconByType(item.type)} size={24} color="#FFF" />
        </View>
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
      
      <Image 
        source={item.images[0]} 
        style={styles.cardImage}
        resizeMode="cover"
      />
      
      <View style={styles.cardContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        
        <View style={styles.imageIndicator}>
          {item.images.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.indicatorDot,
                index === 0 && styles.activeDot
              ]}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>School Activities</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.container}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          
          <FlatList
            data={activities}
            renderItem={renderActivityCard}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon name="calendar-remove" size={50} color={colors.textSecondary} />
                <Text style={styles.emptyText}>No upcoming activities</Text>
                <Text style={styles.emptySubtext}>Check back later for scheduled events</Text>
              </View>
            }
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9;

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
    padding: 10,
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
  },
  headerRight: {
    width: 24,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 30,
  },
  activityCard: {
    width: cardWidth,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 10,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityDate: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 20,
  },
  activityTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activityDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 15,
    lineHeight: 22,
  },
  imageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 12,
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default ActivitiesScreen;