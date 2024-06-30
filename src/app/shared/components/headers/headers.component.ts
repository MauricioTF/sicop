import { Component, Input, OnInit, inject } from '@angular/core'; // Importa los decoradores y funciones necesarias de Angular
import { UtilsService } from 'src/app/services/utils.service'; // Importa el servicio UtilsService para utilizar sus métodos

@Component({ // Decorador que define la configuración del componente
  selector: 'app-headers', // Selector CSS para usar el componente
  templateUrl: './headers.component.html', // Ruta del archivo de plantilla HTML del componente
  styleUrls: ['./headers.component.scss'], // Ruta de los archivos de estilos para el componente
})
export class HeadersComponent implements OnInit { // Define la clase del componente y la implementación de la interfaz OnInit

  // Decorador Input para recibir un valor externo llamado vt_title, que es un string. Este valor se asigna en el HTML del componente padre
  @Input() vt_title!: string;
  // Decorador Input para recibir un valor booleano externo llamado vb_show_menu. Este valor se asigna en el HTML del componente padre
  @Input() vb_show_menu!: boolean;
  // Decorador Input para recibir un valor booleano externo llamado vb_isModal. Este valor se asigna en el HTML del componente padre
  @Input() vb_isModal: boolean;
  
  utilService = inject(UtilsService); // Inyecta el servicio UtilsService para utilizar sus métodos dentro del componente

  ngOnInit() {} // Método vacío de la interfaz OnInit, se ejecuta al inicializar el componente

  dismissModal() { // Método para cerrar un modal
    this.utilService.dismissModal(); // Llama al método dismissModal del servicio UtilsService para cerrar el modal
  }
}