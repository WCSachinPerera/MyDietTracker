import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const Terms = () => {
    return (
        <ScrollView className="flex-1 bg-[#6DCEAA] p-6">
            <Text className="text-2xl font-bold text-white mb-4">Terms of Use</Text>
            <View className="bg-white p-4 rounded-lg">
                <Text className="text-gray-800 text-lg">
                    By using MyDietTracker, you agree to the following terms:
                </Text>
                <Text className="text-gray-700 mt-3">
                    - Health Advice Disclaimer: This app provides dietary suggestions but
                    is not a substitute for professional medical advice. Always consult a doctor
                    before making major diet changes.
                </Text>
                <Text className="text-gray-700 mt-3">
                    - Account Security: Users are responsible for keeping their login
                    credentials secure.
                </Text>
                <Text className="text-gray-700 mt-3">
                    - Prohibited Activities: Users must not misuse the app for fraudulent,
                    harmful, or unethical activities.
                </Text>
                <Text className="text-gray-700 mt-3">
                    For full details, contact us at terms@mydiettracker.com.
                </Text>
            </View>
        </ScrollView>
    );
};

export default Terms;
