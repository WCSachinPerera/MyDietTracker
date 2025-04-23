import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const PrivacyPolicy = () => {
    return (
        <ScrollView className="flex-1 bg-[#6DCEAA] p-6">
            <Text className="text-2xl font-bold text-white mb-4">Privacy Policy</Text>
            <View className="bg-white p-4 rounded-lg">
                <Text className="text-gray-800 text-lg">
                    Your privacy is important to us. We ensure that your personal data,
                    including food preferences, dietary habits, and login information,
                    is securely stored and never shared without your consent.
                </Text>
                <Text className="text-gray-700 mt-3">
                    What we collect: We store only necessary information such as
                    your email, name, and health preferences.
                </Text>
                <Text className="text-gray-700 mt-3">
                    How we use your data: We use your details to offer personalized
                    diet recommendations and enhance your experience.
                </Text>
                <Text className="text-gray-700 mt-3">
                    Your rights: You can request data deletion anytime by contacting us
                    at privacy@mydiettracker.com.
                </Text>
            </View>
        </ScrollView>
    );
};

export default PrivacyPolicy;
