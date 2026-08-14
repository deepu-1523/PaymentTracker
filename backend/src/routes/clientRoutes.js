import express from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getWhatsAppReminder,
} from '../controllers/clientController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection to all client routes
router.use(protect);

router.route('/')
  .get(getClients)
  .post(createClient);

router.route('/:id')
  .get(getClientById)
  .put(updateClient)
  .delete(deleteClient);

router.get('/:id/whatsapp-reminder', getWhatsAppReminder);

export default router;
