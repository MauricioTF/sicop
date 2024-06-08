import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empty',
  templateUrl: './empty.page.html',
  styleUrls: ['./empty.page.scss'],
})
export class EmptyPage implements OnInit {

  router = inject(Router); // Inyecta Router

  ngOnInit() {
      //cuando inicie sesion pase a auth
      setTimeout(() => {
        this.router.navigateByUrl('main/home');
      }, 1000);
  }

}
