import { Component, Input, OnInit } from '@angular/core'; // Importa los decoradores Component, Input y la interfaz OnInit de Angular.
import { FormControl } from '@angular/forms'; // Importa FormControl de los formularios reactivos de Angular.

@Component({ // Decorador que define la configuración del componente.
  selector: 'app-login-input', // Selector CSS para usar el componente.
  templateUrl: './login-input.component.html', // Ruta del archivo de plantilla HTML del componente.
  styleUrls: ['./login-input.component.scss'], // Ruta de los archivos de estilos para el componente.
})
export class LoginInputComponent implements OnInit { // Define la clase del componente y la implementación de la interfaz OnInit.
  @Input() control!: FormControl; // Decorador Input para recibir un FormControl como parámetro.
  @Input() vt_type!: string; // Decorador Input para recibir el tipo de input (ej. text, password).
  @Input() vt_label!: string; // Decorador Input para recibir la etiqueta del input.
  @Input() vt_auto_complete!: string; // Decorador Input para recibir la configuración de autocompletado del input.
  @Input() vt_icon!: string; // Decorador Input para recibir el ícono que se mostrará junto al input.
  vb_is_password: boolean; // Variable para determinar si el tipo de input es contraseña.
  vb_hide: boolean = true; // Variable para controlar la visibilidad de la contraseña.

  constructor() {} // Constructor de la clase.

  ngOnInit() { // Método que se ejecuta al inicializar el componente.
    if (this.vt_type == 'password') { // Verifica si el tipo de input es 'password'.
      this.vb_is_password = true; // Si es 'password', establece vb_is_password en true.
    }
  }

  mostrar_ocultar_pass(){ // Método para alternar la visibilidad de la contraseña.
    this.vb_hide = !this.vb_hide; // Cambia el estado de vb_hide.
    if(this.vb_hide){ // Si vb_hide es true, esconde la contraseña.
      this.vt_type = 'password'; // Establece el tipo de input en 'password'.
    }else{ // Si vb_hide es false, muestra la contraseña.
      this.vt_type = 'text'; // Establece el tipo de input en 'text'.
    }
  }
}