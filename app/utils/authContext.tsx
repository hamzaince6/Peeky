import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, userService, UserProfile } from '../services/supabaseService';
import { AgeGroup } from '../utils/ageGroups';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  ageGroup: AgeGroup | null;
  isOnboarded: boolean;
  deviceId: string | null;
  initializeSession: () => Promise<void>;
  selectAgeGroup: (ageGroup: AgeGroup, nickname: string, categories?: string[]) => Promise<void>;
  updateParentEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEVICE_ID_STORAGE_KEY = 'peeky_device_id';

// Basit bir cihaz kimliği üretici (UUID benzeri)
const generateDeviceId = () => {
  const random = () =>
    Math.random().toString(36).substring(2, 10);
  return `device_${random()}${random()}`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);

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
      
      // First, try to load profile by device_id if available
      if (deviceId) {
        try {
          const deviceProfile = await userService.getProfileByDeviceId(deviceId);
          if (deviceProfile) {
            setProfile(deviceProfile);
            setIsOnboarded(true);
            setIsLoading(false);
            return; // Device profile found, we're done
          }
        } catch (error) {
          console.warn('Failed to load profile by device ID:', error);
        }
      }

      // Check if user already exists (Supabase auth)
      const currentUser = await authService.getCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        // Try to fetch profile
        try {
          const userProfile = await userService.getProfile(currentUser.id);
          setProfile(userProfile);
          setIsOnboarded(true);
        } catch (error) {
          // Profile doesn't exist yet - user needs to select age group
          setIsOnboarded(false);
        }
      } else {
        // No session exists, try to create anonymous session
        // If anonymous sign-in is disabled, continue without user
        try {
          const { user: anonUser } = await authService.signUpAnonymous();
          setUser(anonUser);
          setIsOnboarded(false);
        } catch (error: any) {
          // Anonymous sign-in disabled or other error - continue without user
          console.warn('Anonymous sign-in not available:', error?.message || 'Unknown error');
          // App can work without authentication for demo/testing
          setUser(null);
          setIsOnboarded(false);
        }
      }
    } catch (error) {
      console.error('Session initialization error:', error);
      // Don't block app - allow user to continue
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const selectAgeGroup = async (ageGroup: AgeGroup, nickname: string, categories?: string[]) => {
    try {
      let savedProfile: UserProfile | null = null;

      // If user exists, create profile in database with device_id
      if (user && deviceId) {
        try {
          const userProfile = await userService.createProfile(
            user.id,
            ageGroup,
            nickname,
            deviceId,
            categories,
          );
          savedProfile = userProfile;
        } catch (error) {
          console.warn('Failed to create profile in database:', error);
        }
      }

      // If no user but deviceId exists, create profile by device_id
      if (!savedProfile && deviceId) {
        try {
          const deviceProfile = await userService.createProfileByDeviceId(
            deviceId,
            ageGroup,
            nickname,
            categories,
          );
          savedProfile = deviceProfile;
        } catch (error) {
          console.warn('Failed to create profile by device ID:', error);
        }
      }

      // Set profile (from database or local)
      if (savedProfile) {
        setProfile(savedProfile);
      } else {
        // Fallback to local profile
        setProfile({
          id: user?.id || deviceId || 'local-user',
          created_at: new Date().toISOString(),
          age_group: ageGroup,
          nickname: nickname,
          device_id: deviceId || undefined,
          preferred_categories: categories,
        } as UserProfile);
      }
      
      setIsOnboarded(true);
    } catch (error) {
      console.error('Select age group error:', error);
      // Don't throw - allow user to continue
      setIsOnboarded(true);
    }
  };

  const updateParentEmail = async (email: string) => {
    try {
      if (!user) throw new Error('No user session');

      // Update parent email in profile
      const updatedProfile = await userService.getProfile(user.id);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Update parent email error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
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
    ageGroup: (profile?.age_group as AgeGroup) || null,
    isOnboarded,
    deviceId,
    initializeSession,
    selectAgeGroup,
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
