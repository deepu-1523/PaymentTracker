import express from 'express';
import {
  recordPayment,
  getPayments,
  updatePayment,
  deletePayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPayments)
  .post(recordPayment);

router.route('/:id')
  .put(updatePayment)
  .delete(deletePayment);

export default router;
