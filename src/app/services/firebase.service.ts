// Importación de módulos y servicios necesarios
import { Injectable, inject } from '@angular/core'; // Importa el decorador Injectable y la función inject de Angular core para la inyección de dependencias
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Importa AngularFireAuth para la autenticación con Firebase
import { AngularFirestore, AngularFirestoreCollection, } from '@angular/fire/compat/firestore'; // Importa AngularFirestore y AngularFirestoreCollection para interactuar con Firestore
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Importa funciones de autenticación de Firebase
import { User } from '../models/user.model'; // Importa el modelo User
import { Incidencia } from '../models/incidencia.model'; // Importa el modelo Incidencia
import { CollectionReference, DocumentData, addDoc, collection, doc, getDoc, getFirestore, } from '@angular/fire/firestore'; // Importa funciones de Firestore
import { UtilsService } from './utils.service'; // Importa UtilsService para utilizar sus utilidades
import { getDownloadURL, getStorage, ref, uploadString, } from 'firebase/storage'; // Importa funciones de Firebase Storage
import { Observable, map } from 'rxjs'; // Importa Observable y map de rxjs para trabajar con programación reactiva
import { Rol } from '../models/rol.model'; // Importa el modelo Rol
import { Diagnostico } from '../models/diagnostico.model'; // Importa el modelo Diagnostico
import { Asignaciones } from '../models/asignaciones.model'; // Importa el modelo Asignaciones
import { HttpClient } from '@angular/common/http'; // Importa HttpClient para realizar peticiones HTTP
import { bitacoraCambioEstado } from '../models/bitacoraCambioEstado.model'; // Importa el modelo bitacoraCambioEstado
import { bitacoraGeneral } from '../models/bitacoraGeneral.model'; // Importa el modelo bitacoraGeneral

