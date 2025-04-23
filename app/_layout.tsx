import React from 'react';
import { Stack } from 'expo-router';
import '../global.css';

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTransparent: true,
        header: () => null
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          headerShown: false,
          headerTransparent: true,
          header: () => null
        }}
      />
      <Stack.Screen
        name='(tabs)'
        options={{
          headerShown: false,
          headerTransparent: true,
          header: () => null
        }}
      />
    </Stack>
  );
};

export default RootLayout;