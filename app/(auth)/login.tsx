import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

const LoginScreen = () => {
  const router = useRouter();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Automatically navigate to Home if the user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/(tabs)/home");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", email);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Login error:", error.message);
      Alert.alert("Login Failed", error.message);
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#6DCEAA] p-4">
      <Image
        source={require("../../assets/images/logo.png")}
        className="absolute top-16 items-center  w-40 h-40 rounded-lg border-4 border-white"
      />
      <View className="absolute top-80 items-center w-full">
        <Text className="text-3xl font-bold text-white mb-6">Login</Text>
        <TextInput
          className="w-full p-3 bg-white rounded-lg mb-4"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="w-full p-3 bg-white rounded-lg mb-4"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={handleLogin} className="w-full bg-[#7B8ED9] p-3 rounded-lg">
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center text-lg">Login</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/register-step1")} className="mt-4">
          <Text className="text-white">Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
