import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const ContactUs = () => {
    return (
        <ScrollView className="flex-1 bg-[#6DCEAA] p-6">
            <Text className="text-2xl font-bold text-white mb-4">Contact Us</Text>
            <View className="bg-white p-4 rounded-lg">
                <Text className="text-gray-800 text-lg">
                    Have questions or need support? Feel free to reach out to us.
                </Text>
                <Text className="text-gray-700 mt-3">
                    📧 Email: support@mydiettracker.com
                </Text>
                <Text className="text-gray-700 mt-3">
                    📞 Phone: +94 779490180
                </Text>
                <Text className="text-gray-700 mt-3">
                    📍 Address: 13th Floor , BOC merchant tower, 28 St Michaels Rd, Colombo 00300
                </Text>
                <Text className="text-gray-700 mt-3">
                    Our team is happy to assist you with any inquiries!
                </Text>
            </View>
        </ScrollView>
    );
};

export default ContactUs;
