# Master Prompt for AI Quiz Generation - Adhyayan Platform

## Task Overview
Generate comprehensive quiz content for the Adhyayan quiz platform. Create at least one quiz for each genre and topic combination listed below. Each quiz should contain 8-12 engaging questions suitable for college students and young adults.

## Required JSON Format
```json
{
  "genre": "entertainment",
  "topic": "movies",
  "quizName": "hollywood_blockbusters",
  "difficulty": 3,
  "pointsMultiplier": 1.0,
  "questions": [
    {
      "question": "Which movie won the Academy Award for Best Picture in 2020?",
      "answers": [
        "1917",
        "Parasite", 
        "Joker",
        "Once Upon a Time in Hollywood"
      ],
      "solution": 1,
      "cooldown": 5,
      "time": 15,
      "difficulty": 3,
      "image": "https://images.unsplash.com/photo-1489599735734-79b4fc8c4c8a?w=500"
    }
  ]
}
```

## Required Quiz Coverage

### Genre: entertainment
#### Topic: movies
- **hollywood_blockbusters**: Major Hollywood hits, franchises, Oscar winners (2000-2024)
- **bollywood_classics**: Popular Bollywood films, actors, iconic scenes
- **animated_movies**: Disney, Pixar, Studio Ghibli, DreamWorks films
- **superhero_cinema**: Marvel, DC, superhero movie trivia

#### Topic: music  
- **pop_hits_2020s**: Chart-toppers, viral songs, streaming hits
- **rock_legends**: Classic rock bands, iconic albums, guitar heroes
- **hip_hop_culture**: Rap history, influential artists, album releases
- **k_pop_mania**: BTS, Blackpink, K-pop trends and facts

#### Topic: tv_shows
- **netflix_originals**: Popular Netflix series, characters, plot points
- **sitcom_classics**: Friends, The Office, How I Met Your Mother
- **reality_tv**: Survivor, Big Brother, dating shows
- **anime_series**: Popular anime, characters, storylines

#### Topic: gaming
- **mobile_gaming**: Popular mobile games, mechanics, viral trends
- **console_classics**: PlayStation, Xbox, Nintendo iconic games
- **esports_world**: Professional gaming, tournaments, famous players
- **indie_games**: Independent game developers, unique mechanics

### Genre: knowledge
#### Topic: history
- **world_wars**: WWI & WWII events, figures, outcomes
- **ancient_civilizations**: Egypt, Rome, Greece, Mesopotamia
- **modern_history**: 20th-21st century events, leaders, movements
- **inventions_timeline**: Major inventions, inventors, impact

#### Topic: science
- **space_exploration**: NASA missions, planets, astronauts, discoveries
- **human_body**: Anatomy, physiology, health facts
- **climate_environment**: Global warming, ecosystems, conservation
- **tech_innovations**: AI, internet, smartphones, future tech

#### Topic: geography
- **world_capitals**: Countries, capitals, flags, locations
- **natural_wonders**: Mountains, rivers, landmarks, phenomena
- **cultural_diversity**: Traditions, languages, customs worldwide
- **travel_destinations**: Famous places, tourist attractions

#### Topic: current_affairs
- **social_media_trends**: Viral content, platform features, influencers
- **global_events_2020s**: Recent news, political events, social movements
- **business_tech**: Major companies, CEOs, market trends
- **sports_highlights**: Recent Olympics, World Cup, major tournaments

### Genre: fun_trivia
#### Topic: riddles
- **logic_puzzles**: Brain teasers, mathematical riddles, lateral thinking
- **word_games**: Puns, wordplay, language puzzles
- **visual_riddles**: Pattern recognition, optical illusions
- **classic_riddles**: Traditional riddles with modern twists

#### Topic: memes
- **internet_classics**: Classic memes, origins, viral moments
- **social_media_memes**: TikTok trends, Instagram memes, Twitter jokes
- **gaming_memes**: Video game culture, streamer jokes
- **gen_z_humor**: Modern internet culture, slang, trends

#### Topic: puzzles
- **number_games**: Sudoku concepts, math puzzles, sequences
- **brain_teasers**: Logic problems, critical thinking challenges
- **trivia_mix**: Random fun facts, unusual knowledge
- **would_you_rather**: Hypothetical scenarios, preference questions

#### Topic: life_hacks
- **productivity_tips**: Study hacks, time management, efficiency
- **tech_tricks**: Smartphone tips, app shortcuts, digital life
- **daily_life**: Cooking tips, cleaning hacks, money saving
- **social_skills**: Communication tips, relationship advice

### Genre: test (for development)
#### Topic: dev
- **sample_quiz**: Simple test quiz with basic questions

## Content Guidelines

### Question Quality Standards
1. **Clear and Unambiguous**: Each question should have one obviously correct answer
2. **Age-Appropriate**: Target college students and young adults (18-25)
3. **Current and Relevant**: Use recent examples, avoid outdated references
4. **Culturally Inclusive**: Mix global and local content, avoid bias
5. **Engaging**: Make questions interesting, not just factual recall

### Answer Options
- Provide exactly 4 options per question
- Make incorrect options plausible but clearly wrong
- Avoid "All of the above" or "None of the above" unless necessary
- Mix up correct answer positions (don't always use option B)

### Difficulty Levels
- **1-2**: Easy, general knowledge most people know
- **3**: Medium, requires some specific knowledge
- **4-5**: Hard, for enthusiasts or detailed knowledge

### Time Settings
- **Easy questions**: 10-12 seconds
- **Medium questions**: 15 seconds  
- **Hard questions**: 18-20 seconds
- **Cooldown**: Always 5 seconds (time to read question)

### Image URLs
- Use high-quality, relevant images from Unsplash
- Format: `https://images.unsplash.com/photo-[ID]?w=500&auto=format`
- Images should enhance the question, not be required to answer
- Include images for ~60% of questions, especially visual topics

### Quiz Naming Convention
- Use lowercase with underscores: `hollywood_blockbusters`
- Be descriptive but concise
- Avoid special characters or spaces

## Example Output Structure
For bulk generation (RECOMMENDED), provide multiple quiz objects in an array:

```json
[
  {
    "genre": "entertainment",
    "topic": "movies", 
    "quizName": "hollywood_blockbusters",
    "difficulty": 3,
    "pointsMultiplier": 1.0,
    "questions": [...]
  },
  {
    "genre": "entertainment",
    "topic": "music",
    "quizName": "pop_hits_2020s", 
    "difficulty": 2,
    "pointsMultiplier": 1.0,
    "questions": [...]
  }
]
```

## Quality Checklist
Before submitting each quiz, verify:
- [ ] JSON format is valid
- [ ] All required fields are present
- [ ] Questions are engaging and clear
- [ ] Answer options are balanced
- [ ] Solution indices are correct (0-3)
- [ ] Time limits are appropriate
- [ ] Images enhance the content
- [ ] Difficulty progression is logical
- [ ] Content is appropriate for target audience

## Priority Order
1. **Entertainment/Movies**: Start with popular, recognizable content
2. **Knowledge/Science**: Focus on fascinating, accessible science facts
3. **Fun_Trivia/Memes**: Use current, widely-known internet culture
4. **Entertainment/Music**: Mix popular and classic music knowledge

Generate comprehensive, engaging quizzes that will make players excited to learn and compete!