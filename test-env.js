// Script de test pour vérifier le chargement des variables d'environnement
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obtenir le répertoire courant en mode module ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers le fichier .env
const envPath = path.resolve(__dirname, '.env');
console.log('=== Test de chargement des variables d\'environnement ===');
console.log('Chemin du fichier .env:', envPath);

// Vérifier si le fichier existe
try {
  const fileExists = fs.existsSync(envPath);
  console.log('Le fichier .env existe:', fileExists);
  
  if (fileExists) {
    // Afficher le contenu du fichier (masqué pour les données sensibles)
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('Taille du fichier:', content.length, 'caractères');
    console.log('Début du fichier (100 premiers caractères):', content.substring(0, 100));
    console.log('Fin du fichier (100 derniers caractères):', content.slice(-100));
    
    // Vérifier la présence de BOM
    const hasBOM = content.charCodeAt(0) === 0xFEFF;
    console.log('Contient un BOM:', hasBOM);
    
    // Charger les variables d'environnement
    console.log('\n=== Avant le chargement de dotenv ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '***' + process.env.SUPABASE_URL.slice(-10) : 'undefined');
    
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.error('Erreur lors du chargement du fichier .env:', result.error);
    } else {
      console.log('\n=== Après le chargement de dotenv ===');
      console.log('Variables chargées:', Object.keys(result.parsed || {}).length);
      console.log('NODE_ENV:', process.env.NODE_ENV);
      console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '***' + process.env.SUPABASE_URL.slice(-10) : 'undefined');
      console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-4) : 'undefined');
      
      // Vérifier les problèmes de format
      if (process.env.SUPABASE_URL) {
        console.log('\n=== Vérification du format de SUPABASE_URL ===');
        console.log('Commence par http:', process.env.SUPABASE_URL.startsWith('http'));
        console.log('Longueur:', process.env.SUPABASE_URL.length);
        console.log('Contient des sauts de ligne:', /\r|\n/.test(process.env.SUPABASE_URL));
      }
    }
  }
} catch (error) {
  console.error('Erreur lors de la lecture du fichier .env:', error);
}

console.log('\n=== Variables d\'environnement actuelles ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '***' + process.env.SUPABASE_URL.slice(-10) : 'undefined');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-4) : 'undefined');
