import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

type ProfileEditScreenProps = {
    navigation: any;
};

const ProfileEdit: React.FC<ProfileEditScreenProps> = ({ navigation }) => {
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const user = auth.currentUser;

    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    // Initialize allergies and preferences as empty arrays
    const [allergies, setAllergies] = useState<string[]>([]);
    const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);

    // Predefined allergy options
    const allergyOptions = [
        'Peanuts',
        'Tree Nuts',
        'Dairy',
        'Eggs',
        'Wheat',
        'Soy',
        'Fish',
        'Shellfish',
        'Sesame',
        'Celery',
    ];

    // Predefined dietary preferences options
    const dietaryPreferenceOptions = [
        'Vegan',
        'Vegetarian',
        'Pescatarian',
        'Flexitarian',
        'Gluten-Free',
        'Dairy-Free',
        'Halal'
    ];

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;

            try {
                const userRef = doc(firestore, 'users', user.uid);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setUsername(userData.username || user.displayName || '');
                    setAge(userData.age || '');
                    setGender(userData.gender || '');
                    setHeight(userData.height || '');
                    setWeight(userData.weight || '');
                    // Ensure allergies is always an array
                    setAllergies(Array.isArray(userData.allergies) ? userData.allergies : []);
                    // Ensure dietaryPreferences is always an array
                    setDietaryPreferences(Array.isArray(userData.dietaryPreferences) ? userData.dietaryPreferences : []);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [user]);

    const handleToggleAllergy = (allergy: string) => {
        setAllergies(prev =>
            (prev || []).includes(allergy)
                ? (prev || []).filter(a => a !== allergy)
                : [...(prev || []), allergy]
        );
    };

    const handleTogglePreference = (preference: string) => {
        setDietaryPreferences(prev =>
            (prev || []).includes(preference)
                ? (prev || []).filter(p => p !== preference)
                : [...(prev || []), preference]
        );
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        try {
            // Update Firebase Authentication display name
            await updateProfile(user, {
                displayName: username
            });

            // Update Firestore document
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                username,
                age,
                gender,
                height,
                weight,
                allergies: allergies || [],
                dietaryPreferences: dietaryPreferences || []
            });

            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    return (
        <ScrollView className="flex-1 bg-[#f5f5f5] p-6">
            <View className="mt-3">
                <Text className="text-3xl font-bold text-gray-800 mb-6">Edit Profile</Text>

                {/* Username Input */}
                <View className="mb-4">
                    <Text className="text-gray-600 mb-2">Username</Text>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        className="bg-white p-3 rounded-lg border border-gray-200"
                        placeholder="Enter your username"
                    />
                </View>

                {/* Age Input */}
                <View className="mb-4">
                    <Text className="text-gray-600 mb-2">Age</Text>
                    <TextInput
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        className="bg-white p-3 rounded-lg border border-gray-200"
                        placeholder="Enter your age"
                    />
                </View>

                {/* Gender Input */}
                <View className="mb-4">
                    <Text className="text-gray-600 mb-2">Gender</Text>
                    <TextInput
                        value={gender}
                        onChangeText={setGender}
                        className="bg-white p-3 rounded-lg border border-gray-200"
                        placeholder="Enter your gender"
                    />
                </View>

                {/* Height Input */}
                <View className="mb-4">
                    <Text className="text-gray-600 mb-2">Height (cm)</Text>
                    <TextInput
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="numeric"
                        className="bg-white p-3 rounded-lg border border-gray-200"
                        placeholder="Enter your height"
                    />
                </View>

                {/* Weight Input */}
                <View className="mb-4">
                    <Text className="text-gray-600 mb-2">Weight (kg)</Text>
                    <TextInput
                        value={weight}
                        onChangeText={setWeight}
                        keyboardType="numeric"
                        className="bg-white p-3 rounded-lg border border-gray-200"
                        placeholder="Enter your weight"
                    />
                </View>

                {/* Food Allergies Selection */}
                <View className="mb-6">
                    <Text className="text-gray-600 font-bold text-lg mb-2">Food Allergies</Text>
                    <Text className="text-gray-500 mb-3">Select any food allergies you have:</Text>
                    <View className="flex-row flex-wrap">
                        {allergyOptions.map((allergy) => (
                            <TouchableOpacity
                                key={allergy}
                                onPress={() => handleToggleAllergy(allergy)}
                                className={`
                                    m-1 px-4 py-2 rounded-full
                                    ${(allergies || []).includes(allergy)
                                        ? 'bg-[#FF6B6B] text-white'
                                        : 'bg-gray-200 text-gray-700'}
                                `}
                            >
                                <Text className={`${(allergies || []).includes(allergy) ? 'text-white' : 'text-gray-700'}`}>
                                    {allergy}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Dietary Preferences Selection */}
                <View className="mb-6">
                    <Text className="text-gray-600 font-bold text-lg mb-2">Dietary Preferences</Text>
                    <Text className="text-gray-500 mb-3">Select your dietary preferences:</Text>
                    <View className="flex-row flex-wrap">
                        {dietaryPreferenceOptions.map((preference) => (
                            <TouchableOpacity
                                key={preference}
                                onPress={() => handleTogglePreference(preference)}
                                className={`
                                    m-1 px-4 py-2 rounded-full
                                    ${(dietaryPreferences || []).includes(preference)
                                        ? 'bg-[#FF6B6B] text-white'
                                        : 'bg-gray-200 text-gray-700'}
                                `}
                            >
                                <Text className={`${(dietaryPreferences || []).includes(preference) ? 'text-white' : 'text-gray-700'}`}>
                                    {preference}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSaveProfile}
                    className="bg-[#6DCEAA] p-4 rounded-lg items-center mb-10"
                >
                    <Text className="text-white font-bold text-lg">Save Changes</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default ProfileEdit;