#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function bulkImportQuizzes(quizFilePath) {
  try {
    // Read the quiz file
    if (!fs.existsSync(quizFilePath)) {
      console.error(`❌ Quiz file not found: ${quizFilePath}`)
      process.exit(1)
    }

    const quizArray = JSON.parse(fs.readFileSync(quizFilePath, 'utf8'))

    // Validate it's an array
    if (!Array.isArray(quizArray)) {
      console.error('❌ Expected an array of quiz objects')
      process.exit(1)
    }

    if (quizArray.length === 0) {
      console.error('❌ Array cannot be empty')
      process.exit(1)
    }

    console.log(`📚 Processing ${quizArray.length} quizzes...`)

    const results = []
    const errors = []

    // Process each quiz
    for (let i = 0; i < quizArray.length; i++) {
      const quizData = quizArray[i]
      
      try {
        console.log(`\n🔄 Processing quiz ${i + 1}: ${quizData.quizName || 'Unknown'}`)

        // Validate required fields
        const requiredFields = ['genre', 'topic', 'quizName', 'questions']
        for (const field of requiredFields) {
          if (!quizData[field]) {
            throw new Error(`Missing required field: ${field}`)
          }
        }

        // Validate questions structure
        if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          throw new Error('Questions must be a non-empty array')
        }

        // Validate each question
        for (let j = 0; j < quizData.questions.length; j++) {
          const q = quizData.questions[j]
          if (!q.question || !Array.isArray(q.answers) || q.answers.length !== 4 || 
              typeof q.solution !== 'number' || q.solution < 0 || q.solution > 3) {
            throw new Error(`Invalid question structure at question ${j + 1}`)
          }
          
          // Validate image URL if provided
          if (q.image && !q.image.startsWith('http')) {
            throw new Error(`Invalid image URL at question ${j + 1}. Image must be a valid URL starting with http/https`)
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
          throw new Error(`Quiz already exists: ${genre}/${topic}/${quizName}`)
        }

        // Write quiz file
        fs.writeFileSync(quizPath, JSON.stringify(quizData, null, 2))

        results.push({
          path: `${genre}/${topic}/${quizName}`,
          quizData: {
            genre: quizData.genre,
            topic: quizData.topic,
            quizName: quizData.quizName,
            questionCount: quizData.questions.length
          }
        })

        console.log(`✅ Successfully imported: ${genre}/${topic}/${quizName}`)

      } catch (error) {
        errors.push({
          index: i,
          quizName: quizData?.quizName || `Quiz ${i + 1}`,
          error: error.message
        })
        console.log(`❌ Failed to import quiz ${i + 1}: ${error.message}`)
      }
    }

    // Summary
    console.log(`\n📊 Bulk Import Summary:`)
    console.log(`✅ Successfully imported: ${results.length} quizzes`)
    console.log(`❌ Failed to import: ${errors.length} quizzes`)
    
    if (results.length > 0) {
      console.log(`\n📁 Successfully imported quizzes:`)
      results.forEach(result => {
        console.log(`   • ${result.path} (${result.quizData.questionCount} questions)`)
      })
    }

    if (errors.length > 0) {
      console.log(`\n❌ Failed imports:`)
      errors.forEach(error => {
        console.log(`   • ${error.quizName}: ${error.error}`)
      })
    }

  } catch (error) {
    console.error('❌ Bulk import failed:', error.message)
    process.exit(1)
  }
}

// CLI usage
const args = process.argv.slice(2)
if (args.length === 0) {
  console.log(`
📚 Adhyayan Bulk Quiz Importer

Usage: node scripts/bulk-import-quiz.js <quiz-array-file.json>

Example: node scripts/bulk-import-quiz.js temporaryquizsample.json

The quiz file should contain an array of quiz objects:
[
  {
    "genre": "entertainment",
    "topic": "movies", 
    "quizName": "hollywood_blockbusters",
    "questions": [...]
  },
  {
    "genre": "knowledge",
    "topic": "science",
    "quizName": "space_exploration", 
    "questions": [...]
  }
]
`)
  process.exit(0)
}

const quizFile = args[0]
bulkImportQuizzes(quizFile)