/**
 * Builds the Swipe model (a left/right decision of one user on another profile).
 * @param {import('mongoose').Mongoose} mongoose Connected mongoose instance.
 * @returns {import('mongoose').Model} Swipe model.
 */
export function createSwipeModel(mongoose) {
  const schema = new mongoose.Schema(
    {
      id: { type: Number, required: true, unique: true, index: true },
      fromUserId: { type: Number, required: true, index: true },
      toUserId: { type: Number, required: true, index: true },
      direction: { type: String, required: true, enum: ['left', 'right'] },
      createdAt: { type: String, required: true }
    },
    { versionKey: false, id: false }
  );
  return mongoose.models.Swipe || mongoose.model('Swipe', schema);
}
