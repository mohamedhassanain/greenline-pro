import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' }); // Chemin relatif depuis ton dossier project
import { GoogleGenerativeAI } from "@google/generative-ai";
console.log('Clé API Gemini:', process.env.GEMINI_API_KEY ? 'OK' : 'ABSENTE');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: "Bonjour, qui es-tu ?" }] }]
  });
  console.log(await result.response.text());
}
test().catch(console.error);
