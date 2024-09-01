import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
 
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

const Ai = async (userInput) => {
    console.log('Ai userinput', userInput)
    const prompt = userInput
    try {
    const result = await model.generateContent(prompt);
    if (result && result.response) {
        const response = result.response;
        const text = await response.text(); // Use await here if response.text() returns a promise
        console.log('Generated text:', text);
       

        // Return both the generated text and the conversation name
        return  text;
    } else {
        console.error('No response found in result');
      
        }
    
} catch (error) {
    console.error('Error generating advice:', error);
    return 'Failed to generate advice';
}
}


export default Ai;