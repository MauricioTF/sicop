import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from '../models/user.model';
import { addDoc, collection, doc, getDoc, getFirestore } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import {getDownloadURL, getStorage, ref, uploadString} from 'firebase/storage'

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

  //observable de usuario actual
  getCurrentUser() {
    return this.auth.authState; // Retorna un observable con el usuario actual
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

  //para almacenar incidencte en la bd
  addDocument(path: any, data: any){//va a ir enlazado al usuario que crea la incidencia

    return addDoc(collection(getFirestore(), path), data);//add uarda los datos
  }

  async updateImg(path: any, data_url: any){
    return uploadString(ref(getStorage(), path), data_url, 'data_url')
    .then(() => {
      return getDownloadURL(ref(getStorage(), path))
    })
  }
}
