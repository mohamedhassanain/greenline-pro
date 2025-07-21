import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { OpenAI } from "openai";

console.log('Valeur brute DEEPSEEK_API_KEY:', JSON.stringify(process.env.DEEPSEEK_API_KEY));

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1"
});

async function test() {
  const completion = await deepseek.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      { role: "user", content: "Bonjour, qui es-tu ?" }
    ]
  });
  console.log('Réponse DeepSeek:', completion.choices[0].message.content);
}
test().catch(console.error);
