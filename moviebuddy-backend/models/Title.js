import mongoose from 'mongoose';

const titleSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    poster: { type: String, default: '' },
    description: { type: String, required: true },
    releaseDate: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    numOfSeasons: { type: Number, default: 0 },
    numOfEpisodes: { type: Number, default: 0 },
    genre: { type: String, default: 'General' }
  },
  { timestamps: true }
);

const Title = mongoose.model('Title', titleSchema);
export default Title;
