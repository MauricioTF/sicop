import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from '../models/user.model';
import { doc, getDoc, getFirestore } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsService = inject(UtilsService);

  getAuth() {
    return getAuth();
  }

  signIn(user: User) {
    return signInWithEmailAndPassword(this.getAuth(), user.email, user.password);
  }

  //para obtener los datos del usuario que se loguea
  async getDocument(path: string) {
    const docRef = doc(getFirestore(), path);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('No such document!');
    }
  }

  //para cerrar sesion
  signOut(){
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsService.routerlink('/auth');
  }
}
