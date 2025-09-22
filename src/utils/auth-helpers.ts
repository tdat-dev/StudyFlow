import { auth } from '../services/firebase/config';

/**
 * Get current user's access token
 * Used to bridge AuthContext with components that still need accessToken
 */
export const getCurrentAccessToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }

    const token = await currentUser.getIdToken(true); // Force refresh
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Convert UserProfile from AuthContext to User type for components
 */
export const convertUserProfile = (userProfile: any): any => {
  if (!userProfile) return null;

  return {
    uid: userProfile.uid,
    name: userProfile.name,
    email: userProfile.email,
    accessToken: '', // Will be populated by components as needed
    photoURL: userProfile.photoURL,
  };
};
