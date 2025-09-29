import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
    // Use gemini-2.0-flash-exp as the latest available model
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  }

  async analyzeTranscript(transcriptData, analysisType = 'comprehensive') {
    try {
      const prompt = this.buildAnalysisPrompt(transcriptData, analysisType);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let analysis = response.text();

      // Clean up markdown formatting if present
      if (analysis.includes('```json')) {
        analysis = analysis.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      }

      // Parse the JSON response
      const parsedAnalysis = JSON.parse(analysis);

      return {
        success: true,
        data: parsedAnalysis
      };

    } catch (error) {
      console.error('Gemini analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildAnalysisPrompt(transcriptData, analysisType) {
    const basePrompt = `
You are an expert audio analysis AI. Analyze the following transcript and provide insights in JSON format.

TRANSCRIPT DATA:
- Text: "${transcriptData.text}"
- Duration: ${transcriptData.audio_duration} seconds
- Confidence: ${transcriptData.confidence}
- Language: ${transcriptData.language_code}
- Speakers: ${transcriptData.speakers?.length || 0}

SPEAKER INFORMATION:
${transcriptData.speakers?.map(speaker => 
  `Speaker ${speaker.speaker_id}: ${speaker.word_count} words, ${Math.round(speaker.total_time/1000)} seconds`
).join('\n') || 'No speaker data available'}

CHAPTERS:
${transcriptData.chapters?.map(chapter => 
  `"${chapter.headline}" (${Math.round(chapter.start/1000)}s - ${Math.round(chapter.end/1000)}s)`
).join('\n') || 'No chapters detected'}

ENTITIES DETECTED:
${transcriptData.entities?.map(entity => 
  `${entity.entity_type}: "${entity.text}"`
).join('\n') || 'No entities detected'}

Please provide a comprehensive analysis in the following JSON structure:
`;

    const comprehensiveStructure = `
{
  "summary": {
    "overview": "Brief overview of the audio content",
    "key_points": ["Point 1", "Point 2", "Point 3"],
    "main_topics": ["Topic 1", "Topic 2"],
    "audio_type": "meeting|interview|presentation|conversation|other"
  },
  "speaker_analysis": {
    "dominant_speaker": "Speaker ID who spoke the most",
    "speaking_distribution": [
      {
        "speaker_id": "A",
        "percentage": 60,
        "talk_time_seconds": 120,
        "engagement_level": "high|medium|low"
      }
    ],
    "interaction_style": "collaborative|competitive|formal|casual"
  },
  "content_insights": {
    "sentiment_overview": "positive|negative|neutral|mixed",
    "emotional_tone": "professional|casual|tense|friendly",
    "key_decisions": ["Decision 1", "Decision 2"],
    "action_items": [
      {
        "task": "Task description",
        "assignee": "Person responsible (if mentioned)",
        "priority": "high|medium|low",
        "due_date": "deadline if mentioned"
      }
    ],
    "questions_raised": ["Question 1", "Question 2"]
  },
  "topics_and_themes": {
    "primary_themes": ["Theme 1", "Theme 2"],
    "technical_terms": ["Term 1", "Term 2"],
    "mentioned_entities": {
      "people": ["Name 1", "Name 2"],
      "organizations": ["Org 1", "Org 2"],
      "locations": ["Location 1"],
      "dates": ["Date 1"]
    }
  },
  "quality_metrics": {
    "audio_clarity": "excellent|good|fair|poor",
    "transcription_confidence": ${transcriptData.confidence || 0},
    "speaker_separation_quality": "clear|moderate|difficult",
    "background_noise": "minimal|moderate|significant"
  },
  "recommendations": {
    "follow_up_actions": ["Action 1", "Action 2"],
    "improvement_suggestions": ["Suggestion 1", "Suggestion 2"],
    "next_steps": ["Step 1", "Step 2"]
  }
}`;

    const meetingStructure = `
{
  "meeting_summary": {
    "meeting_type": "standup|review|planning|interview|other",
    "duration_minutes": ${Math.round((transcriptData.audio_duration || 0) / 60)},
    "attendee_count": ${transcriptData.speakers?.length || 0},
    "key_outcomes": ["Outcome 1", "Outcome 2"]
  },
  "agenda_analysis": {
    "topics_covered": ["Topic 1", "Topic 2"],
    "time_allocation": [
      {
        "topic": "Topic 1",
        "duration_seconds": 120,
        "speakers_involved": ["A", "B"]
      }
    ]
  },
  "action_items": [
    {
      "task": "Task description",
      "assignee": "Speaker A",
      "due_date": "mentioned deadline or null",
      "priority": "high|medium|low"
    }
  ],
  "decisions_made": [
    {
      "decision": "Decision description",
      "rationale": "Reasoning provided",
      "stakeholders": ["Speaker A", "Speaker B"]
    }
  ]
}`;

    const structure = analysisType === 'meeting' ? meetingStructure : comprehensiveStructure;
    
    return basePrompt + structure + `

IMPORTANT: 
- Return ONLY valid JSON, no additional text or formatting
- Use actual data from the transcript to populate fields
- If information is not available, use null or empty arrays
- Be concise but informative
- Focus on actionable insights`;
  }

  async generateSummary(transcriptData, summaryType = 'executive') {
    try {
      const prompt = this.buildSummaryPrompt(transcriptData, summaryType);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return {
        success: true,
        data: {
          type: summaryType,
          content: summary,
          generated_at: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Gemini summary error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  buildSummaryPrompt(transcriptData, summaryType) {
    const baseContext = `
TRANSCRIPT: "${transcriptData.text}"
DURATION: ${Math.round((transcriptData.audio_duration || 0) / 60)} minutes
SPEAKERS: ${transcriptData.speakers?.length || 0}
`;

    const prompts = {
      executive: `${baseContext}
Create a concise executive summary (2-3 paragraphs) highlighting:
- Main purpose and outcomes
- Key decisions or conclusions
- Important action items
Keep it professional and actionable.`,

      detailed: `${baseContext}
Create a detailed summary including:
- Complete overview of discussion
- Speaker contributions and perspectives
- All decisions and action items
- Timeline of topics covered
- Next steps and follow-ups`,

      bullet_points: `${baseContext}
Create a bullet-point summary with:
• Main topics discussed
• Key decisions made
• Action items assigned
• Important quotes or insights
• Next meeting/follow-up plans`
    };

    return prompts[summaryType] || prompts.executive;
  }
}
