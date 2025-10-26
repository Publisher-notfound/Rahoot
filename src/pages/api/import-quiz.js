import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const quizData = req.body

    // Validate required fields
    const requiredFields = ['genre', 'topic', 'quizName', 'questions']
    for (const field of requiredFields) {
      if (!quizData[field]) {
        return res.status(400).json({ 
          error: `Missing required field: ${field}`,
          success: false 
        })
      }
    }

    // Validate questions structure
    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      return res.status(400).json({ 
        error: 'Questions must be a non-empty array',
        success: false 
      })
    }

    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i]
      if (!q.question || !Array.isArray(q.answers) || q.answers.length !== 4 || 
          typeof q.solution !== 'number' || q.solution < 0 || q.solution > 3) {
        return res.status(400).json({ 
          error: `Invalid question structure at index ${i}`,
          success: false 
        })
      }
      
      // Validate image URL if provided
      if (q.image && !q.image.startsWith('http')) {
        return res.status(400).json({ 
          error: `Invalid image URL at question ${i + 1}. Image must be a valid URL starting with http/https`,
          success: false 
        })
      }
    }

    // Sanitize names for file system
    const sanitize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const genre = sanitize(quizData.genre)
    const topic = sanitize(quizData.topic)
    const quizName = sanitize(quizData.quizName)

    // Create directory structure
    const quizDir = path.join(process.cwd(), 'quizzes', genre, topic)
    fs.mkdirSync(quizDir, { recursive: true })

    // Create quiz file
    const quizPath = path.join(quizDir, `${quizName}.json`)
    
    // Check if quiz already exists
    if (fs.existsSync(quizPath)) {
      return res.status(409).json({ 
        error: 'Quiz already exists. Use update endpoint to modify existing quiz.',
        success: false 
      })
    }

    // Write quiz file
    fs.writeFileSync(quizPath, JSON.stringify(quizData, null, 2))

    res.status(201).json({ 
      message: 'Quiz imported successfully',
      success: true,
      path: `${genre}/${topic}/${quizName}`,
      quizData: {
        genre: quizData.genre,
        topic: quizData.topic,
        quizName: quizData.quizName,
        questionCount: quizData.questions.length
      }
    })

  } catch (error) {
    console.error('Quiz import error:', error)
    res.status(500).json({ 
      error: 'Failed to import quiz: ' + error.message,
      success: false 
    })
  }
}