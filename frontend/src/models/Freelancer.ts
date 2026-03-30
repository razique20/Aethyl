import mongoose, { Schema, Document } from 'mongoose';

export interface IFreelancer extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
  rating: number;
  completedJobs: number;
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  location: string;
  walletAddress?: string;
  portfolio: string[];
  responseTime: string;
  successRate: number;
}

const FreelancerSchema = new Schema<IFreelancer>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  skills: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  completedJobs: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  availability: { type: String, enum: ['available', 'busy', 'unavailable'], default: 'available' },
  location: { type: String, default: '' },
  walletAddress: { type: String },
  portfolio: [{ type: String }],
  responseTime: { type: String, default: '< 1 hour' },
  successRate: { type: Number, default: 100, min: 0, max: 100 },
}, { timestamps: true });

export default mongoose.models.Freelancer || mongoose.model<IFreelancer>('Freelancer', FreelancerSchema);
