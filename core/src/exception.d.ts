export class Exception extends Error {
    constructor( name: string, message: string );
}

export class IllegalStateException extends Exception {
    constructor( message?: string );
}

export class IllegalArgumentException extends Exception {
    constructor( message?: string );
}

export class NullPointException extends Exception {
    constructor( message?: string );
}

export class UnsupportedOperationException extends Exception {
    constructor( message?: string );
}

export class IndexOutOfBoundException extends Exception {
    constructor( message?: string );
}

export class NoSuchElementException extends Exception {
    constructor( message?: string );
}