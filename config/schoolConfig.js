// config/schoolConfig.js

const ACTIVE_SCHOOL = "oxford"; 

const SCHOOL_CONFIGS = {
  oxford: {
    SplashScreen: true,
    NotificationsScreen: false,
    InfoScreen:false,
    AttendanceScreen: true,
    ExamSyllabusScreen: true,
    ExamResultsScreen: true,
    ActivitiesScreen: true,
    ActivityDetailsScreen: true,
    ProfileScreen: true,
    ChangePasswordScreen: true,
    FeeDetailsScreen: true,
  },
  adarsh: {
    NotificationsScreen: false,
    AttendanceScreen: false,
    ExamSyllabusScreen: false,
    ExamResultsScreen: true,
    ActivitiesScreen: false,
    ActivityDetailsScreen: false,
    ProfileScreen: true,
    ChangePasswordScreen: true,
    FeeDetailsScreen: false,
  },
};

export default SCHOOL_CONFIGS[ACTIVE_SCHOOL];
