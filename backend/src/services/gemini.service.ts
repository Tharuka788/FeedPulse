import { GoogleGenerativeAI } from '@google/generative-ai';
import Feedback from '../models/Feedback.js';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyzes feedback using Gemini 1.5 Flash.
 * @param feedbackId The ID of the feedback document to update.
 * @param content The text content (title + description) to analyze.
 */
export const analyzeFeedback = async (feedbackId: string, content: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

        const prompt = `
            Analyze the following user feedback and provide a structured JSON response.
            The response must include:
            1. sentiment: 'positive', 'neutral', or 'negative'
            2. suggestedCategory: A concise category name (e.g., 'UI/UX', 'Performance', 'Bug', 'Feature Request')
            3. priorityScore: A number from 0 to 10 (10 being highest priority)
            4. tags: An array of 3-5 relevant short tags (strings)
            5. summary: A one-sentence summary of the feedback.

            Feedback Content:
            "${content}"

            Return ONLY the raw JSON object. No markdown, no "json" tags.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        // Clean the response in case Gemini adds markdown blocks
        const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedResponse);

        // Update the feedback document
        await Feedback.findByIdAndUpdate(feedbackId, {
            aiAnalysis: {
                sentiment: jsonResponse.sentiment,
                suggestedCategory: jsonResponse.suggestedCategory,
                priorityScore: jsonResponse.priorityScore,
                tags: jsonResponse.tags,
                summary: jsonResponse.summary
            }
        });

        console.log(`Successfully analyzed feedback ${feedbackId}`);
    } catch (error: any) {
        console.error('Error analyzing feedback with Gemini:', error.message);
    }
};
