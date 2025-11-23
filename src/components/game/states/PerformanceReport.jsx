import { useState, useEffect } from "react"
import { usePlayerContext } from "@/context/player"
import Button from "@/components/Button"

export default function PerformanceReport({ data: { playerStats, quizData } }) {
  const { player } = usePlayerContext()
  const [reportData, setReportData] = useState(null)

  console.log("PerformanceReport component loaded!", { playerStats, quizData })

  useEffect(() => {
    if (playerStats && quizData) {
      generateReport()
    }
  }, [playerStats, quizData])

  const generateReport = () => {
    const totalQuestions = quizData.questions.length
    const correctAnswers = playerStats.correctAnswers || 0
    const totalTime = playerStats.totalTime || 0
    const avgTimePerQuestion = totalTime / totalQuestions

    // Calculate performance metrics
    const accuracy = ((correctAnswers / totalQuestions) * 100).toFixed(1)
    const speed = avgTimePerQuestion < 10 ? "Fast" : avgTimePerQuestion < 20 ? "Moderate" : "Slow"
    
    // Analyze by category and difficulty
    const categoryAnalysis = analyzeCategoryPerformance(playerStats.answers)
    const difficultyAnalysis = analyzeDifficultyPerformance(playerStats.answers)
    
    // Generate insights
    const performance = {
      overall: {
        score: `${correctAnswers}/${totalQuestions}`,
        accuracy: `${accuracy}%`,
        totalTime: `${Math.round(totalTime)}s`,
        avgTime: `${Math.round(avgTimePerQuestion)}s per question`,
        speed: speed,
        finalScore: playerStats.finalScore || 0
      },
      analysis: generateAnalysis(accuracy, speed, correctAnswers, totalQuestions, categoryAnalysis, difficultyAnalysis),
      recommendations: generateRecommendations(accuracy, quizData.genre, quizData.topic, categoryAnalysis)
    }

    setReportData(performance)
  }

  const analyzeCategoryPerformance = (answers) => {
    const categories = {}
    answers.forEach(answer => {
      const cat = answer.category || "General"
      if (!categories[cat]) {
        categories[cat] = { correct: 0, total: 0 }
      }
      categories[cat].total++
      if (answer.isCorrect) categories[cat].correct++
    })
    
    // Calculate accuracy for each category
    Object.keys(categories).forEach(cat => {
      categories[cat].accuracy = ((categories[cat].correct / categories[cat].total) * 100).toFixed(1)
    })
    
    return categories
  }

  const analyzeDifficultyPerformance = (answers) => {
    const difficulties = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } }
    
    answers.forEach(answer => {
      const diff = answer.difficulty <= 2 ? "easy" : answer.difficulty <= 3 ? "medium" : "hard"
      difficulties[diff].total++
      if (answer.isCorrect) difficulties[diff].correct++
    })
    
    Object.keys(difficulties).forEach(diff => {
      if (difficulties[diff].total > 0) {
        difficulties[diff].accuracy = ((difficulties[diff].correct / difficulties[diff].total) * 100).toFixed(1)
      }
    })
    
    return difficulties
  }

  const generateAnalysis = (accuracy, speed, correct, total, categoryAnalysis, difficultyAnalysis) => {
    const strengths = []
    const improvements = []

    // Overall performance analysis
    if (accuracy >= 80) strengths.push("Excellent knowledge retention")
    else if (accuracy >= 60) strengths.push("Good understanding of concepts")
    else improvements.push("Focus on fundamental concepts")

    if (speed === "Fast") strengths.push("Quick decision making")
    else if (speed === "Slow") improvements.push("Work on time management")

    if (correct === total) strengths.push("Perfect accuracy! 🎯")
    
    // Category-specific analysis
    const bestCategory = Object.keys(categoryAnalysis).reduce((best, cat) => 
      categoryAnalysis[cat].accuracy > (categoryAnalysis[best]?.accuracy || 0) ? cat : best, "")
    
    if (bestCategory && categoryAnalysis[bestCategory].accuracy >= 75) {
      strengths.push(`Strong in ${bestCategory} topics`)
    }

    // Difficulty analysis
    if (difficultyAnalysis.hard.total > 0 && difficultyAnalysis.hard.accuracy >= 60) {
      strengths.push("Handles challenging questions well")
    }
    
    if (difficultyAnalysis.easy.total > 0 && difficultyAnalysis.easy.accuracy < 80) {
      improvements.push("Review basic concepts more thoroughly")
    }
    
    return { strengths, improvements, categoryAnalysis, difficultyAnalysis }
  }

  const generateRecommendations = (accuracy, genre, topic, categoryAnalysis) => {
    const recommendations = []
    
    // Learning resources based on topic
    const learningResources = {
      movies: {
        weak: "📚 Watch classic films and read film analysis",
        strong: "🎬 Explore film theory and directing techniques"
      },
      science: {
        weak: "🔬 Review basic scientific principles and experiments",
        strong: "🧪 Dive into advanced research papers and case studies"
      },
      memes: {
        weak: "😄 Browse popular meme formats and internet culture",
        strong: "🌐 Study digital communication and viral content creation"
      },
      history: {
        weak: "📖 Review historical timelines and key events",
        strong: "🏛️ Explore historical analysis and primary sources"
      },
      default: {
        weak: "📖 Review fundamental concepts and practice regularly",
        strong: "🚀 Explore advanced topics and teach others"
      }
    }

    const resources = learningResources[topic?.toLowerCase()] || learningResources.default
    
    if (accuracy < 70) {
      recommendations.push({
        type: "Study Material",
        title: `Review ${topic} fundamentals`,
        description: resources.weak,
        action: "Practice more quizzes in this topic"
      })
      
      recommendations.push({
        type: "Learning Resource",
        title: "Recommended Study Plan",
        description: "Spend 15-20 minutes daily on this topic",
        action: "Set a daily learning goal and track progress"
      })
    }

    if (accuracy >= 70 && accuracy < 90) {
      recommendations.push({
        type: "Advanced Practice",
        title: `Explore advanced ${topic} topics`,
        description: resources.strong,
        action: "Take harder difficulty quizzes"
      })
    }

    if (accuracy >= 90) {
      recommendations.push({
        type: "Mastery Achievement",
        title: `Excellent ${topic} knowledge! 🏆`,
        description: "You've mastered this topic! Consider teaching others or exploring related subjects",
        action: "Try quizzes in related subjects or create your own questions"
      })
    }

    // Category-specific recommendations
    const weakestCategory = Object.keys(categoryAnalysis).reduce((weakest, cat) => 
      categoryAnalysis[cat].accuracy < (categoryAnalysis[weakest]?.accuracy || 100) ? cat : weakest, "")
    
    if (weakestCategory && categoryAnalysis[weakestCategory].accuracy < 60) {
      recommendations.push({
        type: "Focus Area",
        title: `Improve ${weakestCategory} knowledge`,
        description: `You scored ${categoryAnalysis[weakestCategory].accuracy}% in ${weakestCategory} questions`,
        action: `Study more about ${weakestCategory} topics`
      })
    }

    // Always add a motivational recommendation
    recommendations.push({
      type: "Keep Learning",
      title: "Continue Your Learning Journey",
      description: "Consistent practice leads to mastery. Keep challenging yourself!",
      action: "Set weekly quiz goals and track your improvement over time"
    })

    return recommendations
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Generating your performance report...</div>
      </div>
    )
  }

  // Generate study resources for incorrect answers
  const generateStudyResources = () => {
    const resources = []
    const incorrectQuestions = []

    // Find incorrect answers from player stats
    playerStats?.answers?.forEach((answer, index) => {
      if (!answer.isCorrect) {
        const question = quizData.questions[index]
        if (question.resources && question.resources.length > 0) {
          incorrectQuestions.push({
            question: question.question,
            resources: question.resources
          })
        }
      }
    })

    return incorrectQuestions
  }

  const studyResources = generateStudyResources()

  return (
    <section className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-start px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
          📊 Performance Report
        </h1>
        <p className="text-white/80 text-lg">
          {player?.username}'s Quiz Analysis
        </p>
      </div>

      {/* Overall Performance Card */}
      <div className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          🎯 Overall Performance
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{reportData.overall.score}</div>
            <div className="text-white/70 text-sm">Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{reportData.overall.accuracy}</div>
            <div className="text-white/70 text-sm">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{reportData.overall.totalTime}</div>
            <div className="text-white/70 text-sm">Total Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{reportData.overall.speed}</div>
            <div className="text-white/70 text-sm">Speed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">{reportData.overall.finalScore}</div>
            <div className="text-white/70 text-sm">Points</div>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="w-full grid md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
            ✨ Your Strengths
          </h3>
          {reportData.analysis.strengths.length > 0 ? (
            <ul className="space-y-2">
              {reportData.analysis.strengths.map((strength, index) => (
                <li key={index} className="text-white flex items-center">
                  <span className="text-green-400 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/70">Keep practicing to build your strengths!</p>
          )}
        </div>

        {/* Areas for Improvement */}
        <div className="bg-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-400/30">
          <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
            🎯 Areas to Improve
          </h3>
          {reportData.analysis.improvements.length > 0 ? (
            <ul className="space-y-2">
              {reportData.analysis.improvements.map((improvement, index) => (
                <li key={index} className="text-white flex items-center">
                  <span className="text-orange-400 mr-2">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/70">Great job! No major areas for improvement.</p>
          )}
        </div>
      </div>

      {/* Study Resources for Incorrect Answers */}
      {studyResources.length > 0 && (
        <div className="w-full bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-red-400/30">
          <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
            📚 Study Resources (Review These)
          </h3>
          <p className="text-white/80 mb-4">
            Here are targeted learning materials for the questions you got wrong:
          </p>
          <div className="space-y-4">
            {studyResources.map((item, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2 text-sm">
                  "{item.question}"
                </h4>
                <div className="space-y-1">
                  {item.resources.map((resource, resIndex) => (
                    <a
                      key={resIndex}
                      href={resource.startsWith('http') ? resource : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-300 hover:text-blue-200 text-sm underline"
                    >
                      📖 {resource}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="w-full bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-blue-400/30">
        <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
          💡 Personalized Recommendations
        </h3>
        <div className="space-y-4">
          {reportData.recommendations.map((rec, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {rec.type}
                </span>
              </div>
              <h4 className="text-white font-semibold mb-1">{rec.title}</h4>
              <p className="text-white/70 text-sm mb-2">{rec.description}</p>
              <p className="text-blue-300 text-sm font-medium">💡 {rec.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => window.location.href = '/'}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Take Another Quiz
        </Button>
        <Button
          onClick={() => window.print()}
          variant="secondary"
        >
          Save Report
        </Button>
      </div>
    </section>
  )
