import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRouter } from 'expo-router';
import { auth, db } from '@/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const RegisterStep2 = () => {
  const router = useRouter();
  const user = auth.currentUser;

  // State variables
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  // Dropdown State for Gender
  const [gender, setGender] = useState('Male');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ]);

  // BMI Calculation & Firebase Data Update
  const handleNext = async () => {
    const heightInMeters = parseFloat(height) / 100;
    const weightInKg = parseFloat(weight);

    if (!age || !heightInMeters || !weightInKg) {
      Alert.alert('Error', 'Please fill in all fields correctly.');
      return;
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);

    if (!user) {
      Alert.alert('Error', 'No authenticated user found.');
      return;
    }

    try {
      setLoading(true);

      // Update user details in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        age,
        gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
        bmi: parseFloat(bmi.toFixed(1)),
      });

      setLoading(false);
      router.push(`/(auth)/register-bmi?bmi=${bmi.toFixed(1)}`);
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#6DCEAA] p-6">
      <Image
        source={require("../../assets/images/logo.png")}
        className="absolute top-16 items-center  w-40 h-40 rounded-lg border-4 border-white"
      />
      <View className="absolute top-80 items-center w-full">
        <Text className="text-2xl font-bold text-white mb-4">Complete Your Profile</Text>

        {/* Age Input */}
        <TextInput
          className="bg-white p-3 rounded-lg w-full mb-3"
          placeholder="Enter your age"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />

        {/* Gender Dropdown */}
        <View className="w-full mb-3">
          <DropDownPicker
            open={open}
            value={gender}
            items={items}
            setOpen={setOpen}
            setValue={setGender}
            setItems={setItems}
            placeholder="Select Gender"
            containerStyle={{ height: 50 }}
            style={{ backgroundColor: '#fff' }}
            dropDownContainerStyle={{ backgroundColor: '#ffffff' }}
          />
        </View>

        {/* Height Input */}
        <TextInput
          className="bg-white p-3 rounded-lg w-full mb-3"
          placeholder="Enter height (cm)"
          keyboardType="numeric"
          value={height}
          onChangeText={setHeight}
        />

        {/* Weight Input */}
        <TextInput
          className="bg-white p-3 rounded-lg w-full mb-3"
          placeholder="Enter weight (kg)"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        {/* Next Button */}
        <TouchableOpacity
          className="bg-[#7B8ED9] p-3 rounded-lg w-full items-center mt-3"
          onPress={handleNext}
          disabled={loading}
        >
          <Text className="text-white font-bold">
            {loading ? 'Saving Data...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterStep2;
