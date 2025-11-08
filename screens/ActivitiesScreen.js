import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';
import schoolConfig from '../config/schoolConfig';

const ActivitiesScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getIconByType = (type) => {
    switch (type?.toLowerCase()) {
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
    switch (type?.toLowerCase()) {
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

  const detectActivityType = (title) => {
    if (!title) return '';
    
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('science') || lowerTitle.includes('fair') || lowerTitle.includes('experiment')) {
      return 'science';
    } else if (lowerTitle.includes('quiz') || lowerTitle.includes('competition') || lowerTitle.includes('winner')) {
      return 'quiz';
    } else if (lowerTitle.includes('cultural') || lowerTitle.includes('music') || lowerTitle.includes('dance') || lowerTitle.includes('art')) {
      return 'cultural';
    }
    return '';
  };

  const processImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    try {
      // Replace # with / and ensure it starts with https://
      let url = imagePath.replace(/#/g, '/');
      if (!url.startsWith('http')) {
        url = `https://${url}`;
      }
      return url;
    } catch (error) {
      console.log('Error processing image URL:', imagePath);
      return null;
    }
  };

  const fetchActivities = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`${schoolConfig.API_PATH}/allactivities.php`);
      
      // Check if response is OK
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      // Get response as text first
      const responseText = await response.text();
      
      // Check if response is HTML (error page)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        throw new Error('Server returned an error page. Please try again later.');
      }

      let data;

      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        // If JSON parsing fails, check if it's a PHP serialized object
        if (responseText.includes('activityId') && responseText.includes('activityName')) {
          try {
            // Try to extract JSON object if it's wrapped in something
            const jsonMatch = responseText.match(/\{.*\}/s);
            if (jsonMatch) {
              data = JSON.parse(jsonMatch[0]);
            } else {
              // If it's a plain PHP object-like string, try to handle it
              throw new Error('Unsupported data format from server');
            }
          } catch (e) {
            throw new Error('Failed to parse server response');
          }
        } else {
          throw new Error('Invalid response format from server');
        }
      }

      // Convert to array and process data
      let activitiesArray = [];
      
      if (Array.isArray(data)) {
        activitiesArray = data;
      } else if (typeof data === 'object' && data !== null) {
        activitiesArray = Object.values(data);
      } else {
        throw new Error('Unexpected data structure from server');
      }

      // Map activities with proper formatting
      const processedActivities = activitiesArray
        .filter(item => item && item.activityId) // Filter out invalid items
        .map(item => {
          const activityType = detectActivityType(item.activityName);
          
          return {
            id: item.activityId.toString(),
            title: item.activityName || 'Untitled Activity',
            description: item.subject || 'No description available',
            image: processImageUrl(item.activityImage),
            date: item.date || '',
            type: activityType,
          };
        });

      setActivities(processedActivities);
      
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError(error.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const renderImage = (item) => {
    if (item.image) {
      return (
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          resizeMode="cover"
          onError={() => console.log(`Failed to load image: ${item.image}`)}
        />
      );
    } else {
      return (
        <View style={styles.placeholderImage}>
          <Icon name="image-off" size={40} color={colors.textSecondary} />
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      );
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
        <Text style={styles.activityDate}>{item.date || 'Date not specified'}</Text>
      </View>

      {renderImage(item)}

      <View style={styles.cardContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle-outline" size={50} color={colors.error} />
          <Text style={styles.errorText}>Failed to load activities</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchActivities}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (activities.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Icon name="calendar-remove" size={50} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No activities found</Text>
          <Text style={styles.emptySubtext}>Check back later for new events</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchActivities}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={activities}
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    );
  };

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
          {renderContent()}
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
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 24,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
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
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
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
  emptyText: {
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActivitiesScreen;