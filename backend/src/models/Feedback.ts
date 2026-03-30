import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
    title: string;
    description: string;
    category: string;
    status: 'New' | 'In Review' | 'Resolved';
    aiAnalysis?: {
        sentiment: 'positive' | 'neutral' | 'negative';
        suggestedCategory: string;
        priorityScore: number;
        tags: string[];
        summary: string;
    };
    user?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['New', 'In Review', 'Resolved'], 
        default: 'New' 
    },
    aiAnalysis: {
        sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
        suggestedCategory: { type: String },
        priorityScore: { type: Number, min: 0, max: 10 },
        tags: [{ type: String }],
        summary: { type: String }
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
