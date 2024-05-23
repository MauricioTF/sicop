import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-login-input',
  templateUrl: './login-input.component.html',
  styleUrls: ['./login-input.component.scss'],
})
export class LoginInputComponent implements OnInit {
  @Input() control!: FormControl;
  @Input() vt_type!: string;
  @Input() vt_label!: string;
  @Input() vt_auto_complete!: string;
  @Input() vt_icon!: string;
  vb_is_password: boolean;
  vb_hide: boolean = true;

  constructor() {}

  ngOnInit() {
    if (this.vt_type == 'password') {
      this.vb_is_password = true;
    }
  }

  mostrar_ocultar_pass(){
    this.vb_hide = !this.vb_hide;
    if(this.vb_hide){
      this.vt_type = 'password';
    }else{
      this.vt_type = 'text';
    }
  }
}
