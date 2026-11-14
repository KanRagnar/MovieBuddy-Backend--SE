import mongoose from 'mongoose';

const textSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    script: { type: String, required: true },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

const Text = mongoose.model('Text', textSchema);
export default Text;
