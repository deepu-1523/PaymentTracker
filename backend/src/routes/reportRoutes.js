import express from 'express';
import { getReports } from '../controllers/reportsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getReports);

export default router;
