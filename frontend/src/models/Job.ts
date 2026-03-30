import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone {
  title: string;
  description: string;
  amount: number;
  status: 'pending' | 'in-progress' | 'completed' | 'approved';
  dueDate?: string;
  isFunded?: boolean;
}

export interface IQuote {
  totalPrice?: number;
  hourlyRate?: number;
  estimatedHours?: number;
  milestones: IMilestone[];
}

export interface IJob extends Document {
  title: string;
  description: string;
  rawInput: string;
  category: string;
  skills: string[];
  budgetMin: number;
  budgetMax: number;
  timeline: string;
  deliverables: string[];
  milestones: IMilestone[];
  matchedFreelancers: {
    freelancerId: string;
    score: number;
    selected: boolean;
  }[];
  selectedFreelancer?: string;
  clientAddress: string;
  onChainJobId?: number;
  escrowStatus: 'not-created' | 'funded' | 'in-progress' | 'completed' | 'disputed';
  escrowAmount?: number;
  status: 'draft' | 'matching' | 'matched' | 'scoped' | 'funded' | 'active' | 'completed';
  
  // Negotiation & Dual-Sign Escrow Fields
  paymentType?: 'fixed_price' | 'hourly';
  quotingStatus?: 'pending_quote' | 'negotiating' | 'agreed' | 'dual_signed';
  freelancerQuote?: IQuote;
  clientSignature?: string;
  freelancerSignature?: string;
  isFundingComplete?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'approved'], default: 'pending' },
  dueDate: { type: String },
  isFunded: { type: Boolean, default: false },
});

const QuoteSchema = new Schema({
  totalPrice: { type: Number },
  hourlyRate: { type: Number },
  estimatedHours: { type: Number },
  milestones: [MilestoneSchema],
});

const JobSchema = new Schema<IJob>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rawInput: { type: String, required: true },
  category: { type: String, default: 'General' },
  skills: [{ type: String }],
  budgetMin: { type: Number, default: 0 },
  budgetMax: { type: Number, default: 0 },
  timeline: { type: String, default: '' },
  deliverables: [{ type: String }],
  milestones: [MilestoneSchema],
  matchedFreelancers: [{
    freelancerId: String,
    score: Number,
    selected: { type: Boolean, default: false },
  }],
  selectedFreelancer: { type: String },
  clientAddress: { type: String, required: true },
  onChainJobId: { type: Number },
  escrowStatus: { type: String, enum: ['not-created', 'funded', 'in-progress', 'completed', 'disputed'], default: 'not-created' },
  escrowAmount: { type: Number },
  status: { type: String, enum: ['draft', 'matching', 'matched', 'scoped', 'funded', 'active', 'completed'], default: 'draft' },
  
  paymentType: { type: String, enum: ['fixed_price', 'hourly'] },
  quotingStatus: { type: String, enum: ['pending_quote', 'negotiating', 'agreed', 'dual_signed'] },
  freelancerQuote: { type: QuoteSchema },
  clientSignature: { type: String },
  freelancerSignature: { type: String },
  isFundingComplete: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
