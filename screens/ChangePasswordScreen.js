import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../constants/colors';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    // Add your password change logic here
    Alert.alert('Success', 'Password changed successfully');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={colors.backgroundGradient} style={styles.gradientBackground}>
        <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.userIdContainer}>
            <Text style={styles.userIdLabel}>User ID:</Text>
            <Text style={styles.userIdValue}>10185</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Current Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon 
                    name={showCurrentPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon 
                    name={showNewPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleChangePassword}
            >
              <Text style={styles.submitButtonText}>Update Password</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Minimum 8 characters</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>At least 1 uppercase letter</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>At least 1 number</Text>
            </View>
            <View style={styles.requirementItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>At least 1 special character</Text>
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
    marginLeft: -10,
    marginRight: 10,
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
  userInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  schoolName: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  userName: {
    fontSize: 22,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  userIdContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  userIdLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 5,
  },
  userIdValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 8,
    fontWeight: '500',
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 10,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordRequirements: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  requirementsTitle: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
  },
});

export default ChangePasswordScreen;