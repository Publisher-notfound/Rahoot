#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function importQuiz(quizFilePath) {
  try {
    // Read the quiz file
    if (!fs.existsSync(quizFilePath)) {
      console.error(`❌ Quiz file not found: ${quizFilePath}`)
      process.exit(1)
    }

    const quizData = JSON.parse(fs.readFileSync(quizFilePath, 'utf8'))

    // Validate required fields
    const requiredFields = ['genre', 'topic', 'quizName', 'questions']
    for (const field of requiredFields) {
      if (!quizData[field]) {
        console.error(`❌ Missing required field: ${field}`)
        process.exit(1)
      }
    }

    // Validate questions structure
    if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      console.error('❌ Questions must be a non-empty array')
      process.exit(1)
    }

    // Validate each question
    for (let i = 0; i < quizData.questions.length; i++) {
      const q = quizData.questions[i]
      if (!q.question || !Array.isArray(q.answers) || q.answers.length !== 4 || 
          typeof q.solution !== 'number' || q.solution < 0 || q.solution > 3) {
        console.error(`❌ Invalid question structure at index ${i + 1}`)
        process.exit(1)
      }
      
      // Validate image URL if provided
      if (q.image && !q.image.startsWith('http')) {
        console.error(`❌ Invalid image URL at question ${i + 1}. Image must be a valid URL starting with http/https`)
        process.exit(1)
      }
    }

    // Sanitize names for file system
    const sanitize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '_')
    const genre = sanitize(quizData.genre)
    const topic = sanitize(quizData.topic)
    const quizName = sanitize(quizData.quizName)

    // Create directory structure
    const projectRoot = path.join(__dirname, '..')
    const quizDir = path.join(projectRoot, 'quizzes', genre, topic)
    fs.mkdirSync(quizDir, { recursive: true })

    // Create quiz file
    const quizPath = path.join(quizDir, `${quizName}.json`)
    
    // Check if quiz already exists
    if (fs.existsSync(quizPath)) {
      console.error(`❌ Quiz already exists: ${genre}/${topic}/${quizName}`)
      console.log('Use --force flag to overwrite existing quiz')
      process.exit(1)
    }

    // Write quiz file
    fs.writeFileSync(quizPath, JSON.stringify(quizData, null, 2))

    console.log('✅ Quiz imported successfully!')
    console.log(`📁 Location: quizzes/${genre}/${topic}/${quizName}.json`)
    console.log(`📊 Questions: ${quizData.questions.length}`)
    console.log(`🎯 Genre: ${quizData.genre}`)
    console.log(`📚 Topic: ${quizData.topic}`)
    console.log(`🏷️  Quiz Name: ${quizData.quizName}`)

  } catch (error) {
    console.error('❌ Import failed:', error.message)
    process.exit(1)
  }
}

// CLI usage
const args = process.argv.slice(2)
if (args.length === 0) {
  console.log(`
📚 Adhyayan Quiz Importer

Usage: node scripts/import-quiz.js <quiz-file.json>

Example: node scripts/import-quiz.js sample-quiz.json

The quiz file should contain:
{
  "genre": "entertainment",
  "topic": "movies", 
  "quizName": "bollywood_classics",
  "questions": [...]
}
`)
  process.exit(0)
}

const quizFile = args[0]
importQuiz(quizFile)