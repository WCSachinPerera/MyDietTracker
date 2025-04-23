import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// Main Screens
import HomeScreen from "../(tabs)/home";
import ProfileScreen from "../(tabs)/profile";
import MoreScreen from "../(tabs)/more";

// Profile Stack
import ProfileEditScreen from "../(tabs)/profile-edit";
import EditAllergyScreen from "../(tabs)/edit-allergy";

// More Stack
import AboutUsScreen from "../(tabs)/about-us";
import FeedbackScreen from "../(tabs)/feedback";
import ContactUsScreen from "../(tabs)/contact-us";
import PrivacyPolicyScreen from "../(tabs)/privacy-policy";
import TermsScreen from "../(tabs)/terms";

// Calorie Calculator
import CalorieCountStep1 from "../(tabs)/caloriecount-step1";
import CalorieCountStep2 from "../(tabs)/caloriecount-step2";
import CalorieCountStep3 from "../(tabs)/caloriecount-step3";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="profile" component={ProfileScreen} />
    <Stack.Screen name="profileEdit" component={ProfileEditScreen} />
    <Stack.Screen name="editAllergy" component={EditAllergyScreen} />
  </Stack.Navigator>
);

// More Stack Navigator
const MoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="more" component={MoreScreen} />
    <Stack.Screen name="aboutUs" component={AboutUsScreen} />
    <Stack.Screen name="feedback" component={FeedbackScreen} />
    <Stack.Screen name="contactUs" component={ContactUsScreen} />
    <Stack.Screen name="privacyPolicy" component={PrivacyPolicyScreen} />
    <Stack.Screen name="terms" component={TermsScreen} />
  </Stack.Navigator>
);

// Tab Navigator
const TabsLayout = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home",
            Profile: "person",
            More: "menu",
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6DCEAA",
        tabBarInactiveTintColor: "Black",
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
      <Tab.Screen name="More" component={MoreStack} />
    </Tab.Navigator>
  );
};

// Root Navigator
export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsLayout} />

      {/* Calorie Calculator Flow */}
      <Stack.Screen
        name="caloriecount-step1"
        component={CalorieCountStep1}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="caloriecount-step2"
        component={CalorieCountStep2}
        options={{ presentation: "modal", animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="caloriecount-step3"
        component={CalorieCountStep3}
        options={{ presentation: "modal", animation: "slide_from_right" }}
      />

      {/* Additional Modals */}
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen name="feedback" component={FeedbackScreen} />
        <Stack.Screen name="contactUs" component={ContactUsScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}