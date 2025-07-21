import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

console.log('🔌 Connexion à Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Vérification de la connexion
const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('conversations').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Connecté à Supabase avec succès');
  } catch (error) {
    console.error(' Erreur de connexion à Supabase:', error.message);
    throw error;
  }
};

// Interface de base de données compatible avec le code existant
const db = {
  async query(text, params) {
    console.log('Requête SQL:', { text, params });
    
    // Détecter le type de requête
    const queryType = text.trim().split(' ')[0].toUpperCase();
    
    try {
      switch (queryType) {
        case 'SELECT':
          // Implémentation de la sélection
          const tableMatch = text.match(/FROM\s+(\w+)/i);
          if (!tableMatch) throw new Error('Table non trouvée dans la requête SELECT');
          
          const table = tableMatch[1];
          let query = supabase.from(table).select('*');
          
          // Gérer les conditions WHERE basiques
          const whereMatch = text.match(/WHERE\s+(.+?)(?:\s+(?:ORDER|LIMIT|$))/i);
          if (whereMatch) {
            const whereClause = whereMatch[1];
            // Implémentation basique des conditions WHERE
            whereClause.split(' AND ').forEach(condition => {
              const [column, operator, value] = condition.trim().split(/\s+/);
              query = query.eq(column, params[0]);
            });
          }
          
          // Gérer ORDER BY
          const orderMatch = text.match(/ORDER BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
          if (orderMatch) {
            const [_, column, direction = 'asc'] = orderMatch;
            query = query.order(column, { ascending: direction.toLowerCase() === 'asc' });
          }
          
          // Gérer LIMIT
          const limitMatch = text.match(/LIMIT\s+(\d+)/i);
          if (limitMatch) {
            query = query.limit(parseInt(limitMatch[1]));
          }
          
          const { data, error } = await query;
          if (error) throw error;
          return { rows: data };
          
        case 'INSERT':
          // Gestion des INSERT
          const insertMatch = text.match(/INSERT INTO\s+(\w+)\s*\(([^)]+)\)/i);
          if (!insertMatch) throw new Error('Format INSERT non reconnu');
          
          const insertTable = insertMatch[1];
          const columns = insertMatch[2].split(',').map(c => c.trim());
          const values = {};
          
          columns.forEach((col, index) => {
            values[col] = params[index];
          });
          
          const { data: insertData, error: insertError } = await supabase
            .from(insertTable)
            .insert([values])
            .select();
            
          if (insertError) throw insertError;
          return { rows: insertData, rowCount: insertData?.length || 0 };
          
        case 'UPDATE':
          // Gestion des UPDATE
          const updateMatch = text.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE|$)/i);
          if (!updateMatch) throw new Error('Format UPDATE non reconnu');
          
          const updateTable = updateMatch[1];
          const setClause = updateMatch[2];
          const updateValues = {};
          
          setClause.split(',').forEach(pair => {
            const [column, value] = pair.split('=').map(s => s.trim());
            updateValues[column] = params[0]; // Simplification
          });
          
          const whereMatchUpdate = text.match(/WHERE\s+(.+?)(?:\s*$|\s+RETURNING)/i);
          let updateQuery = supabase
            .from(updateTable)
            .update(updateValues);
            
          if (whereMatchUpdate) {
            const [column, operator, value] = whereMatchUpdate[1].split(/\s+/);
            updateQuery = updateQuery.eq(column, params[1]);
          }
          
          const { data: updateData, error: updateError } = await updateQuery.select();
          if (updateError) throw updateError;
          return { rowCount: updateData?.length || 0, rows: updateData };
          
        case 'DELETE':
          // Gestion des DELETE
          const deleteMatch = text.match(/DELETE FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
          if (!deleteMatch) throw new Error('Format DELETE non reconnu');
          
          const deleteTable = deleteMatch[1];
          let deleteQuery = supabase.from(deleteTable).delete();
          
          if (deleteMatch[2]) {
            const [column, operator, value] = deleteMatch[2].split(/\s+/);
            deleteQuery = deleteQuery.eq(column, params[0]);
          }
          
          const { data: deleteData, error: deleteError } = await deleteQuery.select();
          if (deleteError) throw deleteError;
          return { rowCount: deleteData?.length || 0 };
          
        default:
          throw new Error(`Type de requête non supporté: ${queryType}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la requête:', {
        error: error.message,
        query: text,
        params
      });
      throw error;
    }
  },
  
  async connect() {
    console.log('Connexion à la base de données établie');
    return {
      release: () => console.log('Connexion libérée')
    };
  },
  
  on(event, callback) {
    if (event === 'error') {
      // Gérer les erreurs de connexion
      process.on('unhandledRejection', (reason) => {
        if (reason.code && reason.code.startsWith('28')) {
          callback(reason);
        }
      });
    }
  },
  
  async end() {
    console.log('Connexion à la base de données fermée');
  }
};

// Initialisation de la connexion
checkConnection().catch(console.error);

export default db;