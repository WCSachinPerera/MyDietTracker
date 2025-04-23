import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '@/firebaseConfig'; // Import Firebase auth & Firestore
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const RegisterStep1 = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    try {
      setLoading(true);
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user details in Firestore database
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      });

      setLoading(false);
      Alert.alert('Success', 'Account created successfully!');
      router.push('/(auth)/register-step2');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#6DCEAA] p-6">
      <Image
        source={require("../../assets/images/logo.png")}
        className="absolute top-16 items-center  w-40 h-40 rounded-lg border-4 border-white"
      />
      <View className="absolute top-80 items-center w-full">
        <Text className="text-2xl font-bold text-white mb-4">Register</Text>
        <TextInput
          className="w-full p-3 mb-3 bg-white rounded-lg"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          className="w-full p-3 mb-3 bg-white rounded-lg"
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="w-full p-3 mb-3 bg-white rounded-lg"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          className="w-full p-3 mb-3 bg-white rounded-lg"
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          className="bg-[#7B8ED9] p-3 rounded-lg w-full items-center"
          onPress={handleNext}
          disabled={loading}
        >
          <Text className="text-white font-bold">
            {loading ? 'Creating Account...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterStep1;
