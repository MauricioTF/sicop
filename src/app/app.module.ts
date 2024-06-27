import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import {AngularFireModule} from '@angular/fire/compat';
import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {BaseChartDirective} from 'ng2-charts';
import { OverlayModule } from '@angular/cdk/overlay';

//de la base de datos en firebase
//para poder hacer uso de los datos en firebase
export const firebaseConfig = {
  apiKey: "AIzaSyBPh46KTYhWzDq5V9Jb8LCPfcEGEvblrzY",
  authDomain: "sicop-is.firebaseapp.com",
  projectId: "sicop-is",
  storageBucket: "sicop-is.appspot.com",
  messagingSenderId: "872205519729",
  appId: "1:872205519729:web:86a10490c0825ee7b744d0",
  measurementId: "G-LFD68VF2Y4"
};

//para inicializar firebase
initializeApp(firebaseConfig);

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, 
    IonicModule.forRoot({mode: 'ios'}),
    AppRoutingModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    HttpClientModule,
    BaseChartDirective,
    OverlayModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
