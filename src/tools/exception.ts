import { Exception } from "jcdt";

export class ComponentNotImplementException extends Exception {
  constructor( message: string = "" ) {
    super( "ComponentNotImplementException", message );
  }
}