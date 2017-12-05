export class Exception extends Error {
    constructor( name, message ) {
        super( message );
        this.name = name;
        this.stack = (new Error( message )).stack;
    }
}

export class IllegalStateException extends Exception {
    constructor( message = "" ) {
        super( "IllegalStateException", message );
    }
}

export class IllegalArgumentException extends Exception {
    constructor( message = "" ) {
        super( "IllegalArgumentException", message );
    }
}

export class NullPointException extends Exception {
    constructor( message = "" ) {
        super( "NullPointException", message );
    }
}

export class UnsupportedOperationException extends Exception {
    constructor( message = "" ) {
        super( "UnsupportedOperationException", message );
    }
}

export class IndexOutOfBoundException extends Exception {
    constructor( message = "" ) {
        super( "IndexOutOfBoundException", message );
    }
}

export class AccessException extends Exception {
    constructor( message = "" ) {
        super( "AccessException", message );
    }
}

export class NoSuchElementException extends Exception {
    constructor( message = "" ) {
        super( "NoSuchElementException", message );
    }
}