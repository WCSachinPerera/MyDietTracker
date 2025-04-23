import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../firebaseConfig';

// Define navigation type
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { router } from 'expo-router';

type MoreStackParamList = {
    more: undefined;
    aboutUs: undefined;
    feedback: undefined;
    contactUs: undefined;
    privacyPolicy: undefined;
    terms: undefined;
};

type MoreScreenNavigationProp = NativeStackNavigationProp<MoreStackParamList>;
type IconName = keyof typeof MaterialCommunityIcons.glyphMap; // Ensures only valid icons are used

const More = () => {
    const navigation = useNavigation<MoreScreenNavigationProp>();
    const auth = getAuth(app);
    const [loading, setLoading] = React.useState(false);
    const user = auth.currentUser;

    const handleLogout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            console.log('User logged out:', user?.email);
            router.replace('/login');
        } catch (error: any) {
            Alert.alert('Logout Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Define menu items with valid icon names
    const menuItems: { icon: IconName; title: string; action: () => void; color?: string }[] = [
        {
            icon: 'file-document-outline',
            title: 'Terms of Use',
            action: () => navigation.navigate('terms'),
        },
        {
            icon: 'email-outline',
            title: 'Contact Us',
            action: () => navigation.navigate('contactUs'),
        },
        {
            icon: 'information-outline',
            title: 'About Us',
            action: () => navigation.navigate('aboutUs'),
        },
        {
            icon: 'message-text-outline',
            title: 'Feedback',
            action: () => navigation.navigate('feedback'),
        },
        {
            icon: 'shield-lock-outline',
            title: 'Privacy Policy',
            action: () => navigation.navigate('privacyPolicy'),
        },
        {
            icon: 'logout',
            title: 'Logout',
            action: handleLogout,
            color: '#FF4C4C',
        },
    ];

    return (
        <ScrollView className="flex-1 bg-[#6DCEAA] p-4">
            <View className="mb-6">
                <Text className="text-2xl font-bold text-white">Settings & More</Text>
                <Text className="text-white mt-1">Manage your account and app preferences</Text>
            </View>

            <View className="bg-white rounded-xl p-2">
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={item.title}
                        className={`flex-row items-center p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                        onPress={item.action}
                        disabled={loading}
                    >
                        <MaterialCommunityIcons
                            name={item.icon}
                            size={24}
                            color={item.color || '#6DCEAA'}
                            className="mr-4"
                        />
                        <Text className={`text-base flex-1 ${item.color ? 'text-red-500' : 'text-gray-800'}`}>
                            {item.title}
                        </Text>
                        {item.title !== 'Logout' && (
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={20}
                                color="#6DCEAA"
                            />
                        )}
                        {item.title === 'Logout' && loading && (
                            <ActivityIndicator size="small" color="#FF4C4C" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-center text-white mt-6">Version 1.0.0</Text>
        </ScrollView>
    );
};

export default More;
