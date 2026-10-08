import { CurrentUser } from '../interfaces/CurrentUser';


export interface LoginResponse {
  access_token: string;
  usuario: CurrentUser | { datosUsuario: CurrentUser };
}
