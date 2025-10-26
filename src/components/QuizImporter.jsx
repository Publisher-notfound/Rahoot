import { useState } from 'react'
import Button from './Button'
import toast from 'react-hot-toast'

export default function QuizImporter({ onClose, onSuccess }) {
  const [jsonInput, setJsonInput] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  const validateAndPreview = () => {
    try {
      const data = JSON.parse(jsonInput)
      
      // Check if it's an array (bulk import) or single quiz
      const isBulk = Array.isArray(data)
      const quizzes = isBulk ? data : [data]
      
      if (isBulk && data.length === 0) {
        toast.error('Quiz array cannot be empty')
        return
      }

      // Validate each quiz
      for (let quizIndex = 0; quizIndex < quizzes.length; quizIndex++) {
        const quiz = quizzes[quizIndex]
        const prefix = isBulk ? `Quiz ${quizIndex + 1}: ` : ''
        
        // Basic validation
        const requiredFields = ['genre', 'topic', 'quizName', 'questions']
        const missing = requiredFields.filter(field => !quiz[field])
        
        if (missing.length > 0) {
          toast.error(`${prefix}Missing fields: ${missing.join(', ')}`)
          return
        }

        if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
          toast.error(`${prefix}Questions must be a non-empty array`)
          return
        }

        // Validate questions
        for (let i = 0; i < quiz.questions.length; i++) {
          const q = quiz.questions[i]
          if (!q.question || !Array.isArray(q.answers) || q.answers.length !== 4 || 
              typeof q.solution !== 'number' || q.solution < 0 || q.solution > 3) {
            toast.error(`${prefix}Invalid question at index ${i + 1}`)
            return
          }
        }
      }

      setPreviewData(data)
      if (isBulk) {
        toast.success(`Bulk format is valid! Found ${quizzes.length} quizzes`)
      } else {
        toast.success('Quiz format is valid!')
      }
    } catch (error) {
      toast.error('Invalid JSON format')
    }
  }

  const handleImport = async () => {
    if (!previewData) {
      toast.error('Please validate the quiz first')
      return
    }

    setIsImporting(true)
    try {
      // Determine if it's a single quiz or bulk import
      const isBulk = Array.isArray(previewData)
      const endpoint = isBulk ? '/api/bulk-import-quiz' : '/api/import-quiz'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData)
      })

      const result = await response.json()

      if (result.success) {
        if (isBulk) {
          toast.success(`Bulk import completed! ${result.successCount} quizzes imported successfully`)
          if (result.errorCount > 0) {
            toast.error(`${result.errorCount} quizzes failed to import`)
          }
        } else {
          toast.success('Quiz imported successfully!')
        }
        onSuccess && onSuccess(result)
        onClose && onClose()
      } else {
        toast.error(result.error || 'Import failed')
      }
    } catch (error) {
      toast.error('Network error during import')
    } finally {
      setIsImporting(false)
    }
  }

  const sampleQuiz = {
    "genre": "entertainment",
    "topic": "movies", 
    "quizName": "marvel_heroes",
    "difficulty": 3,
    "pointsMultiplier": 1.0,
    "questions": [
      {
        "question": "Who plays Iron Man in the Marvel movies?",
        "answers": [
          "Chris Evans",
          "Robert Downey Jr.",
          "Chris Hemsworth", 
          "Mark Ruffalo"
        ],
        "solution": 1,
        "cooldown": 5,
        "time": 15,
        "difficulty": 2,
        "image": "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500"
      }
    ]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Import Quiz</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Quiz JSON Format</h3>
            <p className="text-gray-600 mb-4">
              Paste your quiz JSON below. The format should include genre, topic, quizName, and questions array.
            </p>
            
            <div className="mb-4">
              <button
                onClick={() => setJsonInput(JSON.stringify(sampleQuiz, null, 2))}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Load Sample Quiz Format
              </button>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your quiz JSON here..."
              className="w-full h-64 p-3 border rounded-lg font-mono text-sm"
            />
          </div>

          {previewData && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                {Array.isArray(previewData) ? 'Bulk Import Preview' : 'Quiz Preview'}
              </h4>
              <div className="text-sm text-green-700">
                {Array.isArray(previewData) ? (
                  <div>
                    <p><strong>Total Quizzes:</strong> {previewData.length}</p>
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {previewData.map((quiz, index) => (
                        <div key={index} className="mb-1 p-2 bg-white/50 rounded">
                          <strong>{quiz.genre}/{quiz.topic}/{quiz.quizName}</strong> - {quiz.questions.length} questions
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p><strong>Genre:</strong> {previewData.genre}</p>
                    <p><strong>Topic:</strong> {previewData.topic}</p>
                    <p><strong>Quiz Name:</strong> {previewData.quizName}</p>
                    <p><strong>Questions:</strong> {previewData.questions.length}</p>
                    <p><strong>Difficulty:</strong> {previewData.difficulty || 'Not specified'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={validateAndPreview}
              variant="secondary"
              disabled={!jsonInput.trim()}
            >
              Validate & Preview
            </Button>
            
            <Button
              onClick={handleImport}
              disabled={!previewData || isImporting}
            >
              {isImporting ? 'Importing...' : (Array.isArray(previewData) ? `Import ${previewData.length} Quizzes` : 'Import Quiz')}
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Required Format:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>genre</code>: entertainment, knowledge, fun_trivia, test</li>
              <li>• <code>topic</code>: movies, music, history, science, etc.</li>
              <li>• <code>quizName</code>: unique name for this quiz</li>
              <li>• <code>questions</code>: array of question objects</li>
              <li>• Each question needs: question, answers (4 options), solution (0-3), time, cooldown</li>
              <li>• <code>image</code> field should be a URL (https://...) for displaying images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}