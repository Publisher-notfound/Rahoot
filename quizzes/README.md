# Quiz Content Format

Use this as the template for each quiz.json inside each quiz folder.

## JSON Format
```json
{
  "genre": "entertainment",
  "topic": "movies",
  "quizName": "Hollywood Blockbusters",
  "difficulty": 3,
  "pointsMultiplier": 1.0,
  "questions": [
    {
      "question": "Your question text here",
      "answers": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "solution": 0,  // Index of correct answer (0-3)
      "cooldown": 5,  // Seconds to show question
      "time": 15,     // Seconds for player to answer
      "difficulty": 2,
      "image": "optional image URL or description if visual"
    }
  ]
}
```

## All Quizzes to Generate

### Entertainment Genre
#### Movies Topic
1. **Quiz: Hollywood Blockbusters**
   - 10 questions about famous Hollywood movies, directors, actors
   - Focus on 90s-2020s hits, Oscar winners, franchises

2. **Quiz: Bollywood Bangers**
   - 10 questions about Indian cinema, superstars, songs
   - Bollywood music videos, dance numbers, plot twists

#### Music Topic
3. **Quiz: Pop Hits Galore**
   - 10 questions about chart-topping pop songs, artists
   - Viral TikTok challenges, remixes, album releases

4. **Quiz: Hip Hop & Rap Legends**
   - 10 questions about rap history, influential artists
   - Music video trivia, collab tracks

#### Gaming Topic
5. **Quiz: Mobile Game Mania**
   - 10 questions about popular mobile games
   - Avoiding addictive games, viral challenges

### Knowledge Genre
#### History Topic
6. **Quiz: World History Timeline**
   - 10 questions about major historical events, figures
   - Ancient civilizations, wars, inventions, discoveries

#### Science Topic
7. **Quiz: Amazing Inventions**
   - 10 questions about scientific breakthroughs
   - Edison, Tesla, modern tech innovations

### Fun & Trivia Genre
#### Riddles Topic
8. **Quiz: Logic Puzzles**
   - 10 brain-teasing riddle questions
   - Classic logic problems, lateral thinking

#### Memes Topic
9. **Quiz: Internet Memes Quiz**
   - 10 questions about viral meme culture
   - Old memes, new trends, meme origins

### Sample Quiz Content for Reference
- Questions should be engaging, multiple choice
- Time: 10-15 seconds each
- Difficulty: 1-5 scale
- Include image URLs for visual appeal where relevant
- Focused on college students' interests: music, movies, gaming, current events

Generate each quiz using this format and place in `quizzes/GENRE/TOPIC/QUIZ_NAME/quiz.json`

For testing, create at least Entertainment/Movies/Hollywood Blockbusters with 10 sample questions.
