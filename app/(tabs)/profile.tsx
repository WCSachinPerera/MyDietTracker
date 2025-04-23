import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Alert, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, onSnapshot, arrayRemove } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { app } from '../../firebaseConfig';

type ProfileStackParamList = {
    profile: undefined;
    profileEdit: undefined;
    editAllergy: undefined;
};

type BottomTabParamList = {
    Home: undefined;
    Profile: undefined;
    More: undefined;
};

type ProfileScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<ProfileStackParamList, 'profile'>,
    BottomTabNavigationProp<BottomTabParamList>
>;

interface SavedItem {
    id: string;
    name: string;
    description: string;
    health_score?: string;
    image?: string;
}

const Profile = () => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showImagePickerModal, setShowImagePickerModal] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const user = auth.currentUser;

    const DEFAULT_PROFILE_IMAGE = require('../../assets/images/default-profile.png');

    const getHealthScoreColor = (score: string | undefined) => {
        if (!score) return '#2D3436';
        switch (score) {
            case 'A': return '#27AE60';
            case 'B': return '#2D9CDB';
            case 'C': return '#F2C94C';
            case 'D': return '#F56918';
            case 'E': return '#E55050';
            default: return '#2D3436';
        }
    };

    useEffect(() => {
        if (!user) return;

        const userRef = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setSavedItems(docSnap.data().savedItems || []);
                setProfileImage(docSnap.data().photoURL || DEFAULT_PROFILE_IMAGE);
            }
        });

        return () => unsubscribe(); // Cleanup on unmount
    }, [user]);
    const handleRemoveItem = async (itemId: string) => {
        if (!user) return;

        try {
            const userRef = doc(firestore, 'users', user.uid);
            const itemToRemove = savedItems.find(item => item.id === itemId);

            if (!itemToRemove) {
                Alert.alert('Error', 'Item not found');
                return;
            }

            await updateDoc(userRef, {
                savedItems: arrayRemove(itemToRemove)
            });

            setSavedItems(prev => prev.filter(item => item.id !== itemId));
            Alert.alert('Success', 'Item removed successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to remove item');
        }
    };

    const handleProfileImagePress = () => {
        setShowImagePickerModal(true);
    };
    const handleImagePicker = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'We need access to your photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                await uploadProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to select image');
        } finally {
            setShowImagePickerModal(false);
        }
    };

    const uploadProfileImage = async (uri: string) => {
        if (!user) return;
        setUploading(true);

        try {
            // Convert image to blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Upload to Firebase Storage
            const storageRef = ref(storage, `profile-images/${user.uid}`);
            await uploadBytes(storageRef, blob);

            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);

            // Update Firestore
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                photoURL: downloadURL
            });

            // Update local state
            setProfileImage(downloadURL);
            Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
            Alert.alert('Error', 'Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteProfileImage = async () => {
        if (!user || typeof profileImage === 'number') {
            Alert.alert('Info', 'Default profile picture cannot be deleted');
            return;
        }

        try {
            // Delete from storage
            const storageRef = ref(storage, `profile-images/${user.uid}`);
            await deleteObject(storageRef);

            // Update Firestore
            const userRef = doc(firestore, 'users', user.uid);
            await updateDoc(userRef, {
                photoURL: null
            });

            // Update local state
            setProfileImage(DEFAULT_PROFILE_IMAGE);
            Alert.alert('Success', 'Profile picture removed');
        } catch (error) {
            Alert.alert('Error', 'Failed to delete profile picture');
        }
    };


    return (
        <View className="flex-1 bg-[#f5f5f5]">
            {/* Profile Header */}
            <LinearGradient
                colors={['#3acf97', '#04d6c1']}
                className="pt-8 pb-8 px-6 rounded-b-3xl shadow-lg"
            >
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={handleProfileImagePress}
                        disabled={uploading}
                    >
                        {profileImage && (
                            <Image
                                source={typeof profileImage === 'string' ?
                                    { uri: profileImage } :
                                    profileImage}
                                className="w-24 h-24 rounded-full border-2 border-white"
                            />
                        )}
                        {uploading && (
                            <View className="absolute inset-0 bg-black/50 rounded-full justify-center">
                                <ActivityIndicator color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                    <View className="ml-4 flex-1">
                        <Text className="text-2xl font-bold text-white">
                            {user?.displayName || user?.email}
                        </Text>
                        <TouchableOpacity
                            className="flex-row items-center mt-2 bg-white/20 p-2 rounded-full self-start"
                            onPress={() => navigation.navigate('profileEdit')}
                        >
                            <MaterialCommunityIcons name="pencil" size={16} color="white" />
                            <Text className="text-white ml-2 text-sm">Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            {/* Profile Image Picker Modal */}
            <Modal
                visible={showImagePickerModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowImagePickerModal(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50 justify-end"
                    activeOpacity={1}
                    onPressOut={() => setShowImagePickerModal(false)}
                >
                    <View
                        className="bg-white p-6 rounded-t-3xl"
                        onStartShouldSetResponder={() => true}
                    >

                        {uploading ? (
                            <View className="py-4">
                                <ActivityIndicator size="large" color="#6DCEAA" />
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity
                                    className="flex-row items-center py-3 border-b border-gray-200"
                                    onPress={handleImagePicker}
                                >
                                    <MaterialCommunityIcons name="image" size={24} color="#6DCEAA" />
                                    <Text className="ml-3 text-lg">Choose from Gallery</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="flex-row items-center py-3"
                                    onPress={handleDeleteProfileImage}
                                >
                                    <MaterialCommunityIcons name="delete" size={24} color="#ef4444" />
                                    <Text className="ml-3 text-lg text-red-500">Remove Current Photo</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <TouchableOpacity
                            className="mt-6 py-3 rounded-lg bg-gray-100 items-center"
                            onPress={() => setShowImagePickerModal(false)}
                        >
                            <Text className="text-gray-600">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Stats Card */}
            <View className="mx-6 -mt-6 bg-white p-4 rounded-2xl shadow-lg">
                <View className="items-center">
                    <Text className="text-2xl font-bold text-[#6DCEAA]">{savedItems.length}</Text>
                    <Text className="text-gray-600">Saved Items</Text>
                </View>
            </View>

            {/* Saved Items List */}
            <View className="px-4 mt-6 flex-1">
                <Text className="text-xl font-bold text-gray-800 mb-4">My Saved Products</Text>
                {savedItems.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <MaterialCommunityIcons
                            name="clipboard-list"
                            size={80}
                            color="#6DCEAA"
                            className="opacity-50"
                        />
                        <Text className="text-gray-500 mt-4 text-lg">No saved items yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={savedItems}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm">
                                <TouchableOpacity
                                    className="absolute top-1 right-2 bg-red-100 p-2 rounded-full z-10"
                                    onPress={() => handleRemoveItem(item.id)}
                                >
                                    <MaterialCommunityIcons name="close" size={18} color="#ef4444" />
                                </TouchableOpacity>
                                {item.image && <Image
                                    source={{ uri: item.image }}
                                    className="w-full h-40 rounded-xl mb-3"
                                    resizeMode="contain"
                                />}
                                <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>

                                {item.health_score && (
                                    <View className="mt-1" style={{
                                        backgroundColor: getHealthScoreColor(item.health_score) + '20',
                                        alignSelf: 'flex-start',
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 4,
                                        borderWidth: 1,
                                        borderColor: getHealthScoreColor(item.health_score)
                                    }}>
                                        <Text className="text-sm font-medium" style={{
                                            color: getHealthScoreColor(item.health_score)
                                        }}>
                                            Health Score: {item.health_score}
                                        </Text>
                                    </View>
                                )}

                                <Text className="text-gray-600 mt-2 text-sm">{item.description}</Text>
                            </View>
                        )}
                        ListFooterComponent={<View className="h-20" />}
                    />
                )}
            </View>
        </View>
    );
};

export default Profile;