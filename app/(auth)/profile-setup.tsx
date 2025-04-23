import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const ProfileSetup = () => {
  const router = useRouter();

  // Handle navigation to the home screen
  const handleNext = () => {
    router.push("/(tabs)/home"); // Navigate to the main home screen
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#6DCEAA] p-6">
      <Text className="text-2xl font-bold text-gray-800 text-center mb-6">
        Your profile has been all set!
      </Text>

      <TouchableOpacity
        className="bg-[#7B8ED9] p-3 rounded-lg w-full items-center"
        onPress={handleNext}
      >
        <Text className="text-white font-bold">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileSetup;
