// Importación de módulos y servicios necesarios
import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from '../models/user.model';
import { Incidencia } from '../models/incidencia.model';
import {
  CollectionReference,
  DocumentData,
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol.model';
import { Diagnostico } from '../models/diagnostico.model';
import { Asignaciones } from '../models/asignaciones.model';
import { HttpClient } from '@angular/common/http';

// Decorador Injectable que indica que este servicio puede ser inyectado en otros componentes y servicios
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  // Inyección de servicios y definición de variables
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsService = inject(UtilsService);
  http = inject(HttpClient);

  dataRef: AngularFirestoreCollection<Incidencia>; // Referencia a la colección de incidencias en Firestore
  dataRefRol: AngularFirestoreCollection<Rol>; // Referencia a la colección de roles en Firestore
  dataRefDiag: AngularFirestoreCollection<Diagnostico>;
  dataIncidenciasAsignadas: AngularFirestoreCollection<Asignaciones>;
  dataUsuarios: AngularFirestoreCollection<User>;

  //para el envio de correos
  // http = inject(HttpClient);
  private apiUrl = 'https://us-central1-sicop-is.cloudfunctions.net/sendEmail'; // Reemplaza con tu URL de función
  
  sendEmail(to:string, subject: string, body:string): Observable<any> {

    const emailData = { to, subject, body};
    return this.http.post(this.apiUrl, emailData);
  }

  // Método para obtener la instancia de autenticación de Firebase
  getAuth() {
    return getAuth();
  }

  // Método para iniciar sesión con correo electrónico y contraseña
  signIn(user: User) {
    return signInWithEmailAndPassword(
      this.getAuth(),
      user.email,
      user.password
    );
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
  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsService.routerlink('/auth');
  }

  // Método para agregar un documento a Firestore
  addDocument(path: any, data: any) {
    return addDoc(collection(getFirestore(), path), data);
  }

  // Método para actualizar una imagen en Firebase Storage
  async updateImg(path: any, data_url: any) {
    return uploadString(ref(getStorage(), path), data_url, 'data_url').then(
      () => {
        return getDownloadURL(ref(getStorage(), path));
      }
    );
  }

    // Método para obtener los datos de una colección de Firestore
    getCollectionDataUsuarios(path: any): AngularFirestoreCollection<User> {
      this.dataUsuarios = this.firestore.collection(path, (ref) =>
        ref.orderBy('ct_nombre', 'asc')
      );
      return this.dataUsuarios;
    }
    
  // Método para obtener los datos de una colección de Firestore
  getCollectionDataIncidencia(path: any): AngularFirestoreCollection<Incidencia> {
    this.dataRef = this.firestore.collection(path, (ref) =>
      ref.orderBy('cf_fecha_hora', 'asc')
    );
    return this.dataRef;
  }

  // Método para obtener los datos de una colección de Firestore
  getCollectionDataDiagnosticos(
    path: any
  ): AngularFirestoreCollection<Diagnostico> {
    this.dataRefDiag = this.firestore.collection(path, (ref) =>
      ref.orderBy('cf_fecha_hora', 'asc')
    );
    return this.dataRefDiag;
  }

  // Método para obtener los datos de una colección de Firestore
  getCollectionDataIncidenciasAsignadas(
    path: any
  ): AngularFirestoreCollection<Asignaciones> {
    this.dataIncidenciasAsignadas = this.firestore.collection(path, (ref) =>
      ref.orderBy('cn_id_usuario', 'asc')
    );
    return this.dataIncidenciasAsignadas;
  }

  getCollectionDataRol(path: any): AngularFirestoreCollection<Rol> {
    this.dataRefRol = this.firestore.collection(path, (ref) =>
      ref.orderBy('cn_id_rol', 'desc')
    );
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

  getAsignaciones(uid): Observable<any[]> {
    return this.firestore
      .collection('t_asignacion_incidencia/' + uid + '/t_asignacion_incidencia')
      .valueChanges();
  }

  //////////////////////////////////////
  // Método para obtener los roles específicos del usuario
  getSpecificRole(cn_id_usuario: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getRolUsuario().subscribe(
        (data) => {
          const specificRole = data.filter(
            (role) => role.cn_id_usuario === cn_id_usuario
          );
          if (specificRole) {
            // console.log(`Rol de ${cn_id_rol}:`, specificRole);
            resolve(specificRole);
          } else {
            // console.log(`Rol de ${cn_id_rol} no encontrado`);
            resolve(null); // Resuelve con null si no se encuentra el rol
          }
        },
        (error) => {
          console.error('Error al obtener roles:', error);
          reject(error); // Rechaza la promesa en caso de error
        }
      );
    });
  }

  getNameRol(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getRol().subscribe(
        (data) => {
          const rolesA = data;
          resolve(rolesA);
        },
        (error) => {
          console.error('Error al obtener roles:', error);
          reject(error); // Rechaza la promesa en caso de error
        }
      );
    });
  }

    // Método para actualizar el estado de una incidencia
    updateIncidenciaEstado(id: string, estado: number, idUsuario: string): Promise<void> {
      return this.firestore
        .collection('/t_incidencias/'+idUsuario+'/t_incidencias')
        .doc(id)
        .update({ cn_id_estado: estado });
    }

}
