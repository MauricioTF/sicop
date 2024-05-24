import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastOptions, ToastController, LoadingController, ModalOptions, ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  router = inject(Router);
  toastCtrl = inject(ToastController);
  loadingCtrl = inject(LoadingController);
  modalCtrl = inject(ModalController);

  routerlink(url: any){
    this.router.navigateByUrl(url)
  }

  loading(){

    return this.loadingCtrl.create({spinner: 'crescent'})
  }

  async presentToast(opts?: ToastOptions){

    const toast = await this.toastCtrl.create(opts);
    
    toast.present();
    
  }

  saveLocalStorage(key:string, value: any){
    return localStorage.setItem(key, JSON.stringify(value))
  }

  //obtiene los datos del usuario del local storage
  getLocalStorage(key: string){
    return JSON.parse(localStorage.getItem(key));
  }

  //para crear el modal
  async getModal(opts: ModalOptions){

    const modal = await this.modalCtrl.create(opts)
    await modal.present();

    const {data} = await modal.onWillDismiss();
    if(data) return data;//si los datos existen los retornará
  }

  //para cerrar modal
  dismissModal(data?: any){
    return this.modalCtrl.dismiss(data);
  }
}
