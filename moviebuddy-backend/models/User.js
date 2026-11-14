import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    userId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 18 },
    email: { type: String, default: '' },
    password: { type: String, default: 'samplepassword' },
    favoriteMovies: [{ type: Number }],
    madeIn: { type: String, default: '' },
    job: { type: String, default: '' },
    into: { type: String, default: '' },
    education: { type: String, default: '' },
    sex: { type: String, default: '' },
    isVisible: { type: Boolean, default: true },
    likedUsers: [{ type: Number }],
    matchedUsers: [{ type: Number }],
    images: [{ type: String }]
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
