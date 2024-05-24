import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from '../models/user.model';
import { doc, getDoc, getFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);

  getAuth() {
    return getAuth();
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(this.getAuth(), user.email, user.password);
  }

  async getDocument(path: string) {
    const docRef = doc(getFirestore(), path);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('No such document!');
    }
  }
}
