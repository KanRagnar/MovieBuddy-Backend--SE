/**
 * Hardcoded mock datasets for immediate availability when MongoDB is not configured.
 */

export const mockTitles = [
  {
    id: 1,
    title: 'Inception',
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    releaseDate: '2010-07-16',
    duration: 148,
    numOfSeasons: 0,
    numOfEpisodes: 0,
    genre: 'Sci-Fi'
  },
  {
    id: 2,
    title: 'Interstellar',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
    releaseDate: '2014-11-07',
    duration: 169,
    numOfSeasons: 0,
    numOfEpisodes: 0,
    genre: 'Adventure'
  },
  {
    id: 3,
    title: 'Breaking Bad',
    poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    description: 'A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student.',
    releaseDate: '2008-01-20',
    duration: 45,
    numOfSeasons: 5,
    numOfEpisodes: 62,
    genre: 'Drama'
  },
  {
    id: 4,
    title: 'The Dark Knight',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    releaseDate: '2008-07-18',
    duration: 152,
    numOfSeasons: 0,
    numOfEpisodes: 0,
    genre: 'Action'
  }
];

export const mockUsers = [
  {
    id: 1,
    userId: 'sampleuser',
    name: 'Alex Papadopoulos',
    age: 26,
    email: 'alex@moviebuddy.gr',
    password: 'samplepassword',
    favoriteMovies: [1, 2],
    madeIn: 'Greece',
    job: 'Software Engineer',
    into: 'Sci-Fi, Thrillers, Hiking',
    education: 'ECE AUTH',
    sex: 'Male',
    isVisible: true,
    likedUsers: [2],
    matchedUsers: [2],
    images: ['https://randomuser.me/api/portraits/men/32.jpg']
  },
  {
    id: 2,
    userId: 'eleni_k',
    name: 'Eleni Konstantinou',
    age: 25,
    email: 'eleni@moviebuddy.gr',
    password: 'password123',
    favoriteMovies: [1, 3],
    madeIn: 'Greece',
    job: 'UX Designer',
    into: 'Drama, Indie Films, Photography',
    education: 'Graphic Design',
    sex: 'Female',
    isVisible: true,
    likedUsers: [1],
    matchedUsers: [1],
    images: ['https://randomuser.me/api/portraits/women/44.jpg']
  },
  {
    id: 3,
    userId: 'nikos_m',
    name: 'Nikos Makris',
    age: 28,
    email: 'nikos@moviebuddy.gr',
    password: 'password123',
    favoriteMovies: [2, 4],
    madeIn: 'Greece',
    job: 'Data Analyst',
    into: 'Action, Sci-Fi, Gaming',
    education: 'Computer Science',
    sex: 'Male',
    isVisible: true,
    likedUsers: [],
    matchedUsers: [],
    images: ['https://randomuser.me/api/portraits/men/65.jpg']
  }
];

export const mockReviews = [
  {
    id: 1,
    titleId: 1,
    userId: 1,
    comment: 'Mind-bending masterpiece! Nolan at his absolute best.',
    rate: 9,
    date: '2026-06-14'
  },
  {
    id: 2,
    titleId: 3,
    userId: 2,
    comment: 'Greatest TV series ever written.',
    rate: 10,
    date: '2026-07-02'
  }
];

export const mockTexts = [
  {
    id: 1,
    sender: 'sampleuser',
    receiver: 'eleni_k',
    script: 'Hey Eleni! Saw you also love Inception and Breaking Bad!',
    date: '2026-11-10'
  },
  {
    id: 2,
    sender: 'eleni_k',
    receiver: 'sampleuser',
    script: 'Hi Alex! Yes, huge fan of Nolan movies. Want to watch a movie this weekend?',
    date: '2026-11-10'
  }
];
