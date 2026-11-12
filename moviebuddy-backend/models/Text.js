/**
 * Builds the Text model (a chat message between two matched users).
 * @param {import('mongoose').Mongoose} mongoose Connected mongoose instance.
 * @returns {import('mongoose').Model} Text model.
 */
export function createTextModel(mongoose) {
  const schema = new mongoose.Schema(
    {
      id: { type: Number, required: true, unique: true, index: true },
      senderId: { type: Number, required: true, index: true },
      receiverId: { type: Number, required: true, index: true },
      script: { type: String, required: true, maxlength: 1000 },
      date: { type: String, required: true },
      createdAt: { type: String, required: true }
    },
    { versionKey: false, id: false }
  );
  return mongoose.models.Text || mongoose.model('Text', schema);
}
