import { GoogleGenerativeAI } from '@google/generative-ai';
import Feedback from '../models/Feedback.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Analyzes feedback using Gemini and updates the DB with specific fields.
 */
export const analyzeFeedback = async (feedbackId: string, content: string) => {
    try {
        console.log(`🤖 Starting AI analysis for feedback: ${feedbackId}`);
        
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            console.error('❌ GEMINI_API_KEY is missing in environment variables!');
            return;
        }

        // 2026 Standard Model: gemini-2.5-flash
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
        });

        const prompt = `
            Analyze the following user feedback and provide a structured JSON response.
            The response must include:
            1. sentiment: 'positive', 'neutral', or 'negative' (strictly lowercase)
            2. suggestedCategory: One of 'Bug', 'Feature Request', 'Improvement', 'Other'
            3. priorityScore: A number from 1 to 10
            4. tags: An array of 3-5 short keywords
            5. summary: A one-sentence executive summary.

            Feedback Content:
            "${content}"

            Return ONLY valid JSON.
        `;

        console.log('📡 Calling Gemini 2.5 API...');
        // 2026 SDK uses JSON response type by default for better precision
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        const jsonResponse = JSON.parse(responseText);
        console.log('✅ AI analysis complete');

        // Update the feedback in MongoDB
        const updatedFeedback = await Feedback.findByIdAndUpdate(feedbackId, {
            aiAnalysis: {
                sentiment: jsonResponse.sentiment,
                suggestedCategory: jsonResponse.suggestedCategory,
                priorityScore: jsonResponse.priorityScore,
                tags: jsonResponse.tags,
                summary: jsonResponse.summary
            },
            aiProcessed: true
        }, { new: true });

        if (updatedFeedback) {
            console.log(`✨ Successfully updated AI data in DB for: ${feedbackId}`);
        }
    } catch (error: any) {
        console.error('❌ Gemini Error:', error.message);
        
        // Final fallback to 1.5 if 2.5 was just a dream (though my diagnostic found 2.5)
        if (error.message.includes('404')) {
            console.log('🔄 Attempting legacy model fallback...');
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY?.trim() || '');
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
                await model.generateContent('Hi');
                console.log('✅ Legacy model (1.5-pro) is at least responding.');
            } catch (e: any) {
                console.error('❌ Universal API Access Failure. Please check your key at aistudio.google.com');
            }
        }
    }
};