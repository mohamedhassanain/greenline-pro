import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute paths for data directory and file
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.resolve(DATA_DIR, 'agenda.json');

console.log('Data directory:', DATA_DIR);
console.log('Data file:', DATA_FILE);

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      console.log(`Creating data directory: ${DATA_DIR}`);
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(DATA_FILE)) {
      console.log(`Creating data file: ${DATA_FILE}`);
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
    throw error;
  }
}

function loadEvents() {
  try {
    ensureDataFile();
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading events:', error);
    // Return empty array if file is corrupted or invalid
    return [];
  }
}
function saveEvents(events) {
  try {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving events:', error);
    throw error;
  }
}

const agendaController = {
  getAll: (req, res) => {
    try {
      console.log('Fetching all events...');
      const events = loadEvents();
      console.log(`Loaded ${events.length} events`);
      res.json({ events });
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({ 
        error: 'Failed to load events',
        details: error.message 
      });
    }
  },

  create: (req, res) => {
    try {
      console.log('Creating new event with data:', req.body);
      console.log('Authenticated user:', req.user);
      
      const { title, description, start, end, color } = req.body;
      
      // Validation des champs obligatoires
      if (!title) {
        return res.status(400).json({ error: 'Le titre est requis' });
      }
      if (!start || !end) {
        return res.status(400).json({ error: 'Les dates de début et de fin sont requises' });
      }
      
      // Conversion des dates en objets Date pour validation
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Format de date invalide' });
      }
      
      if (startDate >= endDate) {
        return res.status(400).json({ error: 'La date de fin doit être postérieure à la date de début' });
      }
      
      // Charger les événements existants
      const events = loadEvents();
      
      // Créer le nouvel événement
      const event = {
        id: Date.now().toString(),
        title,
        description: description || '',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        color: color || '#1976d2',
        userId: req.user?.id || 'anonymous',
        userRole: req.user?.role || 'guest',
        createdAt: new Date().toISOString()
      };
      
      // Ajouter le nouvel événement
      events.push(event);
      
      // Sauvegarder les événements
      saveEvents(events);
      
      console.log('Event created successfully:', event);
      res.status(201).json({ 
        success: true, 
        event,
        message: 'Événement créé avec succès'
      });
      
    } catch (err) {
      console.error('Erreur lors de la création de l\'événement:', err);
      res.status(500).json({ 
        success: false,
        error: 'Erreur serveur lors de la création',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  update: (req, res) => {
    const events = loadEvents();
    const idx = events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const { title, description, start, end, color } = req.body;
    events[idx] = { ...events[idx], title, description, start, end, color: color || events[idx].color };
    saveEvents(events);
    res.json({ event: events[idx] });
  },

  remove: (req, res) => {
    let events = loadEvents();
    const idx = events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const removed = events.splice(idx, 1);
    saveEvents(events);
    res.json({ event: removed[0] });
  }
};

export default agendaController;
