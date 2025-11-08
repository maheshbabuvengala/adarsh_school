// config/schoolConfig.js

const ACTIVE_SCHOOL = "oxford";

const SCHOOL_CONFIGS = {
  oxford: {
    SplashScreen: true,
    NotificationsScreen: false,
    InfoScreen: false,
    AttendanceScreen: true,
    ExamSyllabusScreen: false,
    ExamResultsScreen: true,
    ActivitiesScreen: false,
    ActivityDetailsScreen: false,
    ProfileScreen: true,
    ChangePasswordScreen: true,
    FeeDetailsScreen: true,
    logo: require("../assets/play_store_512.png"),
    login: require("../assets/oxford_login.jpg"),
    API_PATH: "https://oxfordjc.com/appservices",
    phoneno: "8632359755",
    email: "oxfordiitschool@gmail.com",
    location: "Brundavan Gardens,Guntur,A.P",
    splashscreencaption: "Welcome to Oxford Junior College",
    privacypolicy : "https://oxfordjc.com/privacypolicy.php",
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
    logo: require("../assets/logo.png"),
    login: require("../assets/oxford_login.jpg"),
    API_PATH: "https://adarshemschool.com",
    phoneno: "9299997557",
    email: "adarsh.tenali@gmail.com",
    location: "Tenali, Guntur Dt, Andhra Pradesh",
    splashscreencaption: "Welcome to Adarsh High School",
    privacypolicy: "https://adarshemschool.com/stulogin2024/privacy_policy.php",
  },
};

export default SCHOOL_CONFIGS[ACTIVE_SCHOOL];
