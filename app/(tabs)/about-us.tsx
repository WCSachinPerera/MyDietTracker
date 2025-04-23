import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const AboutUs = () => {
    return (
        <ScrollView className="flex-1 bg-[#6DCEAA] p-6">
            <Text className="text-2xl font-bold text-white mb-4">About Us</Text>
            <View className="bg-white p-4 rounded-lg">
                <Text className="text-gray-800 text-lg">
                    Welcome to 'MyDietTracker', your personal guide to a healthier lifestyle.
                    Our app helps users track their daily food intake, understand nutrition values,
                    and find better meal options.
                </Text>
                <Text className="text-gray-700 mt-3">
                    Whether you're aiming for weight loss, muscle gain, or simply a balanced diet,
                    'MyDietTracker' provides customized recommendations tailored to your goals.
                </Text>
                <Text className="text-gray-700 mt-3">
                    Stay healthy, stay fit!
                </Text>
            </View>
        </ScrollView>
    );
};

export default AboutUs;
