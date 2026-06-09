import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export class AuthService {
  async signInWithEmail(email: string, password: string) {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  }

  async signUpWithEmail(email: string, password: string, displayName: string) {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    await userCredential.user?.updateProfile({ displayName });

    await firestore()
      .collection('users')
      .doc(userCredential.user?.uid)
      .set({
        email,
        displayName,
        createdAt: firestore.FieldValue.serverTimestamp(),
        subscriptionStatus: 'free',
      });

    return userCredential.user;
  }

  async signOut() {
    await auth().signOut();
  }

  getCurrentUser() {
    return auth().currentUser;
  }

  onAuthStateChanged(callback: (user: any) => void) {
    return auth().onAuthStateChanged(callback);
  }
}