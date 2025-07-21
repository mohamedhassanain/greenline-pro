import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

async function testDeepSeek() {
  try {
    console.log('Test de connexion à DeepSeek...');
    
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY non définie dans .env');
    }

    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1'
    });
    
    console.log('Envoi d\'une requête de test...');
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Tu es un assistant utile.' },
        { role: 'user', content: 'Dis bonjour en français' }
      ],
      model: 'deepseek-chat',
      temperature: 0.7,
      max_tokens: 100
    });
    
    console.log('Réponse reçue de DeepSeek:');
    console.log(JSON.stringify(completion, null, 2));
    
    const response = completion.choices[0]?.message?.content;
    console.log('\nTexte de la réponse:');
    console.log(response || 'Aucune réponse reçue');
    
    console.log('\nTest réussi !');
    
  } catch (error) {
    console.error('Erreur lors du test DeepSeek:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.response) {
      console.error('Détails de la réponse:', error.response.data);
    }
  }
}

testDeepSeek();
