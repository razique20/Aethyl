import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    index: true, // Speeds up queries when fetching chat history for a specific project
  },
  sender: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
