import { createClient } from '@supabase/supabase-js';

// Get environment variables from .env.local file
// NOTE (Expo): Only environment variables prefixed with EXPO_PUBLIC_ are
// available in the JS runtime bundle. Keep backward-compat fallbacks for
// non-Expo environments and older setups.
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env.local (or .env) file.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface UserProfile {
  id: string;
  created_at: string;
  age_group: string;
  nickname: string;
  age?: number;
  parent_email?: string;
  profile_image_url?: string;
  device_id?: string;
  preferred_categories?: string[];
}

export interface GameSession {
  id: string;
  user_id: string;
  game_type: string;
  age_group: string;
  score: number;
  duration: number;
  correct_count: number;
  total_count: number;
  created_at: string;
}

export interface AIQuestion {
  id: string;
  age_group: string;
  question: {
    text: string;
    options: string[];
    correct_index: number;
    image_url?: string;
    topic?: string;
  };
  created_at: string;
  used_count: number;
}

export interface Drawing {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
}

// Authentication functions
export const authService = {
  async signUpAnonymous() {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Anonymous signup error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        // Session yoksa null döndür, hata fırlatma
        if (error.message?.includes('session') || error.message?.includes('missing')) {
          return null;
        }
        throw error;
      }
      return data.user;
    } catch (error: any) {
      // Auth session missing hatası normal, null döndür
      if (error?.message?.includes('session') || error?.message?.includes('missing')) {
        return null;
      }
      console.error('Get current user error:', error);
      return null; // Diğer hatalarda da null döndür, crash etmesin
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  async updateProfile(userId: string, profile: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(profile)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
};

// User profile functions
export const userService = {
  async createProfile(userId: string, ageGroup: string, nickname: string, deviceId?: string, categories?: string[]) {
    try {
      // Önce device_id ile var mı kontrol et (eğer deviceId varsa)
      if (deviceId) {
        const existing = await this.getProfileByDeviceId(deviceId);
        if (existing) {
          // Varsa güncelle
          const { data, error } = await supabase
            .from('users')
            .update({
              id: userId, // Update user id if changed
              age_group: ageGroup,
              nickname: nickname,
              preferred_categories: categories || [],
              updated_at: new Date().toISOString(),
            })
            .eq('device_id', deviceId)
            .select()
            .single();
          if (error) throw error;
          return data;
        }
      }

      // Yoksa yeni kayıt oluştur
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            age_group: ageGroup,
            nickname: nickname,
            device_id: deviceId,
            preferred_categories: categories || [],
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create profile error:', error);
      throw error;
    }
  },

  async createProfileByDeviceId(deviceId: string, ageGroup: string, nickname: string, categories?: string[]) {
    try {
      // Önce device_id ile var mı kontrol et
      const existing = await this.getProfileByDeviceId(deviceId);
      if (existing) {
        // Varsa güncelle
        const { data, error } = await supabase
          .from('users')
          .update({
            age_group: ageGroup,
            nickname: nickname,
            preferred_categories: categories || [],
            updated_at: new Date().toISOString(),
          })
          .eq('device_id', deviceId)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      // Yoksa yeni kayıt oluştur (id null, sadece device_id ile)
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: null, // Device-only user, no auth.users reference
            age_group: ageGroup,
            nickname: nickname,
            device_id: deviceId,
            preferred_categories: categories || [],
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create profile by device ID error:', error);
      throw error;
    }
  },

  async getProfileByDeviceId(deviceId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('device_id', deviceId)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data || null;
    } catch (error) {
      console.error('Get profile by device ID error:', error);
      return null;
    }
  },

  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async updateAgeGroup(userId: string, ageGroup: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ age_group: ageGroup })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update age group error:', error);
      throw error;
    }
  },
};

// Game session functions
export const gameService = {
  async createGameSession(
    userId: string,
    gameType: string,
    ageGroup: string,
  ) {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([
          {
            user_id: userId,
            game_type: gameType,
            age_group: ageGroup,
            score: 0,
            duration: 0,
            correct_count: 0,
            total_count: 0,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create game session error:', error);
      throw error;
    }
  },

  async updateGameSession(
    sessionId: string,
    updates: Partial<GameSession>,
  ) {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update game session error:', error);
      throw error;
    }
  },

  async getUserSessions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user sessions error:', error);
      throw error;
    }
  },
};

export default supabase;