// Decorador Injectable que indica que este servicio puede ser inyectado en otros componentes y servicios
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  // Inyección de servicios y definición de variables
  auth = inject(AngularFireAuth); // Inyecta el servicio AngularFireAuth
  firestore = inject(AngularFirestore); // Inyecta el servicio AngularFirestore
  utilsService = inject(UtilsService); // Inyecta el servicio UtilsService
  http = inject(HttpClient); // Inyecta el servicio HttpClient

  // Definición de variables para referencias a colecciones en Firestore
  dataRef: AngularFirestoreCollection<Incidencia>; // Referencia a la colección de incidencias
  dataRefRol: AngularFirestoreCollection<Rol>; // Referencia a la colección de roles
  dataRefDiag: AngularFirestoreCollection<Diagnostico>; // Referencia a la colección de diagnósticos
  dataIncidenciasAsignadas: AngularFirestoreCollection<Asignaciones>; // Referencia a la colección de incidencias asignadas
  dataUsuarios: AngularFirestoreCollection<User>; // Referencia a la colección de usuarios
  dataBCE: AngularFirestoreCollection<bitacoraCambioEstado>; // Referencia a la colección de bitácora de cambio de estado
  dataG: AngularFirestoreCollection<bitacoraGeneral>; // Referencia a la colección de bitácora general

  // URL de la API para el envío de correos
  private apiUrl = 'https://us-central1-sicop-is.cloudfunctions.net/sendEmail'; // URL de la función de Cloud Functions para enviar emails

  // Método para enviar un correo electrónico
  sendEmail(to: string, subject: string, body: string): Observable<any> {
    const emailData = { to, subject, body }; // Crea el objeto con los datos del correo
    return this.http.post(this.apiUrl, emailData); // Realiza una petición POST a la API para enviar el correo
  }

  // Método para obtener la instancia de autenticación de Firebase
  getAuth() {
    return getAuth(); // Retorna la instancia de autenticación de Firebase
  }

  // Método para iniciar sesión con correo electrónico y contraseña
  signIn(user: User) {
    return signInWithEmailAndPassword(
      this.getAuth(),
      user.email,
      user.password
    ); // Realiza el inicio de sesión con email y contraseña
  }

  // Método para obtener el usuario actual
  getCurrentUser() {
    return this.auth.authState; // Retorna un observable con el estado de autenticación del usuario actual
  }

  // Método para obtener un documento de Firestore
  async getDocument(path: string) {
    const docRef = doc(getFirestore(), path); // Crea una referencia al documento
    const docSnap = await getDoc(docRef); // Obtiene el documento
    if (docSnap.exists()) {
      return docSnap.data(); // Si el documento existe, retorna sus datos
    } else {
      throw new Error('No such document!'); // Si el documento no existe, lanza un error
    }
  }

  // Método para cerrar sesión
  signOut() {
    getAuth().signOut(); // Cierra la sesión en Firebase Auth
    localStorage.removeItem('user'); // Elimina el usuario del almacenamiento local
    this.utilsService.routerlink('/auth'); // Redirige al usuario a la página de autenticación
  }

  // Método para agregar un documento a Firestore
  addDocument(path: any, data: any) {
    return addDoc(collection(getFirestore(), path), data); // Agrega un documento a la colección especificada
  }

  // Método para actualizar una imagen en Firebase Storage
  async updateImg(path: any, data_url: any) {
    return uploadString(ref(getStorage(), path), data_url, 'data_url').then(
      () => {
        return getDownloadURL(ref(getStorage(), path)); // Sube la imagen y retorna la URL de descarga
      }
    );
  }

  // Métodos para obtener los datos de diferentes colecciones de Firestore
  // Cada método crea una referencia a la colección especificada y la ordena según un criterio
  // Retorna la referencia a la colección

  // Método para obtener datos de la tabla rol_usuario
  getRolUsuario(): Observable<any[]> {
    return this.firestore.collection('t_rol_usuario').valueChanges(); // Retorna un observable con los datos de la colección 't_rol_usuario'
  }

  // Método para obtener datos de la tabla rol
  getRol(): Observable<any[]> {
    return this.firestore.collection('t_roles').valueChanges(); // Retorna un observable con los datos de la colección 't_roles'
  }

  // Método para obtener datos de la tabla usuarios (para obtener los técnicos)
  getTecnicos(): Observable<any[]> {
    return this.firestore.collection('t_usuarios').valueChanges(); // Retorna un observable con los datos de la colección 't_usuarios'
  }

  // Método para obtener asignaciones de un usuario específico
  getAsignaciones(uid): Observable<any[]> {
    return this.firestore
      .collection('t_asignacion_incidencia/' + uid + '/t_asignacion_incidencia')
      .valueChanges(); // Retorna un observable con los datos de las asignaciones del usuario especificado
  }

  // Método para obtener los roles específicos del usuario
  getSpecificRole(cn_id_usuario: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getRolUsuario().subscribe(
        (data) => {
          const specificRole = data.filter(
            (role) => role.cn_id_usuario === cn_id_usuario
          ); // Filtra los roles específicos del usuario
          if (specificRole) {
            resolve(specificRole); // Si encuentra roles específicos, los resuelve
          } else {
            resolve(null); // Si no encuentra roles específicos, resuelve con null
          }
        },
        (error) => {
          console.error('Error al obtener roles:', error);
          reject(error); // En caso de error, rechaza la promesa
        }
      );
    });
  }

  // Método para obtener nombres de roles
  getNameRol(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getRol().subscribe(
        (data) => {
          const rolesA = data; // Obtiene los datos de roles
          resolve(rolesA); // Resuelve con los datos de roles
        },
        (error) => {
          console.error('Error al obtener roles:', error);
          reject(error); // En caso de error, rechaza la promesa
        }
      );
    });
  }

  // Método para actualizar el estado de una incidencia
  actualizaTabla(
    path: string,
    id: string,
    idUsuario: string,
    fieldsToUpdate: { [key: string]: any }
  ): Promise<void> {
    return this.firestore
      .collection(path + `${idUsuario}` + path)
      .doc(id)
      .update(fieldsToUpdate); // Actualiza los campos especificados del documento en la colección
  }

  // Método para eliminar un documento
  eliminaRegistro(id: string, idUsuario: string): Promise<void> {
    return this.firestore
      .collection(
        `/t_asignacion_incidencia/${idUsuario}/t_asignacion_incidencia`
      )
      .doc(id)
      .delete(); // Elimina el documento especificado de la colección
  }

  // Método para registrar una acción en la bitácora general
  async bitacoraGeneral(
    pantalla: string,
    incidencia: Incidencia,
    idUser: string,
    accion: string
  ) {
    let path = `t_bitacora_general/${idUser}/t_bitacora_general`; // Define la ruta de la colección

    const bitacoraGeneral = {
      pantalla: pantalla,
      cn_id_usuario: idUser,
      accion: accion,
      ct_fecha_hora: new Date().toLocaleString('en-US', {
        timeZone: 'America/Costa_Rica',
      }), // Crea el objeto de la bitácora general
    };

    this.addDocument(path, bitacoraGeneral)
      .then(async (resp) => {})
      .finally(() => {}); // Agrega el documento a la colección y maneja la promesa
  }

  // Método para registrar un cambio de estado en la bitácora de cambio de estado
  async bitacoraCambioEstado(
    incidencia: Incidencia,
    idUser: string,
    nuevo_estado: number,
    estado_actual: number
  ) {
    let path = `t_bitacora_cambio_estado/${idUser}/t_bitacora_cambio_estado`;

    const cambioEstado = {
      cn_id_incidencia: incidencia['id'],
      cn_id_usuario: idUser,
      estado_actual: estado_actual,
      nuevo_estado: nuevo_estado,
      ct_fecha_hora: new Date().toLocaleString('en-US', {
        timeZone: 'America/Costa_Rica',
      }),
    };

    this.addDocument(path, cambioEstado)
      .then(async (resp) => {})
      .finally(() => {});
  }
}
