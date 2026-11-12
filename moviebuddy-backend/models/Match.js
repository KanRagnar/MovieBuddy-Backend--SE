/**
 * Builds the Match model. `userAId` is always the smaller id of the pair.
 * @param {import('mongoose').Mongoose} mongoose Connected mongoose instance.
 * @returns {import('mongoose').Model} Match model.
 */
export function createMatchModel(mongoose) {
  const schema = new mongoose.Schema(
    {
      id: { type: Number, required: true, unique: true, index: true },
      userAId: { type: Number, required: true, index: true },
      userBId: { type: Number, required: true, index: true },
      createdAt: { type: String, required: true }
    },
    { versionKey: false, id: false }
  );
  return mongoose.models.Match || mongoose.model('Match', schema);
}
