import fs from 'fs'
import path from 'path'

function getAvailableQuizzes() {
  const quizzesDir = path.join(process.cwd(), 'quizzes');
  const quizzes = {};

  if (!fs.existsSync(quizzesDir)) return quizzes;

  const genres = fs.readdirSync(quizzesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  genres.forEach(genre => {
    quizzes[genre] = {};
    const genreDir = path.join(quizzesDir, genre);
    
    if (!fs.existsSync(genreDir)) return;
    
    const topics = fs.readdirSync(genreDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    topics.forEach(topic => {
      quizzes[genre][topic] = [];
      const topicDir = path.join(quizzesDir, genre, topic);
      
      if (!fs.existsSync(topicDir)) return;
      
      // Get all .json files in the topic directory
      const quizFiles = fs.readdirSync(topicDir)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
      
      quizzes[genre][topic] = quizFiles;
    });
  });

  return quizzes;
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const quizzes = getAvailableQuizzes()
      res.status(200).json(quizzes)
    } catch (error) {
      res.status(500).json({ error: 'Failed to load quizzes' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
