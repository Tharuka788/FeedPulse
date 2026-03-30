import type { Request, Response } from 'express';
import Feedback from '../models/Feedback.js';
import { analyzeFeedback } from '../services/gemini.service.js';

// Helper to sanitize input (strip HTML/Script tags)
const sanitizeInput = (text: string): string => {
    if (typeof text !== 'string') return '';
    // Basic regex to remove HTML/Script tags
    return text.replace(/<[^>]*>?/gm, '').trim();
};

const CATEGORIES = ['Bug', 'Feature Request', 'Improvement', 'Other'];

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
export const createFeedback = async (req: Request, res: Response) => {
    try {
        let { title, description, category } = req.body;

        // 1. Required Field Validation
        if (!title || !description || !category) {
            return res.status(400).json({ 
                message: 'Validation Failure: title, description, and category are required' 
            });
        }

        // 2. Input Sanitization (Remove malicious scripts/tags)
        title = sanitizeInput(title);
        description = sanitizeInput(description);

        // 3. Strict Field Validation
        if (title.length < 3 || description.length < 20) {
            return res.status(400).json({ 
                message: 'Invalid input: Title must be min 3 characters and Description min 20' 
            });
        }

        // 4. Category Validation
        if (!CATEGORIES.includes(category)) {
            return res.status(400).json({ message: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` });
        }

        const feedback = await Feedback.create({
            title,
            description,
            category,
            status: 'New'
        });

        // Trigger AI analysis asynchronously
        analyzeFeedback(feedback._id.toString(), `${title}: ${description}`).catch((err) => {
            console.error('AI Analysis Trigger Error:', err);
        });

        // 201 Created for successful submissions
        res.status(201).json(feedback);
    } catch (error: any) {
        // 500 Internal Server Error for system failures
        res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
};

// @desc    Get all feedbacks (with filtering)
// @route   GET /api/feedback?status=New&category=Bug
// @access  Public (Filterable by all)
export const getFeedbacks = async (req: Request, res: Response) => {
    try {
        const { status, category } = req.query;
        let query: any = {};

        if (status) query.status = status;
        if (category) query.category = category;

        const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update feedback status
// @route   PATCH /api/feedback/:id/status
// @access  Private (Admin only)
export const updateFeedbackStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // Admin Status Update: strictly verify the values
        if (!status || !['New', 'In Review', 'Resolved'].includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid status. Must be strictly New, In Review, or Resolved' 
            });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: 'after' }
        );

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json(feedback);
    } catch (error: any) {
        res.status(500).json({ message: 'System failure: ' + error.message });
    }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (Admin only)
export const deleteFeedback = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findByIdAndDelete(id);

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json({ message: 'Feedback deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
