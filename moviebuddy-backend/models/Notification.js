/**
 * Builds the Notification model (new title / new match / new message).
 * @param {import('mongoose').Mongoose} mongoose Connected mongoose instance.
 * @returns {import('mongoose').Model} Notification model.
 */
export function createNotificationModel(mongoose) {
  const schema = new mongoose.Schema(
    {
      id: { type: Number, required: true, unique: true, index: true },
      userId: { type: Number, required: true, index: true },
      type: { type: String, required: true, enum: ['new_title', 'new_match', 'new_message'] },
      message: { type: String, required: true },
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
      read: { type: Boolean, default: false },
      createdAt: { type: String, required: true }
    },
    { versionKey: false, id: false, minimize: false }
  );
  return mongoose.models.Notification || mongoose.model('Notification', schema);
}
