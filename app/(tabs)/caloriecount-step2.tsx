import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

type ActivityLevel = {
    id: string;
    label: string;
    multiplier: number;
};

const activityLevels: ActivityLevel[] = [
    { id: 'sedentary', label: 'Little/No Exercise', multiplier: 1.2 },
    { id: 'light', label: 'Light Exercise', multiplier: 1.375 },
    { id: 'moderate', label: 'Moderate Exercise', multiplier: 1.55 },
    { id: 'active', label: 'Very Active', multiplier: 1.725 },
    { id: 'extreme', label: 'Extreme Active', multiplier: 1.9 },
];

export default function Step2() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [selectedLevel, setSelectedLevel] = useState('moderate');

    const handleContinue = () => {
        router.push({
            pathname: '/caloriecount-step3',
            params: {
                ...params,
                activityLevel: selectedLevel
            }
        });
    };

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-6">Activity Level</Text>
            <Text className="text-gray-600 mb-4">Select your typical weekly activity:</Text>

            {activityLevels.map(level => (
                <TouchableOpacity
                    key={level.id}
                    className={`p-4 mb-3 rounded ${selectedLevel === level.id ? 'bg-[#6DCEAA]' : 'bg-gray-200'}`}
                    onPress={() => setSelectedLevel(level.id)}
                >
                    <Text className="text-lg font-medium">{level.label}</Text>
                    <Text className="text-gray-600">Multiplier: {level.multiplier}x</Text>
                </TouchableOpacity>
            ))}

            <TouchableOpacity
                className="bg-[#6DCEAA] p-4 rounded mt-6"
                onPress={handleContinue}
            >
                <Text className="text-white text-center font-bold">Continue</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}