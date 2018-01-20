import { Exception } from "@/core";

export class ComponentNotImplementException extends Exception {
    constructor( message: string = "" ) {
        super( "ComponentNotImplementException", message );
    }
}