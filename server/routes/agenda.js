import express from 'express';
import agendaController from '../controllers/agendaController.js';

const router = express.Router();

router.get('/', agendaController.getAll);
router.post('/', agendaController.create);
router.put('/:id', agendaController.update);
router.delete('/:id', agendaController.remove);

export default router;
