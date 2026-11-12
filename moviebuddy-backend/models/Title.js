/**
 * Builds the Title model (a movie or a series).
 * @param {import('mongoose').Mongoose} mongoose Connected mongoose instance.
 * @returns {import('mongoose').Model} Title model.
 */
export function createTitleModel(mongoose) {
  const schema = new mongoose.Schema(
    {
      id: { type: Number, required: true, unique: true, index: true },
      title: { type: String, required: true, trim: true },
      poster: { type: String, default: null },
      description: { type: String, required: true },
      releaseDate: { type: String, default: null },
      duration: { type: Number, default: null },
      numOfSeasons: { type: Number, default: null },
      numOfEpisodes: { type: Number, default: null },
      genre: { type: String, default: null, index: true },
      externalRatings: {
        type: new mongoose.Schema({ imdb: Number, rottenTomatoes: Number }, { _id: false }),
        default: null
      }
    },
    { versionKey: false, id: false }
  );
  return mongoose.models.Title || mongoose.model('Title', schema);
}
