export class Exception extends Error {
    constructor( name: string, message: string ) {
        super( message );
        this.name = name;
        this.stack = (new Error( message )).stack;
    }
}

export class IllegalStateException extends Exception {
    constructor( message: string = "" ) {
        super( "IllegalStateException", message );
    }
}

export class IllegalArgumentException extends Exception {
    constructor( message: string = "" ) {
        super( "IllegalArgumentException", message );
    }
}

export class NullPointException extends Exception {
    constructor( message: string = "" ) {
        super( "NullPointException", message );
    }
}

export class UnsupportedOperationException extends Exception {
    constructor( message: string = "" ) {
        super( "UnsupportedOperationException", message );
    }
}

export class IndexOutOfBoundsException extends Exception {
    constructor( message: string = "" ) {
        super( "IndexOutOfBoundsException", message );
    }
}

export class AccessException extends Exception {
    constructor( message: string = "" ) {
        super( "AccessException", message );
    }
}

export class NoSuchElementException extends Exception {
    constructor( message: string = "" ) {
        super( "NoSuchElementException", message );
    }
}

export class AuthenticationException extends Exception {
    constructor( message: string = "" ) {
        super( "AuthenticationException", message );
    }
}