import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const ProfileScreen = ({ navigation }) => {
  const profileData = {
    name: 'YAKKATILI SHANMUKHA PRIVA',
    class: '5TH CLASS / English / A',
    fatherName: 'YAKKATILIKOTESHWAR RAO',
    contactNo: '9866550275',
    address: '10-96-1, UDA COLONY, AMARAYATHI PLOTS, CHENCHUPET, TENALI',
    school: 'English Medium School',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Profile</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={require('../assets/avatar.png')}
                style={styles.avatar}
                resizeMode="contain"
              />
              <View style={styles.verifiedBadge}>
                <Icon name="check-decagram" size={20} color="#FFF" />
              </View>
            </View>
            <Text style={styles.schoolName}>{profileData.school}</Text>
            <Text style={styles.userName}>{profileData.name}</Text>
            <Text style={styles.userClass}>
              <Icon name="school" size={16} color={colors.primary} /> {profileData.class}
            </Text>
          </View>

          {/* Profile Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Icon name="account" size={20} color="#FFF" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Father's Name</Text>
                  <Text style={styles.detailValue}>{profileData.fatherName}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Icon name="phone" size={20} color="#FFF" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Contact Number</Text>
                  <Text style={styles.detailValue}>{profileData.contactNo}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Icon name="map-marker" size={20} color="#FFF" />
                </View>
                <View style={styles.detailTextContainer}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{profileData.address}</Text>
                </View>
              </View>
            </View>

            {/* Academic Information */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Academic Information</Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <View style={[styles.infoIconContainer, { backgroundColor: '#E3F2FD' }]}>
                    <Icon name="calendar" size={20} color={colors.primary} />
                  </View>
                  <Text style={styles.infoLabel}>Academic Year</Text>
                  <Text style={styles.infoValue}>2024-2025</Text>
                </View>

                <View style={styles.infoItem}>
                  <View style={[styles.infoIconContainer, { backgroundColor: '#E8F5E9' }]}>
                    <Icon name="account-group" size={20} color="#4CAF50" />
                  </View>
                  <Text style={styles.infoLabel}>Class Teacher</Text>
                  <Text style={styles.infoValue}>Mrs. Lakshmi</Text>
                </View>
              </View>
            </View>
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
  scrollContent: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 25,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  schoolName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 5,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  userClass: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailIconContainer: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ProfileScreen;