import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function testGemini() {
  try {
    console.log('Test de connexion à Gemini...');
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY non définie dans .env');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    console.log('Envoi d\'une requête de test...');
    const prompt = 'Dis bonjour en français';
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    console.log('Réponse reçue de Gemini:');
    console.log(response);
    console.log('Test réussi !');
    
  } catch (error) {
    console.error('Erreur lors du test Gemini:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.response) {
      console.error('Détails de la réponse:', error.response.data);
    }
  }
}

testGemini();
