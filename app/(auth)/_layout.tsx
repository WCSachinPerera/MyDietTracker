import React from 'react';
import { Stack } from 'expo-router';

const AuthLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      <Stack.Screen name="register-step1" options={{ title: 'Register', headerShown: false }} />
      <Stack.Screen name="register-step2" options={{ title: 'Register - Step 2', headerShown: false }} />
      <Stack.Screen name="register-bmi" options={{ title: 'Register - Step 3', headerShown: false }} />
      <Stack.Screen name="register-allergies" options={{ title: 'Register - Step 4', headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ title: 'Profile Setup Complete', headerShown: false }} />
    </Stack>
  );
};

export default AuthLayout;
