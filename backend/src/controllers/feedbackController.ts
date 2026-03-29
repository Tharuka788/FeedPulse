import type { Request, Response } from 'express';
import Feedback from '../models/Feedback.js';

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
            status: 'pending'
        });

        res.status(201).json(feedback);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all feedbacks
// @route   GET /api/feedback
// @access  Public
export const getFeedbacks = async (req: Request, res: Response) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
