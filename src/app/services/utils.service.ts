// Importación de módulos y servicios necesarios
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastOptions, ToastController, LoadingController, ModalOptions, ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// Decorador Injectable que indica que este servicio puede ser inyectado en otros componentes y servicios
@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  // Inyección de servicios y definición de variables
  router = inject(Router);
  toastCtrl = inject(ToastController);
  loadingCtrl = inject(LoadingController);
  modalCtrl = inject(ModalController);

  // Método para navegar a una URL específica
  routerlink(url: any){
    this.router.navigateByUrl(url)
  }

  // Método para crear un controlador de carga
  loading(){
    return this.loadingCtrl.create({spinner: 'crescent'})
  }

  // Método para presentar un toast con opciones específicas
  async presentToast(opts?: ToastOptions){
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  // Método para guardar datos en el almacenamiento local
  saveLocalStorage(key:string, value: any){
    return localStorage.setItem(key, JSON.stringify(value))
  }

  // Método para obtener datos del almacenamiento local
  getLocalStorage(key: string){
    return JSON.parse(localStorage.getItem(key));
  }

  // Método para crear un modal con opciones específicas
  async getModal(opts: ModalOptions){
    const modal = await this.modalCtrl.create(opts)
    await modal.present();
    const {data} = await modal.onWillDismiss();
    if(data) return data; // Si los datos existen, los retorna
  }

  // Método para cerrar un modal
  dismissModal(data?: any){
    return this.modalCtrl.dismiss(data);
  }

  // Método para tomar una foto o seleccionar una imagen de la galería
  async takePicture (promptLabelHeader: string){
    return await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Opciones a elegir (tomar foto, desde galería, etc)
        promptLabelHeader,
        promptLabelPhoto: 'Selecciona una imagen',
        promptLabelPicture: 'Toma una fotografía'
    });
  };
}