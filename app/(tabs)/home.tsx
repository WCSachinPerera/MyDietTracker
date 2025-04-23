import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, arrayUnion, updateDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { app } from '../../firebaseConfig';
import { calculateHealthScore } from '../../utils/healthScoreCalculator';
import { getAlternatives } from '../../services/productService';
import type { Product } from '../../types';
import Constants from 'expo-constants';

const Home = () => {
  const router = useRouter();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const [bmi, setBmi] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [productData, setProductData] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const cameraRef = useRef<CameraView>(null);
  const user = auth.currentUser;
  const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || '';
  const [healthAdvice, setHealthAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [dailyCalories, setDailyCalories] = useState('');
  const [calorieGoal, setCalorieGoal] = useState<number | null>(null);

  useEffect(() => {
    const fetchCalorieGoal = async () => {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(getFirestore(app), 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCalorieGoal(docSnap.data().calorieGoal || null);
      }
    };

    fetchCalorieGoal();
  }, []);

  useEffect(() => {
    const getAdvice = async () => {
      setLoading(true);
      const userData = await fetchUserHealthData();
      if (userData) {
        const advice = await fetchHealthAdvice(userData.bmi, userData.allergies, userData.dietaryPreferences);
        setHealthAdvice(advice);
      }
      setLoading(false);
    };

    getAdvice();
  }, []);

  const fetchUserHealthData = async () => {
    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (!user) return null; // Ensure the user is logged in

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        bmi: userData.bmi,
        allergies: userData.allergies || [],
        dietaryPreferences: userData.dietaryPreferences || []
      };
    } else {
      console.log("No user data found");
      return null;
    }
  };

  const fetchHealthAdvice = async (bmi: number, allergies: string[], dietaryPreferences: string[]) => {
    const apiKey = GEMINI_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `My BMI is ${bmi} and I have the following allergies: ${allergies.join(", ")}. 
              My dietary preferences are: ${dietaryPreferences.join(", ")}. 
              Provide me with personalized health advice.
              Guidelines for advice: Tailor recommendations to the user's BMI category. 
              Avoid suggesting foods that contain the user's allergies. 
              Respect and incorporate their dietary preferences (like vegan, keto, etc.).
              Provide practical, advice. Focus on nutrition, exercise, and overall wellness.
              Present each main advice as a bullet point starting with hyphen (-).
              Use a friendly, encouraging tone.`
            }
          ]
        }
      ]
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No advice available.";
    } catch (error) {
      console.error("Error fetching health advice:", error);
      return "Error retrieving health advice.";
    }
  };

  const handleSaveProduct = async () => {
    if (!user || !productData) return;

    try {
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        savedItems: arrayUnion({
          id: productData.barcode,
          name: productData.name,
          brand: productData.brand,
          image: imageUrl,
          health_score: productData.health_score,
          scannedAt: new Date().toISOString()
        })
      });
      Alert.alert('Success', 'Product saved to your account!');
      setProductData(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
    }
  };

  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchBMI = async () => {
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setBmi(userData?.bmi ? userData.bmi.toFixed(1) : 'N/A');
        }
      } catch (error) {
        console.error('Error fetching BMI:', error);
        setBmi('N/A');
      }
    };
    fetchBMI();
  }, [user]);

  useEffect(() => {
    const fetchCalories = async () => {
      const user = getAuth().currentUser;
      if (user) {
        const docSnap = await getDoc(doc(getFirestore(), 'users', user.uid));
        setDailyCalories(docSnap.data()?.dailyCalories || 'N/A');
      }
    };
    fetchCalories();
  }, []);


  useEffect(() => {
    const fetchAlternatives = async () => {
      if (productData) {
        try {
          const alts = await getAlternatives(productData);
          setAlternatives(alts);
        } catch (error) {
          console.error('Failed to fetch alternatives:', error);
        }
      }
    };

    fetchAlternatives();
  }, [productData]);

  const handleBarcodeScan = async ({ data }: { data: string }) => {
    if (loadingProduct) return;

    setLoadingProduct(true);
    setScanError(null);
    console.log('Scanned barcode:', data); // Add logging

    try {
      // Trim and validate barcode
      const barcode = data.trim();
      if (!barcode) throw new Error('Invalid barcode');

      const productRef = doc(firestore, 'products', barcode);
      const productSnap = await getDoc(productRef);

      console.log('Document exists:', productSnap.exists());
      console.log('Document data:', productSnap.data());

      if (productSnap.exists()) {
        const product = productSnap.data() as Product;

        // Get image URL
        let imageUrl = null;
        if (product.image_url) {
          try {
            const storageRef = ref(storage, product.image_url);
            imageUrl = await getDownloadURL(storageRef);
          } catch (storageError) {
            console.warn('Image load error:', storageError);
          }
        }

        setProductData({
          ...product,
          health_score: calculateHealthScore(product)
        });
        setImageUrl(imageUrl);
        setIsCameraActive(false);
      } else {
        setScanError('Product not found in our database');
      }
    } catch (error) {
      console.error('Full error:', error);
      setScanError('Failed to fetch product information');
    } finally {
      setLoadingProduct(false);
    }
  };

  const getHealthScoreColor = (score: string | undefined) => {
    if (!score) return '#2D3436'; // Fallback color
    switch (score) {
      case 'A': return '#27AE60';
      case 'B': return '#2D9CDB';
      case 'C': return '#F2C94C';
      case 'D': return '#F56918';
      case 'E': return '#E55050';
      default: return '#2D3436';
    }
  };

  return (
    <View style={styles.container}>
      {/* Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => setIsCameraActive(true)}
      >
        <MaterialCommunityIcons name="barcode-scan" size={80} color="black" />
        <Text style={styles.buttonText}>Scan Product</Text>
      </TouchableOpacity>

      {/* BMI & Calorie Section */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>My BMI</Text>
          <Text style={styles.infoValue}>{bmi || 'Loading...'}</Text>
        </View>
        <TouchableOpacity
          style={styles.infoCard}
          onPress={() => router.push('/(tabs)/caloriecount-step1')}
        >
          <Text style={styles.infoTitle}>Daily Calories</Text>
          <Text style={styles.infoValue}>
            {calorieGoal ? `${calorieGoal}` : '--'}
          </Text>
          <Text style={styles.infoSubtitle}>kcal/day</Text>
        </TouchableOpacity>
      </View>

      {/* Health Tips */}
      <ScrollView contentContainerStyle={styles.containerH}>
        <Text style={styles.title}>Health Dashboard</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#6DCEAA" />
        ) : (
          <View style={styles.adviceContainer}>
            <Text style={styles.adviceTitle}>Personalized AI Generated Health Advice</Text>

            {healthAdvice.split('\n').map((point, index) => {
              const cleanedPoint = point.replace(/^-/, '').trim(); // Remove existing hyphens

              return (
                <Text key={index} style={styles.advicePoint}>
                  •{' '}
                  {cleanedPoint.split('*').map((text, i) => (
                    i % 2 === 0 ?
                      text :
                      <Text key={i} style={styles.boldText}>{text}</Text>
                  ))}
                </Text>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={isCameraActive} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
            }}
            onBarcodeScanned={handleBarcodeScan}
          >
            <View style={styles.scanOverlay}>
              <Text style={styles.scanText}>Align barcode within frame</Text>
              <View style={styles.scanFrame} />
              {loadingProduct && <ActivityIndicator size="large" color="#6DCEAA" />}
              {scanError && <Text style={styles.errorText}>{scanError}</Text>}
            </View>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCameraActive(false)}
            >
              <MaterialCommunityIcons name="close" size={32} color="white" />
            </TouchableOpacity>
          </CameraView>
        </View>
      </Modal>

      {/* Product Info Modal */}
      {productData && (
        <Modal
          visible={!!productData}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setProductData(null)}
        >
          <View style={styles.modalContainer}>
            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setProductData(null)}
              >
                <MaterialCommunityIcons name="close" size={32} color="black" />
              </TouchableOpacity>

              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.productImage}
                />
              )}

              <Text style={styles.productName}>{productData.name}</Text>
              <Text style={styles.brandText}>{productData.brand}</Text>

              {productData.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.sectionTitle}>Product Description</Text>
                  <Text style={styles.descriptionText}>
                    {productData.description}
                  </Text>
                </View>
              )}

              <View style={styles.scoreContainer}>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreLabel}>Health Score</Text>
                  <Text style={[
                    styles.scoreValue,
                    { color: getHealthScoreColor(productData.health_score || '') }
                  ]}>
                    {productData.health_score}
                  </Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreLabel}>NOVA Group</Text>
                  <Text style={styles.scoreValue}>{productData.nova_description}</Text>
                </View>
              </View>

              <View style={styles.nutritionSection}>
                <Text style={styles.sectionTitle}>Nutrition Facts (per 100g)</Text>
                <View style={styles.nutritionRow}>
                  <Text>Energy</Text>
                  <Text>{productData.nutrients.energy_kcal} kcal</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text>Sugars</Text>
                  <Text>{productData.nutrients.sugars_g}g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text>Protein</Text>
                  <Text>{productData.nutrients.protein_g}g</Text>
                </View>
                <View style={styles.nutritionRow}>
                  <Text>Fat</Text>
                  <Text>{productData.nutrients.fat_g}g</Text>
                </View>
              </View>

              <View style={styles.allergenSection}>
                <Text style={styles.sectionTitle}>Allergens</Text>
                <View style={styles.allergenList}>
                  {productData.allergens.length > 0 ? (
                    productData.allergens.map((allergen, index) => (
                      <Text key={index} style={styles.allergenText}>
                        {allergen}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.noAllergensText}>No known allergens</Text>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitleAlt}>Healthier Alternatives</Text>

                {alternatives.length > 0 ? (
                  alternatives.map((product) => (
                    <TouchableOpacity
                      key={product.barcode}
                      style={styles.altCard}
                      onPress={async () => {
                        const productWithHealthScore = {
                          ...product,
                          health_score: calculateHealthScore(product),
                        };
                        setProductData(productWithHealthScore);

                        // Fetch and update the image URL
                        if (product.image_url) {
                          try {
                            const storageRef = ref(storage, product.image_url);
                            const newImageUrl = await getDownloadURL(storageRef);
                            setImageUrl(newImageUrl);
                          } catch (error) {
                            console.warn("Image load error:", error);
                            setImageUrl(null); // Reset image URL if there's an error
                          }
                        } else {
                          setImageUrl(null); // No image available for this product
                        }
                      }}
                    >
                      {product.image_url && (
                        <Image source={{ uri: product.image_url }} style={styles.altImage} />
                      )}
                      <View style={styles.altTextContainer}>
                        <Text style={styles.altName}>{product.name}</Text>
                        <View style={styles.scoreContainerAlt}>
                          <Text
                            style={[
                              styles.scoreValueSmall,
                              { color: getHealthScoreColor(product.health_score || "") },
                            ]}
                          >
                            {product.health_score}
                          </Text>
                          <Text style={styles.scoreLabelSmall}>Health Score</Text>
                        </View>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noAlternativesText}>
                    No alternative suggestions available
                  </Text>
                )}
              </View>

              {/* Spacer for fixed button */}
              <View style={{ height: 80 }} />
            </ScrollView>

            {/* Fixed Save Button */}
            <View style={styles.fixedButtonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProduct}
              >
                <Text style={styles.buttonText}>Save to My Items</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6DCEAA',
    padding: 16,
  },
  scanButton: {
    backgroundColor: 'white',
    padding: 16,
    marginBlockStart: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    color: 'black',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  infoValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6DCEAA',
    marginVertical: 4,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  tipCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tipText: {
    textAlign: 'center',
    color: '#2D3436',
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#6DCEAA',
    borderRadius: 10,
    marginVertical: 20,
  },
  scanText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF4C4C',
    fontSize: 16,
    marginTop: 10,
  },
  productContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 40,
    paddingTop: 40, // Add more space for close button
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    padding: 10,
    zIndex: 1, // Ensure button stays on top
  },
  modalContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space for fixed button
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveButton: {
    backgroundColor: '#6DCEAA',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
    marginBlockStart: 30,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2D3436',
  },
  brandText: {
    fontSize: 18,
    color: '#636E72',
    marginBottom: 20,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  scoreBadge: {
    backgroundColor: '#F5F6F7',
    borderRadius: 12,
    padding: 16,
    width: '48%', // Leaves 4% gap between
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 6,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 15,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
  nutritionSection: {
    marginBottom: 25,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  allergenSection: {
    marginBottom: 25,
  },
  allergenText: {
    backgroundColor: '#FFECEC',
    color: '#E55050',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 14,
  },
  allergenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Modern RN gap support
  },
  noAllergensText: {
    color: '#636E72',
    fontStyle: 'italic',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  altName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3436',
    marginBottom: 4,
  },
  altCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  altImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  altTextContainer: {
    flex: 1,
  },
  sectionTitleAlt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 15,
  },
  scoreContainerAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  scoreValueSmall: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  scoreLabelSmall: {
    fontSize: 12,
    color: '#636E72',
  },
  noAlternativesText: {
    color: '#636E72',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  containerH: {
    borderRadius: 20,
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },
  adviceContainer: {
    padding: 15,
    backgroundColor: "#F0F0F0",
    borderRadius: 10
  },
  adviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15
  },
  advicePoint: {
    fontSize: 16,
    marginBottom: 12,
    marginLeft: 8,
    lineHeight: 22
  },
  boldText: {
    fontWeight: '700',
    color: '#2D3436'
  },
  adviceText: {
    fontSize: 16
  }
});

export default Home;