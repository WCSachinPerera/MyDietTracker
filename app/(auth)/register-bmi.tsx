import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const RegisterBMI = () => {
  const router = useRouter();
  const { bmi } = useLocalSearchParams<{ bmi?: string }>();

  const bmiValue = bmi ? parseFloat(bmi) : null;
  const [showAllergyPopup, setShowAllergyPopup] = useState(false); //Don't show popup initially

  // Determine BMI feedback
  let feedback = '';
  if (bmiValue !== null) {
    if (bmiValue < 18.5) {
      feedback = "You're underweight. Consider a balanced diet with nutritious meals.";
    } else if (bmiValue >= 18.5 && bmiValue < 24.9) {
      feedback = "Great! Your BMI is in the normal range. Maintain a healthy diet and exercise regularly.";
    } else if (bmiValue >= 25 && bmiValue < 29.9) {
      feedback = "You're in the overweight category. A balanced diet and more physical activity are recommended.";
    } else {
      feedback = "Your BMI is in the obese range. Consider a structured diet plan and regular exercise.";
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-[#6DCEAA] p-6">
      <Text className="text-2xl font-bold text-white mb-4">Your BMI Result</Text>

      {bmiValue !== null ? (
        <>
          <Text className="text-4xl font-bold text-white">{bmiValue.toFixed(1)}</Text>
          <Text className="text-lg text-white text-center mt-4">{feedback}</Text>
        </>
      ) : (
        <Text className="text-lg text-white">Error: BMI not calculated.</Text>
      )}

      {/* Show "Next" button to trigger the allergy popup */}
      <TouchableOpacity 
        className="bg-[#7B8ED9] p-3 rounded-lg w-full items-center mt-6"
        onPress={() => setShowAllergyPopup(true)} //Show popup only when user clicks "Next"
      >
        <Text className="text-white font-bold">Next</Text>
      </TouchableOpacity>

      {/* Allergy Selection Popup */}
      <Modal visible={showAllergyPopup} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-[#6DCEAA] p-6 rounded-lg w-4/5">
            <Text className="text-lg font-bold text-black text-center mb-4">
              Do you have any food restrictions or allergies?
            </Text>
            <TouchableOpacity
              className="bg-[#7B8ED9] p-3 rounded-lg w-full items-center mb-3"
              onPress={() => {
                setShowAllergyPopup(false);
                router.push('/(auth)/register-allergies');
              }}
            >
              <Text className="text-white font-bold">Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#7B8ED9] p-3 rounded-lg w-full items-center"
              onPress={() => {
                setShowAllergyPopup(false);
                router.push('/(auth)/profile-setup');
              }}
            >
              <Text className="text-white font-bold">No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RegisterBMI;
