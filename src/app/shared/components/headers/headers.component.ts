import { Component, Input, OnInit, inject, input } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-headers',
  templateUrl: './headers.component.html',
  styleUrls: ['./headers.component.scss'],
})
export class HeadersComponent  implements OnInit {

  //para que sepa que le van a llegar datos y se llama title, en la clase main.page.html está title
  //el title se manda por el header.component.html
  @Input() vt_title!: string;//enviamos este titulo, se recibe en el html de headers y el valor 
                            //se le otorga en el html de main o en algun hijo
  @Input() vb_show_menu!: boolean;
  @Input() vb_isModal: boolean;
  
  utilService = inject(UtilsService);

  ngOnInit() {}

  dismissModal(){

    this.utilService.dismissModal();
  }

}
