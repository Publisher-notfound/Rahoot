import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { params } = req.query
  
  if (!params || params.length !== 3) {
    return res.status(400).json({ error: 'Invalid parameters. Expected: /api/quiz/[genre]/[topic]/[quizName]' })
  }

  const [genre, topic, quizName] = params

  try {
    const quizPath = path.join(process.cwd(), 'quizzes', genre, topic, `${quizName}.json`)
    
    if (!fs.existsSync(quizPath)) {
      return res.status(404).json({ error: 'Quiz not found' })
    }

    const quizData = JSON.parse(fs.readFileSync(quizPath, 'utf8'))
    res.status(200).json(quizData)
  } catch (error) {
    console.error('Error loading quiz:', error)
    res.status(500).json({ error: 'Failed to load quiz' })
  }
}