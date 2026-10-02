import {FormControl} from '@angular/forms';


export interface RegisterForm {
    Nombre: FormControl<string>;
    Apellido: FormControl<string>;
    Correo: FormControl<string>;
    contraseña: FormControl<string>;
    ConfirmarContraseña: FormControl<string>;
}