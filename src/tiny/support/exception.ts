import { Exception } from "jcdt";

export class UnAuthenticationException extends Exception {
  constructor( message: string ) {
    super( "UnAuthenticationException", message );
  }
}