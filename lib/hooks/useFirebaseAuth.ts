import { useState } from 'react';
import { signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { toast } from 'react-hot-toast';

export const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      console.log('Starting Firebase Google sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Get the ID token
      const idToken = await user.getIdToken();
      
      console.log('Firebase Auth Hook - Sign-in successful');
      console.log('User from hook:', user);
      console.log('ID Token from hook:', idToken);
      
      setUser(user);
      toast.success(`Welcome, ${user.displayName}!`);
      
      return { user, idToken, result };
    } catch (error: any) {
      console.error('Firebase sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Firebase sign-out error:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOutUser,
  };
};