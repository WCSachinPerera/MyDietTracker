import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

type Params = {
    weight: string;
    height: string;
    age: string;
    gender: string;
    goal: string;
    activityLevel: string;
};

export default function Step3() {
    const router = useRouter();
    const params = useLocalSearchParams<Params>();
    const [isSaving, setIsSaving] = useState(false);
    const [calculation, setCalculation] = useState<{
        bmr: number;
        tdee: number;
        goalCalories: number;
    } | null>(null);

    useEffect(() => {
        calculateResults();
    }, []);

    const calculateResults = () => {
        const weight = parseFloat(params.weight || "0");
        const height = parseFloat(params.height || "0");
        const age = parseFloat(params.age || "0");
        const gender = params.gender || 'male';
        const activity = activityLevels.find(l => l.id === params.activityLevel);

        // Calculate BMR
        const bmr = gender === 'male'
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        // Calculate TDEE
        const tdee = bmr * (activity?.multiplier || 1.2);

        // Calculate goal calories
        let goalCalories = tdee;
        if (params.goal === 'lose') goalCalories -= 500;
        if (params.goal === 'gain') goalCalories += 500;

        setCalculation({
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            goalCalories: Math.round(goalCalories)
        });
    };

    const handleSave = async () => {
        if (!calculation) return;

        try {
            setIsSaving(true);
            const auth = getAuth(app);
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            const firestore = getFirestore(app);
            await updateDoc(doc(firestore, 'users', user.uid), {
                calorieGoal: calculation.goalCalories,
                lastCalculation: new Date().toISOString(),
                weight: params.weight,
                height: params.height,
                age: params.age,
                gender: params.gender,
                activityLevel: params.activityLevel,
                goal: params.goal
            });

            Alert.alert('Success', 'Calorie goal saved!');
            router.replace('/(tabs)/home');
        } catch (error) {
            Alert.alert('Error', 'Failed to save results');
        } finally {
            setIsSaving(false);
        }
    };

    if (!calculation) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#6DCEAA" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white p-6">
            <Text className="text-3xl font-bold mb-6 text-center">Your Results</Text>

            <View className="bg-blue-50 p-6 rounded-lg mb-6">
                <Text className="text-center mb-2 text-gray-600">Daily Calorie Need</Text>
                <Text className="text-3xl text-center text-[#6DCEAA] font-bold">
                    {calculation.goalCalories} kcal
                </Text>
                <Text className="text-center mt-2 text-gray-600">
                    To {params.goal === 'lose' ? 'lose' : params.goal === 'gain' ? 'gain' : 'maintain'} weight
                </Text>
            </View>

            <View className="mb-8">
                <Text className="text-xl font-semibold mb-4">Detailed Breakdown</Text>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">BMR:</Text>
                    <Text className="font-medium">{calculation.bmr} kcal</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">TDEE:</Text>
                    <Text className="font-medium">{calculation.tdee} kcal</Text>
                </View>
            </View>

            <TouchableOpacity
                className="bg-[#6DCEAA] p-4 rounded mb-4"
                onPress={handleSave}
                disabled={isSaving}
            >
                {isSaving ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-center font-bold">Save to Profile</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                className="border-2 border-[#6DCEAA] p-4 rounded"
                onPress={() => router.replace('/(tabs)/home')}
            >
                <Text className="text-[#6DCEAA] text-center font-bold">Finish</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const activityLevels = [
    { id: 'sedentary', multiplier: 1.2 },
    { id: 'light', multiplier: 1.375 },
    { id: 'moderate', multiplier: 1.55 },
    { id: 'active', multiplier: 1.725 },
    { id: 'extreme', multiplier: 1.9 },
];