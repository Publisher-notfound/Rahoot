import fs from 'fs'
import path from 'path'

function getAvailableQuizzes() {
  const quizzesDir = path.join(process.cwd(), 'quizzes');
  const quizzes = {};

  if (!fs.existsSync(quizzesDir)) return quizzes;

  const subjects = fs.readdirSync(quizzesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  subjects.forEach(subject => {
    quizzes[subject] = {};
    const subjectDir = path.join(quizzesDir, subject);
    const classes = fs.readdirSync(subjectDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    classes.forEach(cls => {
      quizzes[subject][cls] = [];
      const classDir = path.join(subjectDir, cls);
      const chapters = fs.readdirSync(classDir)
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
      quizzes[subject][cls] = chapters;
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
