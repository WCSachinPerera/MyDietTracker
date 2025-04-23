import { Image, View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import React from "react";

export default function Index() {
  return (
    <View className="flex-1 bg-[#6DCEAA]">
      {/* Top Section */}
      <View className="flex-1 items-center justify-center bg-[#A5E5CD] rounded-b-[50px] shadow-md px-6">
        {/* Logo */}
        <Image
          source={require("../assets/images/logo.png")}
          className="w-28 h-28 mt-28 rounded-lg border-4 border-white"
        />

        {/* Welcome Text */}
        <Text className="text-3xl font-bold text-gray-900 mt-4 text-center">
          Welcome to MyDietTracker
        </Text>
        <Text className="text-lg text-gray-700 mt-2 text-center italic">
          "Your Wellness Journey Begins Here"
        </Text>

        {/* Login Button - Positioned Lower */}
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="bg-[#7B8ED9] py-3 px-10 rounded-lg shadow-lg mt-auto mb-6">
            <Text className="text-white text-lg font-semibold text-center">Login</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Bottom Section */}
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-semibold text-gray-900 text-center">New Here?</Text>
        <Text className="text-base text-gray-700 text-center mt-1">Let's get started!</Text>

        {/* Register Button */}
        <Link href="/(auth)/register-step1" asChild>
          <TouchableOpacity className="bg-[#7B8ED9] py-3 px-10 rounded-lg mt-4 shadow-lg">
            <Text className="text-white text-lg font-semibold text-center">Register</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
