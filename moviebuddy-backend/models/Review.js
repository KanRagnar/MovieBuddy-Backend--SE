import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    titleId: { type: Number, required: true },
    userId: { type: Number, default: 1 },
    comment: { type: String, required: true, maxlength: 80 },
    rate: { type: Number, required: true, min: 1, max: 10 },
    date: { type: String, required: true }
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
