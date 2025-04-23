import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { db, auth } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const RegisterAllergies = () => {
  const router = useRouter();

  // Separate allergies and dietary preferences
  const allergiesList = [
    "Peanuts",
    "Tree Nuts",
    "Dairy",
    "Eggs",
    "Wheat",
    "Soy",
    "Fish",
    "Shellfish",
    "Sesame",
    "Celery",
  ];

  const dietaryPreferencesList = [
    "Vegan",
    "Vegetarian",
    "Pescatarian",
    "Flexitarian",
    "Gluten-Free",
    "Dairy-Free",
    "Halal",
  ];

  // Store selected options
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  // Toggle allergy selection
  const toggleAllergy = (allergy: string) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((item) => item !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  // Toggle preference selection
  const togglePreference = (preference: string) => {
    if (selectedPreferences.includes(preference)) {
      setSelectedPreferences(selectedPreferences.filter((item) => item !== preference));
    } else {
      setSelectedPreferences([...selectedPreferences, preference]);
    }
  };

  // Save data to Firestore
  const savePreferences = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);

      await setDoc(
        userRef,
        {
          allergies: selectedAllergies,
          dietaryPreferences: selectedPreferences
        },
        { merge: true }
      );

      router.push('/(auth)/profile-setup');
    } catch (error) {
      Alert.alert("Error", "Failed to save your preferences.");
      console.error("Firestore Error:", error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#6DCEAA]">
      <View className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-black text-center mb-6 mt-10">
          Food Preferences & Allergies
        </Text>

        {/* Food Allergies Section */}
        <Text className="text-xl font-bold text-black text-left w-full mb-4">
          Food Allergies
        </Text>
        <Text className="text-base text-black text-left w-full mb-4">
          Select any food allergies you have:
        </Text>

        {allergiesList.map((allergy) => (
          <TouchableOpacity
            key={allergy}
            className={`p-3 m-1 rounded-lg w-full items-center ${selectedAllergies.includes(allergy) ? "bg-[#FF6B6B]" : "bg-white"
              }`}
            onPress={() => toggleAllergy(allergy)}
          >
            <Text className={`font-bold ${selectedAllergies.includes(allergy) ? "text-white" : "text-black"}`}>
              {allergy}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Dietary Preferences Section */}
        <Text className="text-xl font-bold text-black text-left w-full mb-4 mt-8">
          Dietary Preferences
        </Text>
        <Text className="text-base text-black text-left w-full mb-4">
          Select your dietary preferences:
        </Text>

        {dietaryPreferencesList.map((preference) => (
          <TouchableOpacity
            key={preference}
            className={`p-3 m-1 rounded-lg w-full items-center ${selectedPreferences.includes(preference) ? "bg-[#FF6B6B]" : "bg-white"
              }`}
            onPress={() => togglePreference(preference)}
          >
            <Text className={`font-bold ${selectedPreferences.includes(preference) ? "text-white" : "text-black"}`}>
              {preference}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Save Button */}
        <TouchableOpacity
          className="bg-[#7B8ED9] p-4 rounded-lg w-full items-center mt-8 mb-10"
          onPress={savePreferences}
        >
          <Text className="text-white font-bold text-lg">Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default RegisterAllergies;