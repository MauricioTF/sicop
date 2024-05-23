import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-login-input',
  templateUrl: './login-input.component.html',
  styleUrls: ['./login-input.component.scss'],
})
export class LoginInputComponent  implements OnInit {

  @Input() control!: FormControl;
  @Input() vt_type!: string;
  @Input() vt_label!: string;
  @Input() vt_auto_complete!: string;
  @Input() vt_icon!: string;

  constructor() { }

  ngOnInit() {}

}
