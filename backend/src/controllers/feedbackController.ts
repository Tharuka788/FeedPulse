import type { Request, Response } from 'express';
import Feedback from '../models/Feedback.js';
import { analyzeFeedback } from '../services/gemini.service.js';

// @desc    Create new feedback
// @route   POST /api/feedback
// @access  Public
export const createFeedback = async (req: Request, res: Response) => {
    try {
        const { title, description, category } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ message: 'Please provide all required fields (title, description, category)' });
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

        res.status(201).json(feedback);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
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

        if (!status || !['New', 'In Review', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
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
        res.status(500).json({ message: error.message });
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
