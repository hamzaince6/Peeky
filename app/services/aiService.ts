import Constants from 'expo-constants';
import { supabase } from './supabaseService';

export interface GenerateQuestionsRequest {
  age_group: string;
  count?: number;
  topic?: string;
  category?: string; // Turkish category ID (matematik, fen, etc.)
  categories?: string[]; // Multiple categories for mixed questions
}

export interface Question {
  text: string;
  options: string[];
  correct_index: number;
  topic?: string;
}

export interface GenerateQuestionsResponse {
  success: boolean;
  questions: Question[];
  error?: string;
}

// Get Supabase URL and anon key for manual requests
const getSupabaseConfig = () => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return { url, anonKey };
};

export const aiService = {
  /**
   * Generate dynamic questions using Gemini AI via Supabase Edge Function
   */
  async generateQuestions(
    request: GenerateQuestionsRequest
  ): Promise<Question[]> {
    try {
      // Try using Supabase client first (works better on native)
      try {
        const { data, error } = await supabase.functions.invoke(
          'generate-questions',
          {
            body: request,
          }
        );

        if (error) {
          throw error;
        }

        if (!data || !data.success) {
          throw new Error(data?.error || 'Failed to generate questions');
        }

        return data.questions || [];
      } catch (clientError) {
        // Fallback to manual fetch for web compatibility
        console.log('Supabase client invoke failed, trying manual fetch...', clientError);
        
        const { url, anonKey } = getSupabaseConfig();
        if (!url || !anonKey) {
          throw new Error('Supabase configuration missing');
        }

        const response = await fetch(`${url}/functions/v1/generate-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to generate questions');
        }

        return data.questions || [];
      }
    } catch (error) {
      console.error('Generate questions error:', error);
      throw error;
    }
  },

  /**
   * Get cached questions for an age group, optionally filtered by category
   */
  async getCachedQuestions(
    ageGroup: string,
    limit: number = 5,
    category?: string
  ) {
    try {
      let query = supabase
        .from('ai_questions_cache')
        .select('question')
        .eq('age_group', ageGroup);

      // Filter by category if provided (check topic field in question JSON)
      if (category) {
        // Note: This is a simple filter. For better performance, consider adding a category column
        // For now, we'll get all questions and filter client-side
      }

      const { data, error } = await query
        .order('used_count', { ascending: true })
        .limit(limit * 2); // Get more to filter by category

      if (error) throw error;

      let questions = data?.map((item) => item.question) || [];

      // Filter by category if provided
      if (category && questions.length > 0) {
        const categoryMap: Record<string, string> = {
          'matematik': 'math',
          'fen': 'science',
          'turkce': 'reading',
          'tarih': 'history',
          'cografya': 'geography',
          'genel-kultur': 'general_knowledge',
        };
        const topicFilter = categoryMap[category];
        if (topicFilter) {
          questions = questions.filter(
            (q: any) => q.topic === topicFilter || q.topic === category
          );
        }
      }

      return questions.slice(0, limit);
    } catch (error) {
      console.error('Get cached questions error:', error);
      throw error;
    }
  },

  /**
   * Mark questions as used to track usage
   */
  async markQuestionsAsUsed(questionIds: string[]) {
    try {
      const { error } = await supabase
        .from('ai_questions_cache')
        .update({ used_count: supabase.rpc('increment_used_count') })
        .in('id', questionIds);

      if (error) throw error;
    } catch (error) {
      console.error('Mark questions as used error:', error);
      // Don't throw - this is not critical
    }
  },

  /**
   * Fetch questions with fallback strategy:
   * 1. Try to get cached questions first
   * 2. If not enough, generate new ones with AI
   * Supports category filtering
   */
  async getQuestionsWithFallback(
    ageGroup: string,
    count: number = 5,
    category?: string,
    categories?: string[]
  ): Promise<Question[]> {
    try {
      // If multiple categories, mix questions from each
      if (categories && categories.length > 0) {
        const questionsPerCategory = Math.ceil(count / categories.length);
        const allQuestions: Question[] = [];

        for (const cat of categories) {
          const catQuestions = await this.getQuestionsWithFallback(
            ageGroup,
            questionsPerCategory,
            cat
          );
          allQuestions.push(...catQuestions);
        }

        // Shuffle and return requested count
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
      }

      // Single category or no category
      // Try cached first
      const cached = await this.getCachedQuestions(ageGroup, count, category);

      if (cached.length >= count) {
        return cached.slice(0, count);
      }

      // Generate new ones if not enough cached
      const needed = count - cached.length;
      const generated = await this.generateQuestions({
        age_group: ageGroup,
        count: needed,
        category,
      });

      return [...cached, ...generated].slice(0, count);
    } catch (error) {
      console.error('Get questions with fallback error:', error);
      // Return empty array on error - UI should handle gracefully
      return [];
    }
  },
};

export default aiService;
