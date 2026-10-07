import {FormControl} from '@angular/forms';


export interface RegisterForm {
    nombre: FormControl<string>;
    apellido: FormControl<string>;
    correo: FormControl<string>;
    contrasena: FormControl<string>;
    confirmarContraseña: FormControl<string>;
    telefono: FormControl<string>;
    rol: FormControl<string>;
}