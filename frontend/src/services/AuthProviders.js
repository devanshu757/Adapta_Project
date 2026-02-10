import { GoogleAuthProvider, OAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './FirebaseCore';

export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const signInWithMicrosoft = () => {
  const provider = new OAuthProvider('microsoft.com');
  return signInWithPopup(auth, provider);
};
