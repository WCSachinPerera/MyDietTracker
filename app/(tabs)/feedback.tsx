import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const Feedback = () => {
    return (
        <ScrollView className="flex-1 bg-[#6DCEAA] p-6">
            <Text className="text-2xl font-bold text-white mb-4">Feedback</Text>
            <View className="bg-white p-4 rounded-lg">
                <Text className="text-gray-800 text-lg">
                    We value your feedback! Your insights help us improve MyDietTracker
                    and create a better experience for everyone.
                </Text>
                <Text className="text-gray-700 mt-3">
                    If you have suggestions, found a bug, or want to share your experience,
                    please contact us at feedback@mydiettracker.com.
                </Text>
                <Text className="text-gray-700 mt-3">
                    Thank you for helping us make MyDietTracker better!
                </Text>
            </View>
        </ScrollView>
    );
};

export default Feedback;
