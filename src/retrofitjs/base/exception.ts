import { Exception } from "@/core";

export class URLException extends Exception {
    constructor( message: string = "" ) {
        super( "URLException", message );
    }
}

export class TimeoutException extends Exception {
    constructor( message: string = "" ) {
        super( "TimeoutException", message );
    }
}

export class IOException extends Exception {
    constructor( message: string = "" ) {
        super( "IOException", message );
    }
}

export class AbortException extends Exception {
    constructor( message: string = "" ) {
        super( "AbortException", message );
    }
}