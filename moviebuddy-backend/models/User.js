/**
 * Builds the User model. Passwords are stored only as scrypt hashes.
 * @param {import('mongoose').Mongoose} mongoose Connected mongoose instance.
 * @returns {import('mongoose').Model} User model.
 */
export function createUserModel(mongoose) {
  const locationSchema = new mongoose.Schema(
    { lat: { type: Number, required: true }, lng: { type: Number, required: true }, label: { type: String, default: null } },
    { _id: false }
  );
  const schema = new mongoose.Schema(
    {
      id: { type: Number, required: true, unique: true, index: true },
      userId: { type: String, required: true, unique: true, trim: true },
      name: { type: String, required: true, trim: true },
      age: { type: Number, required: true, min: 18, max: 120 },
      email: { type: String, default: null },
      passwordHash: { type: String, default: null },
      sex: { type: String, default: null },
      madeIn: { type: String, default: null },
      job: { type: String, default: null },
      into: { type: String, default: null },
      education: { type: String, default: null },
      images: { type: [String], default: [] },
      favoriteTitleIds: { type: [Number], default: [] },
      shownFavoriteIds: { type: [Number], default: [] },
      visible: { type: Boolean, default: true },
      notificationsEnabled: { type: Boolean, default: true },
      gpsEnabled: { type: Boolean, default: false },
      location: { type: locationSchema, default: null },
      createdAt: { type: String }
    },
    { versionKey: false, id: false }
  );
  return mongoose.models.User || mongoose.model('User', schema);
}
