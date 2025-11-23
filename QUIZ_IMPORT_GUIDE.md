# Quiz Import System for Adhyayan

This guide explains how to import quizzes into the Adhyayan quiz platform.

## Quiz Structure

The platform uses a hierarchical structure:
- **Genre** (entertainment, knowledge, fun_trivia, test)
- **Topic** (movies, music, history, science, etc.)
- **Quiz Name** (unique identifier for each quiz)

## Import Methods

### 1. Web Interface (Recommended)
1. Start the application: `npm run all-dev`
2. Go to `http://localhost:3000`
3. Click "Admin Panel" in the top-right corner
4. Click "Import New Quiz"
5. Paste your JSON and validate
6. Import the quiz

### 2. Command Line

**Single Quiz Import:**
```bash
npm run import-quiz sample-quiz.json
# or
node scripts/import-quiz.js your-quiz.json
```

**Bulk Import (Multiple Quizzes):**
```bash
npm run bulk-import temporaryquizsample.json
# or
node scripts/bulk-import-quiz.js your-quiz-array.json
```

## Quiz JSON Format

```json
{
  "genre": "entertainment",
  "topic": "movies", 
  "quizName": "bollywood_classics",
  "difficulty": 3,
  "pointsMultiplier": 1.0,
  "questions": [
    {
      "question": "Your question text here?",
      "answers": [
        "Option A",
        "Option B", 
        "Option C",
        "Option D"
      ],
      "solution": 1,
      "cooldown": 5,
      "time": 15,
      "difficulty": 2,
      "image": "https://images.unsplash.com/photo-1234567890?w=500",
      "category": "Directors",
      "learningResources": {
        "studyTip": "Focus on major blockbuster directors of the 1990s",
        "reference": "Study James Cameron's filmography including Terminator, Aliens, and Avatar",
        "relatedTopics": ["1990s Cinema", "Blockbuster Films", "Academy Award Winners"]
      }
    }
  ]
}
```

## Required Fields

### Quiz Level
- `genre`: Must be one of: entertainment, knowledge, fun_trivia, test
- `topic`: Topic within the genre (movies, music, history, etc.)
- `quizName`: Unique identifier for this quiz
- `questions`: Array of question objects

### Question Level
- `question`: The question text
- `answers`: Array of exactly 4 answer options
- `solution`: Index of correct answer (0-3)
- `cooldown`: Seconds to display question before allowing answers
- `time`: Seconds players have to answer

### Optional Fields
- `difficulty`: Quiz difficulty (1-5)
- `pointsMultiplier`: Scoring multiplier
- `image`: Image URL for questions (optional, use Unsplash or other image hosting)
- `category`: Question category for grouping analysis (e.g., "Directors", "History")
- `learningResources`: Object containing study materials and tips

## Available Genres & Topics

### Entertainment
- movies: Hollywood, Bollywood, international cinema
- music: Pop, rock, classical, regional music
- tv_shows: Netflix, series, reality shows
- gaming: Mobile games, console games, esports

### Knowledge  
- history: World history, ancient civilizations
- science: Physics, chemistry, biology, innovations
- geography: Countries, capitals, landmarks
- current_affairs: News, politics, viral events

### Fun & Trivia
- riddles: Brain teasers, logic puzzles
- memes: Internet culture, viral content
- puzzles: Word games, number puzzles
- life_hacks: Tips, tricks, funny facts

### Test
- dev: Developer testing quizzes

## Example Usage

1. **Create a quiz JSON file**:
```json
{
  "genre": "knowledge",
  "topic": "science",
  "quizName": "space_exploration",
  "difficulty": 4,
  "questions": [
    {
      "question": "Which planet is known as the Red Planet?",
      "answers": ["Venus", "Mars", "Jupiter", "Saturn"],
      "solution": 1,
      "cooldown": 5,
      "time": 15,
      "difficulty": 2
    }
  ]
}
```

2. **Import via CLI**:
```bash
npm run import-quiz space-quiz.json
```

3. **The quiz will be available in the game** under:
   - Genre: Knowledge
   - Topic: Science  
   - Quiz: Space Exploration

## File Organization

Imported quizzes are stored as:
```
quizzes/
├── entertainment/
│   ├── movies/
│   │   ├── bollywood_classics.json
│   │   └── hollywood_blockbusters.json
│   └── music/
│       └── pop_hits.json
├── knowledge/
│   ├── science/
│   │   └── space_exploration.json
│   └── history/
└── fun_trivia/
```

## Validation

The system validates:
- Required fields are present
- Questions have exactly 4 answers
- Solution index is valid (0-3)
- JSON format is correct
- No duplicate quiz names in same genre/topic

## Tips for Quiz Creation

1. **Question Quality**: Make questions clear and unambiguous
2. **Answer Balance**: Ensure one clearly correct answer
3. **Difficulty Progression**: Mix easy and hard questions
4. **Time Limits**: 10-15 seconds works well for most questions
5. **Images**: Use Unsplash URLs or other image hosting for visual elements
6. **Testing**: Test your quiz before sharing

## Sharing Quizzes

To share a quiz with others:
1. Export the JSON file
2. Share the file or JSON content
3. Recipients can import using either method above

The quiz will automatically appear in the game selection menu once imported!