import express from 'express';
import { createFeedback, getFeedbacks, updateFeedbackStatus, deleteFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', getFeedbacks);
router.patch('/:id/status', protect, updateFeedbackStatus);
router.delete('/:id', protect, deleteFeedback);

export default router;
