import { useState } from 'react';
import { signInWithPopup, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { toast } from 'react-hot-toast';

export const useFirebaseAuth = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);



  const sendToBackend = async (idToken: string, name: string, email: string) => {
    try {
      console.log('Sending data to backend...');
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          name,
          email,
        }),
      });

      const responseText = await response.text();
      console.log('Backend response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('Backend error:', data);
        throw new Error(data.error || `Backend error: ${response.status}`);
      }

      // Store JWT token in localStorage
      localStorage.setItem('token', data.token);

      toast.success(`Welcome, ${data.user.name}!`);

      return data;
    } catch (error: any) {
      console.error('Backend communication failed:', error);
      toast.error(error.message || 'Backend authentication failed');
      throw error;
    }
  };

  const signInWithGoogleAndBackend = async () => {
    setLoading(true);
    try {
      // Step 1: Firebase authentication
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Get the ID token with force refresh to ensure it's valid
      const idToken = await user.getIdToken(true);

      console.log('Firebase Auth Hook - Sign-in successful');
      console.log('User from hook:', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified
      });

      setUser(user);

      // Step 2: Send to backend for JWT token
      const backendData = await sendToBackend(
        idToken,
        user.displayName || user.email?.split('@')[0] || 'User',
        user.email!
      );

      return {
        user,
        idToken,
        result,
        backendData,
        jwtToken: backendData.token
      };
    } catch (error: any) {
      console.error('Google sign-in with backend failed:', error);
      if (error.code) {
        // Firebase error
        toast.error(error.message || 'Failed to sign in with Google');
      }
      // Backend errors are already handled in sendToBackend
      throw error;
    } finally {
      setLoading(false);
    }
  };

  
  return {
    user,
    loading,
    signInWithGoogleAndBackend,
    sendToBackend,
  };
};