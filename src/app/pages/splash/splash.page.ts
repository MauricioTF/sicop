import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  router = inject(Router); // Inyecta Router

  constructor() { }

  ngOnInit() {
    //cuando inicie sesion pase a auth
    setTimeout(() => {
      this.router.navigateByUrl('/auth');
    }, 3500);
  }

}
