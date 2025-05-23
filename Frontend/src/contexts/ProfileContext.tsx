import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { UserProfile, getUserProfile } from '../lib/api';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: true,
  error: null,
  refreshProfile: async () => {},
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userProfile = await getUserProfile(user.id);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load your investment profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
