import Constants from 'expo-constants';
import { supabase } from './supabaseService';

export interface GenerateQuestionsRequest {
  age_group: string;
  count?: number;
  topic?: string;
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

export const aiService = {
  /**
   * Generate dynamic questions using Gemini AI via Supabase Edge Function
   */
  async generateQuestions(
    request: GenerateQuestionsRequest
  ): Promise<Question[]> {
    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-questions',
        {
          body: request,
        }
      );

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      return data.questions || [];
    } catch (error) {
      console.error('Generate questions error:', error);
      throw error;
    }
  },

  /**
   * Get cached questions for an age group
   */
  async getCachedQuestions(ageGroup: string, limit: number = 5) {
    try {
      const { data, error } = await supabase
        .from('ai_questions_cache')
        .select('question')
        .eq('age_group', ageGroup)
        .order('used_count', { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data?.map((item) => item.question) || [];
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
   */
  async getQuestionsWithFallback(
    ageGroup: string,
    count: number = 5,
    topic?: string
  ): Promise<Question[]> {
    try {
      // Try cached first
      const cached = await this.getCachedQuestions(ageGroup, count);

      if (cached.length >= count) {
        return cached.slice(0, count);
      }

      // Generate new ones if not enough cached
      const needed = count - cached.length;
      const generated = await this.generateQuestions({
        age_group: ageGroup,
        count: needed,
        topic,
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
