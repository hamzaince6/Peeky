// Local question service backed by static JSON data
// ve opsiyonel olarak Gemini API üzerinden dinamik üretim.

// KEEP:
// - Questions are loaded from the local `datas/questions.json` file.
// - You can freely edit that JSON to change/add questions without touching the code.
// - Ek olarak, `generateQuestionsWithGemini` fonksiyonu ile client-side Gemini isteği atılabilir.

// NOTE: Gemini çağrısı tamamen client-side yapılır.
// API anahtarı app.config.js'de extra içinde gömülü olarak tanımlıdır.

import Constants from 'expo-constants';
import { buildQuestionsPrompt } from '../../prompts/questions';

// Constants.extra'dan oku (build-time'da app.config.js'den gelir)
const GEMINI_API_KEY = (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_MODEL = (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';

// Keep the Question shape as-is so existing screens keep working.
export interface Question {
  text: string;
  options: string[];
  correct_index: number;
  topic?: string;
}

// The JSON file is expected to be shaped roughly as:
// {
//   "G1": [{ "id": "q1", "text": "...", "options": [...], "correct_index": 0, "topic": "math" }],
//   "G2": [...],
//   ...
// }
//
// NOTE: Local JSON keys are legacy (e.g. "G3") and the app may use newer ageGroup ids.
// We handle missing keys by falling back to available local data.
// Each entry under an age group should at least have: text, options, correct_index.
// `topic` is optional but recommended for category filtering.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const questionsData: Record<string, Question[]> = require('../../datas/questions.json');

const CATEGORY_TOPIC_MAP: Record<string, string> = {
  'matematik': 'math',
  'fen': 'science',
  'turkce': 'reading',
  'tarih': 'history',
  'cografya': 'geography',
  'genel-kultur': 'general_knowledge',
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pickRandom = <T,>(arr: T[], count: number): T[] => {
  if (arr.length <= count) return [...arr];
  return shuffleArray(arr).slice(0, count);
};

export const aiService = {
  /**
   * Ana giriş noktası: yaş grubuna ve isteğe bağlı kategori(ler)e göre
   * soruları Gemini API'den dinamik olarak üretir.
   *
   * - categories: birden fazla kategori id'si (matematik, fen, ...)
   * - category: tek kategori id'si
   */
  async getQuestionsWithFallback(
    ageGroup: string,
    count: number = 5,
    category?: string,
    categories?: string[]
  ): Promise<Question[]> {
    // Gemini'den soru üret
    const prompt = buildQuestionsPrompt({
      ageGroup,
      count,
      category,
      categories,
    });
    const geminiQuestions = await this.generateQuestionsWithGemini(prompt);

    if (geminiQuestions.length > 0) {
      return geminiQuestions.slice(0, count);
    }

    // Fallback: Local JSON'dan soru al
    if (categories && categories.length > 0) {
      const perCategory = Math.max(1, Math.ceil(count / categories.length));
      const all: Question[] = [];

      for (const cat of categories) {
        const subset = this.getQuestionsFromLocal(ageGroup, perCategory, cat);
        all.push(...subset);
      }

      return shuffleArray(all).slice(0, count);
    }

    return this.getQuestionsFromLocal(ageGroup, count, category);
  },

  /**
   * Local JSON'dan filtreleyerek soru seçer.
   */
  getQuestionsFromLocal(
    ageGroup: string,
    count: number,
    category?: string
  ): Question[] {
    // Local dataset may not have entries for every ageGroup id.
    // Prefer exact key, otherwise fallback to a reasonable default.
    const allForAge =
      questionsData[ageGroup] ||
      // Legacy keys / minimal dataset fallback
      questionsData['G3'] ||
      [];
    if (allForAge.length === 0) {
      console.warn(`No questions found in local data for age group: ${ageGroup}`);
      return [];
    }

    let filtered = [...allForAge];

    if (category) {
      const topicFilter = CATEGORY_TOPIC_MAP[category] || category;
      filtered = filtered.filter((q) => {
        if (!q.topic) return true; // topic tanımlı değilse genel soru kabul et
        return q.topic === topicFilter || q.topic === category;
      });
    }

    if (filtered.length === 0) {
      console.warn(
        `No questions found for age group ${ageGroup} with category ${category}. Falling back to all questions for that age group.`
      );
      filtered = allForAge;
    }

    return pickRandom(filtered, count);
  },

  /**
   * Client-side Gemini API ile soru üretimi.
   *
   * Bu fonksiyon, verilen prompt'a göre modelden JSON formatında
   * Question[] bekler ve parse etmeye çalışır.
   *
   * Örnek kullanım:
   * const qs = await aiService.generateQuestionsWithGemini(
   *   '8-10 yaş arası çocuklar için 5 adet matematik sorusu üret. ...'
   * );
   */
  async generateQuestionsWithGemini(prompt: string): Promise<Question[]> {
    if (!GEMINI_API_KEY) {
      console.warn(
        'EXPO_PUBLIC_GEMINI_API_KEY tanımlı değil, Gemini isteği atılamıyor. ' +
          'app.config.js dosyasında EXPO_PUBLIC_GEMINI_API_KEY tanımlı olmalı.'
      );
      return [];
    }

    try {
      const response = await fetch(
        // v1beta supports newer Gemini model families more consistently
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${prompt}

Lütfen sadece aşağıdaki TypeScript tipine uyan, geçerli bir JSON array döndür:

type Question = {
  text: string;
  options: string[];
  correct_index: number;
  topic?: string;
};

Yanıtın şu formatta olsun:
[
  {
    "text": "...",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "topic": "math"
  }
]`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini HTTP error:', response.status, errorText);
        return [];
      }

      const data: any = await response.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ??
        data?.candidates?.[0]?.output_text ??
        '';

      if (!text) {
        console.warn('Gemini yanıtı boş veya beklenmedik formatta:', data);
        return [];
      }

      // Model genelde JSON'u metin içinde döner; sadece JSON kısmını parse etmeyi dene.
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']');
      if (jsonStart === -1 || jsonEnd === -1) {
        console.warn('Gemini yanıtında geçerli JSON array bulunamadı:', text);
        return [];
      }

      const jsonSlice = text.slice(jsonStart, jsonEnd + 1);

      const parsed = JSON.parse(jsonSlice) as Question[];

      // Basit doğrulama
      const cleaned = parsed.filter(
        (q) =>
          typeof q.text === 'string' &&
          Array.isArray(q.options) &&
          typeof q.correct_index === 'number'
      );

      return cleaned;
    } catch (error) {
      console.error('Gemini isteğinde hata:', error);
      return [];
    }
  },
};

export default aiService;
