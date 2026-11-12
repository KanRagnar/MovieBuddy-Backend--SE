/**
 * Builds the Review model (one review per user per title).
 * @param {import('mongoose').Mongoose} mongoose Connected mongoose instance.
 * @returns {import('mongoose').Model} Review model.
 */
export function createReviewModel(mongoose) {
  const schema = new mongoose.Schema(
    {
      id: { type: Number, required: true, unique: true, index: true },
      titleId: { type: Number, required: true, index: true },
      userId: { type: Number, required: true, index: true },
      rate: { type: Number, required: true, min: 1, max: 10 },
      comment: { type: String, required: true, maxlength: 80 },
      date: { type: String, required: true },
      updatedAt: { type: String, default: null }
    },
    { versionKey: false, id: false }
  );
  return mongoose.models.Review || mongoose.model('Review', schema);
}
