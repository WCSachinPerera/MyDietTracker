import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

export default function Step1() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const auth = getAuth(app);
                const user = auth.currentUser;
                if (!user) {
                    setLoading(false);
                    return;
                }

                const firestore = getFirestore(app);
                const userRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setWeight(data.weight?.toString() || '');
                    setHeight(data.height?.toString() || '');
                    setAge(data.age?.toString() || '');
                    setGender(data.gender || 'male');
                    setGoal(data.goal || 'maintain');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const validateInputs = () => {
        const numWeight = Number(weight);
        const numHeight = Number(height);
        const numAge = Number(age);

        if (isNaN(numWeight) || numWeight < 20 || numWeight > 300) {
            Alert.alert('Invalid Weight', 'Please enter weight between 20-300 kg');
            return false;
        }
        if (isNaN(numHeight) || numHeight < 50 || numHeight > 250) {
            Alert.alert('Invalid Height', 'Please enter height between 50-250 cm');
            return false;
        }
        if (isNaN(numAge) || numAge < 12 || numAge > 120) {
            Alert.alert('Invalid Age', 'Please enter age between 12-120 years');
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (!validateInputs()) return;

        router.push({
            pathname: '/caloriecount-step2',
            params: {
                weight: weight.replace(',', '.'),
                height: height.replace(',', '.'),
                age: age.replace(',', '.'),
                gender,
                goal
            }
        });
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#6DCEAA" />
            </View>
        );
    }

    return (
        <View className="p-4 flex-1 bg-white">
            <Text className="text-2xl font-bold mb-6">Your Details</Text>

            <TextInput
                className="border p-3 mb-4 rounded"
                placeholder="Weight (kg)"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
            />

            <TextInput
                className="border p-3 mb-4 rounded"
                placeholder="Height (cm)"
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
            />

            <TextInput
                className="border p-3 mb-6 rounded"
                placeholder="Age"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
            />

            <View className="mb-6">
                <Text className="text-lg mb-2">Gender:</Text>
                <View className="flex-row gap-2">
                    {['male', 'female'].map(g => (
                        <TouchableOpacity
                            key={g}
                            className={`flex-1 p-3 rounded ${gender === g ? 'bg-[#6DCEAA]' : 'bg-gray-200'}`}
                            onPress={() => setGender(g as typeof gender)}
                        >
                            <Text className="text-center capitalize">{g}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="mb-8">
                <Text className="text-lg mb-2">Goal:</Text>
                <View className="flex-row gap-2">
                    {['lose', 'maintain', 'gain'].map(g => (
                        <TouchableOpacity
                            key={g}
                            className={`flex-1 p-3 rounded ${goal === g ? 'bg-[#6DCEAA]' : 'bg-gray-200'}`}
                            onPress={() => setGoal(g as typeof goal)}
                        >
                            <Text className="text-center capitalize">{g} weight</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                className="bg-[#6DCEAA] p-4 rounded"
                onPress={handleNext}
            >
                <Text className="text-white text-center font-bold">Next</Text>
            </TouchableOpacity>
        </View>
    );
}