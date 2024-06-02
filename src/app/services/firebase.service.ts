// Importación de módulos y servicios necesarios
import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from '../models/user.model';
import { Incidencia } from '../models/incidencia.model';
import { addDoc, collection, doc, getDoc, getFirestore } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import {getDownloadURL, getStorage, ref, uploadString} from 'firebase/storage'
import { Observable } from 'rxjs';
import { Rol } from '../models/rol.model';

// Decorador Injectable que indica que este servicio puede ser inyectado en otros componentes y servicios
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  // Inyección de servicios y definición de variables
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsService = inject(UtilsService);
  dataRef : AngularFirestoreCollection<Incidencia>; // Referencia a la colección de incidencias en Firestore
  dataRefRol : AngularFirestoreCollection<Rol>; // Referencia a la colección de roles en Firestore

  // Método para obtener la instancia de autenticación de Firebase
  getAuth() {
    return getAuth();
  }

  // Método para iniciar sesión con correo electrónico y contraseña
  signIn(user: User) {
    return signInWithEmailAndPassword(this.getAuth(), user.email, user.password);
  }

  // Método para obtener el usuario actual
  getCurrentUser() {
    return this.auth.authState; // Retorna un observable con el estado de autenticación del usuario actual
  }

  // Método para obtener un documento de Firestore
  async getDocument(path: string) {
    const docRef = doc(getFirestore(), path);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('No such document!');
    }
  }

  // Método para cerrar sesión
  signOut(){
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsService.routerlink('/auth');
  }

  // Método para agregar un documento a Firestore
  addDocument(path: any, data: any){
    return addDoc(collection(getFirestore(), path), data);
  }

  // Método para actualizar una imagen en Firebase Storage
  async updateImg(path: any, data_url: any){
    return uploadString(ref(getStorage(), path), data_url, 'data_url')
    .then(() => {
      return getDownloadURL(ref(getStorage(), path))
    })
  }

  // Método para obtener los datos de una colección de Firestore
  getCollectionData(path: any): AngularFirestoreCollection<Incidencia>{
    this.dataRef = this.firestore.collection(path, ref => ref.orderBy('ct_titulo', 'desc'))
    return this.dataRef;
  }

  getCollectionDataRol(path: any): AngularFirestoreCollection<Rol>{
    this.dataRefRol = this.firestore.collection(path, ref => ref.orderBy('cn_id_rol', 'desc'))
    return this.dataRefRol;
  }

  // Método para obtener datos de la tabla rol_usuario
  getRolUsuario(): Observable<any[]> {
    return this.firestore.collection('t_rol_usuario').valueChanges();
  }

  // Método para obtener datos de la tabla rol
  getRol(): Observable<any[]> {
    return this.firestore.collection('t_roles').valueChanges();
  }

  // Método para obtener datos de la tabla usuarios (para obtener los tecnicos)
  getTecnicos(): Observable<any[]> {
    return this.firestore.collection('t_usuarios').valueChanges();
  }
}