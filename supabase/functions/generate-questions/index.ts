import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Allowed topics per age group
const ALLOWED_TOPICS: Record<string, string[]> = {
  G1: [
    'colors',
    'shapes',
    'animals',
    'numbers',
    'body_parts',
    'family',
    'toys',
  ],
  G2: [
    'animals',
    'numbers',
    'alphabet',
    'foods',
    'colors',
    'family',
    'nature',
  ],
  G3: [
    'math',
    'reading',
    'science',
    'geography',
    'history',
    'nature',
    'animals',
  ],
  G4: [
    'math',
    'science',
    'geography',
    'history',
    'reading',
    'technology',
    'sports',
  ],
  G5: [
    'science',
    'history',
    'geography',
    'literature',
    'math',
    'technology',
    'social_studies',
  ],
};

// Difficulty levels per age group
const DIFFICULTY_LEVELS: Record<string, string> = {
  G1: 'very_easy',
  G2: 'easy',
  G3: 'easy_medium',
  G4: 'medium',
  G5: 'hard',
};

interface GenerateQuestionsRequest {
  age_group: string;
  count?: number;
  topic?: string;
}

async function generateQuestionsWithGemini(
  ageGroup: string,
  count: number = 5,
  topic?: string
) {
  const difficulty = DIFFICULTY_LEVELS[ageGroup] || "medium";
  const allowedTopics = ALLOWED_TOPICS[ageGroup] || ["general"];
  const selectedTopic = topic && allowedTopics.includes(topic) ? topic : allowedTopics[0];

  const prompt = `
Generate exactly ${count} educational multiple-choice questions in Turkish for age group ${ageGroup} (ages 0-15).

Topic: ${selectedTopic}
Difficulty: ${difficulty}
Language: Turkish (Türkçe)

Requirements:
1. Return ONLY a valid JSON array with no additional text
2. Each question must have exactly 4 options
3. Include one correct answer (correct_index: 0-3)
4. Questions must be age-appropriate and educational
5. No harmful, inappropriate, or unethical content
6. Use simple Turkish for younger children
7. Make questions engaging and fun

Response format (ONLY JSON, no markdown):
[
  {
    "text": "Soru metni?",
    "options": ["Seçenek 1", "Seçenek 2", "Seçenek 3", "Seçenek 4"],
    "correct_index": 1,
    "topic": "${selectedTopic}"
  }
]

Generate the questions now:
`;

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiApiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.candidates[0].content.parts[0].text;

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = content.trim();
  if (jsonStr.startsWith("```json")) {
    jsonStr = jsonStr.slice(7); // Remove ```json
  } else if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.slice(3); // Remove ```
  }
  if (jsonStr.endsWith("```")) {
    jsonStr = jsonStr.slice(0, -3); // Remove ```
  }
  jsonStr = jsonStr.trim();

  const questions = JSON.parse(jsonStr);
  return questions;
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: GenerateQuestionsRequest = await req.json();
    const { age_group, count = 5, topic } = body;

    // Validate age group
    if (!['G1', 'G2', 'G3', 'G4', 'G5'].includes(age_group)) {
      return new Response(JSON.stringify({ error: 'Invalid age group' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate questions
    const questions = await generateQuestionsWithGemini(
      age_group,
      Math.min(count, 10), // Max 10 per request
      topic
    );

    // Cache questions in database
    for (const question of questions) {
      await supabase.from('ai_questions_cache').insert({
        age_group,
        question,
        used_count: 0,
      });
    }

    return new Response(JSON.stringify({ success: true, questions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
