import { useState, useEffect } from 'react'
import QuizImporter from '@/components/QuizImporter'
import Button from '@/components/Button'
import toast from 'react-hot-toast'

export default function Admin() {
  const [showImporter, setShowImporter] = useState(false)
  const [quizzes, setQuizzes] = useState({})
  const [stats, setStats] = useState({ total: 0, byGenre: {} })

  const loadQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes')
      const data = await response.json()
      setQuizzes(data)
      
      // Calculate stats
      let total = 0
      const byGenre = {}
      
      Object.entries(data).forEach(([genre, topics]) => {
        byGenre[genre] = 0
        Object.entries(topics).forEach(([topic, quizNames]) => {
          byGenre[genre] += quizNames.length
          total += quizNames.length
        })
      })
      
      setStats({ total, byGenre })
    } catch (error) {
      toast.error('Failed to load quizzes')
    }
  }

  useEffect(() => {
    loadQuizzes()
  }, [])

  const handleImportSuccess = () => {
    loadQuizzes() // Refresh the quiz list
    toast.success('Quiz imported and available in game!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Admin Panel</h1>
          <p className="text-white/80">Manage and import quizzes for Adhyayan</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <h3 className="text-white/80 text-sm font-medium">Total Quizzes</h3>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          {Object.entries(stats.byGenre).map(([genre, count]) => (
            <div key={genre} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white/80 text-sm font-medium capitalize">{genre}</h3>
              <p className="text-2xl font-bold text-white">{count}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
          <div className="flex gap-4">
            <Button onClick={() => setShowImporter(true)}>
              Import New Quiz
            </Button>
            <Button 
              variant="secondary"
              onClick={() => window.open('/api/quizzes', '_blank')}
            >
              View Quiz API
            </Button>
          </div>
        </div>

        {/* Quiz List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Available Quizzes</h2>
          
          {Object.keys(quizzes).length === 0 ? (
            <p className="text-white/60">No quizzes available. Import some quizzes to get started!</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(quizzes).map(([genre, topics]) => (
                <div key={genre} className="border border-white/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white capitalize mb-2">{genre}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {Object.entries(topics).map(([topic, quizNames]) => (
                      <div key={topic} className="bg-white/5 rounded p-3">
                        <h4 className="font-medium text-white/90 capitalize mb-1">{topic}</h4>
                        <div className="text-sm text-white/70">
                          {quizNames.length > 0 ? (
                            <ul className="space-y-1">
                              {quizNames.map(quiz => (
                                <li key={quiz} className="capitalize">• {quiz.replace(/_/g, ' ')}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="italic">No quizzes</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Import Format Guide */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-white mb-4">Import Guide</h2>
          <div className="text-white/80 space-y-2">
            <p>To import a quiz, provide JSON with this structure:</p>
            <pre className="bg-black/20 p-3 rounded text-sm overflow-x-auto">
{`{
  "genre": "entertainment",     // entertainment, knowledge, fun_trivia, test
  "topic": "movies",           // movies, music, history, science, etc.
  "quizName": "marvel_heroes", // unique quiz identifier
  "difficulty": 3,             // 1-5 scale (optional)
  "pointsMultiplier": 1.0,     // scoring multiplier (optional)
  "questions": [
    {
      "question": "Your question here?",
      "answers": ["Option A", "Option B", "Option C", "Option D"],
      "solution": 1,           // correct answer index (0-3)
      "cooldown": 5,           // seconds to show question
      "time": 15,              // seconds to answer
      "difficulty": 2,         // question difficulty (optional)
      "image": "description"   // image description (optional)
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </div>

      {showImporter && (
        <QuizImporter 
          onClose={() => setShowImporter(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  )
}