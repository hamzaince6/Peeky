import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgeGroup, normalizeAgeGroup } from './ageGroups';

export interface LocalUserProfile {
  id: string;
  created_at: string;
  age_group: string;
  nickname: string;
  age?: number;
  parent_email?: string;
  preferred_categories?: string[];
  device_id?: string;
}

interface AuthContextType {
  user: null; // Supabase tamamen kaldırıldı, sadece local profil var
  profile: LocalUserProfile | null;
  isLoading: boolean;
  ageGroup: AgeGroup | null;
  isOnboarded: boolean;
  deviceId: string | null;
  initializeSession: () => Promise<void>;
  selectAgeGroup: (ageGroup: AgeGroup, nickname: string, categories?: string[]) => Promise<void>;
  updateAgeGroup: (ageGroup: AgeGroup) => Promise<void>;
  updatePreferredCategories: (categories: string[]) => Promise<void>;
  updateParentEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEVICE_ID_STORAGE_KEY = 'peeky_device_id';
const PROFILE_STORAGE_KEY = 'peeky_profile';

// Basit bir cihaz kimliği üretici (UUID benzeri)
const generateDeviceId = () => {
  const random = () =>
    Math.random().toString(36).substring(2, 10);
  return `device_${random()}${random()}`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user] = useState<null>(null);
  const [profile, setProfile] = useState<LocalUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  const persistProfile = async (nextProfile: LocalUserProfile) => {
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setIsOnboarded(true);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Cihaz kimliğini yükle / oluştur
        let storedId = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
        if (!storedId) {
          const newId = generateDeviceId();
          await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, newId);
          storedId = newId;
        }
        setDeviceId(storedId);
      } catch (error) {
        console.warn('Failed to initialize device id', error);
      } finally {
        // DeviceId denemesi bittikten sonra oturumu başlat
        initializeSession();
      }
    };

    bootstrap();
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);

      // Cihaz kimliğine göre daha önce kaydedilmiş local profili yüklemeyi dene
      const storedProfileJson = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (storedProfileJson) {
        try {
          const storedProfile: LocalUserProfile = JSON.parse(storedProfileJson);
          setProfile(storedProfile);
          setIsOnboarded(true);
          return;
        } catch (error) {
          console.warn('Stored profile parse error, clearing invalid data', error);
          await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
        }
      }

      // Profil yoksa kullanıcı onboarding akışına gidecek
      setIsOnboarded(false);
    } catch (error) {
      console.error('Session initialization error:', error);
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const selectAgeGroup = async (ageGroup: AgeGroup, nickname: string, categories?: string[]) => {
    try {
      const profileToSave: LocalUserProfile = {
        id: deviceId || 'local-user',
        created_at: new Date().toISOString(),
        age_group: ageGroup,
        nickname: nickname,
        device_id: deviceId || undefined,
        preferred_categories: categories || [],
      };

      await persistProfile(profileToSave);
    } catch (error) {
      console.error('Select age group error:', error);
      // Hata olsa bile kullanıcı akışı devam etsin
      setIsOnboarded(true);
    }
  };

  const updateAgeGroup = async (ageGroup: AgeGroup) => {
    if (!profile) return;
    try {
      const updatedProfile: LocalUserProfile = {
        ...profile,
        age_group: ageGroup,
      };
      await persistProfile(updatedProfile);
    } catch (error) {
      console.error('Update age group error:', error);
      throw error;
    }
  };

  const updatePreferredCategories = async (categories: string[]) => {
    if (!profile) return;
    try {
      const updatedProfile: LocalUserProfile = {
        ...profile,
        preferred_categories: categories,
      };
      await persistProfile(updatedProfile);
    } catch (error) {
      console.error('Update preferred categories error:', error);
      throw error;
    }
  };

  const updateParentEmail = async (email: string) => {
    try {
      if (!profile) return;

      const updatedProfile: LocalUserProfile = {
        ...profile,
        parent_email: email,
      };

      await persistProfile(updatedProfile);
    } catch (error) {
      console.error('Update parent email error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      setProfile(null);
      setIsOnboarded(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    ageGroup: profile?.age_group ? normalizeAgeGroup(profile.age_group) : null,
    isOnboarded,
    deviceId,
    initializeSession,
    selectAgeGroup,
    updateAgeGroup,
    updatePreferredCategories,
    updateParentEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
