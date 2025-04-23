import { GoogleGenerativeAI } from "@google/generative-ai";

interface HealthAdviceParams {
  bmi: number;
  allergies: string[];
}

export async function getPersonalizedHealthAdvice(
  apiKey: string, 
  { bmi, allergies }: HealthAdviceParams
): Promise<string[]> {
  // Initialize the Google AI client
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Prepare the prompt with user's specific health context
  const prompt = `
    Generate 5-6 personalized health and nutrition advice based on the following user profile:
    - BMI: ${bmi}
    - Allergies: ${allergies.length > 0 ? allergies.join(', ') : 'None'}

    Guidelines for advice:
    1. Tailor recommendations to the user's BMI category
    2. Avoid suggesting foods that contain the user's allergies
    3. Provide practical, actionable advice
    4. Focus on nutrition, exercise, and overall wellness
    5. Use a friendly, encouraging tone
    
    Format the response as a JSON array of strings, where each string is a unique piece of health advice.
  `;

  try {
    // Select the model (you can choose different models based on your needs)
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Generate the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response (assuming it returns a JSON-like array)
    const advices = JSON.parse(text);

    // Validate and return the advices
    return Array.isArray(advices) ? advices : [];
  } catch (error) {
    console.error('Error fetching personalized health advice:', error);
    
    // Fallback to default advice if API call fails
    return [
      'Stay hydrated throughout the day.',
      'Eat a balanced diet rich in nutrients.',
      'Exercise for at least 30 minutes daily.',
      'Get adequate sleep and manage stress.',
      'Consult with a healthcare professional for personalized guidance.'
    ];
  }
}