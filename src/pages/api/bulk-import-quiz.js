import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    try {
        const quizArray = req.body

        // Validate it's an array
        if (!Array.isArray(quizArray)) {
            return res.status(400).json({
                error: 'Expected an array of quiz objects',
                success: false
            })
        }

        if (quizArray.length === 0) {
            return res.status(400).json({
                error: 'Array cannot be empty',
                success: false
            })
        }

        const results = []
        const errors = []

        // Process each quiz
        for (let i = 0; i < quizArray.length; i++) {
            const quizData = quizArray[i]

            try {
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
                const quizDir = path.join(process.cwd(), 'quizzes', genre, topic)
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
                errors.push({
                    index: i,
                    quizName: quizData?.quizName || `Quiz ${i + 1}`,
                    error: error.message
                })
            }
        }

        // Return results
        const successCount = results.length
        const errorCount = errors.length

        res.status(200).json({
            message: `Bulk import completed: ${successCount} successful, ${errorCount} failed`,
            success: true,
            totalProcessed: quizArray.length,
            successCount,
            errorCount,
            results,
            errors
        })

    } catch (error) {
        console.error('Bulk import error:', error)
        res.status(500).json({
            error: 'Failed to process bulk import: ' + error.message,
            success: false
        })
    }
}