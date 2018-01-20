import "ts-promise";
import { IllegalStateException, NullPointException } from "./exception";

// 0x7FFFFFFF === (2147483648 - 1), that is max unsigned integer in memory of javascript( 32 bit ).
// The highest bit is a flag bit, so capacity cannot greater than MAX_CAPACITY(either equal) otherwise
// the operation will be overflow or getting an negative number.
export const MAX_INTEGER = 2147483648;

( () => {
    let constant = Object.create( null );

    Object.defineProperty( Object.prototype, "hashCode", {
        get: function () {
            if ( this === Object.prototype ) {
                return undefined;
            }

            if ( CoreUtils.isBaseType( this ) ) {
                let key = this.toString();
                if ( !( key in constant ) ) {
                    constant[ key ] = CoreUtils.hashCode( key );
                }

                return constant[ key ];
            }

            if ( CoreUtils.isNone( this ) ) {
                return 0;
            }

            if ( !this.hasOwnProperty( "_hashCode" ) ) {
                let hashCode = CoreUtils.hashCode( CoreUtils.uuid() );

                Object.defineProperty( this, "_hashCode", {
                    configurable: false,
                    writable: false,
                    value: hashCode
                } );

                return hashCode;
            }

            return ( <any>this )._hashCode;
        }
    } );
} )();

export class CoreUtils {
    private constructor() {
    }

    public static isBaseType( target: any ): boolean {
        return CoreUtils.isString( target ) || CoreUtils.isBoolean( target ) || CoreUtils.isNumber( target );
    }

    public static isNumber( target: any ): boolean {
        return typeof target === "number" || target instanceof Number;
    }

    public static isString( target: any ): boolean {
        return typeof target === "string" || target instanceof String;
    }

    public static isBoolean( target: any ): boolean {
        return typeof target === "boolean" || target instanceof Boolean;
    }

    public static isSimpleObject( target: any ): boolean {
        return !CoreUtils.isNone( target ) && ( null === Object.getPrototypeOf( target )
            || ( target instanceof Object && undefined === target.prototype ) );
    }

    public static isArrayLike( target: any ): boolean {
        return target instanceof Object && target.hasOwnProperty( "length" ) &&
            CoreUtils.isNumber( target.length ) && isFinite( target.length ) && target.length >= 0;
    }

    public static isNone( target: any ): boolean {
        return undefined === target || null === target;
    }

    public static getOrDefault<T>( expect: T, defaultVal: T ): T {
        return !CoreUtils.isNone( expect ) ? expect : defaultVal;
    }

    public static hashCode( target: string ): number {
        let hash = 0;
        for ( let i = 0, length = target.length; i < length; i++ ) {
            let character = target.charCodeAt( i );
            hash = ( ( hash << 5 ) - hash ) + character;
            hash = hash & hash; // Convert to 32bit integer
        }

        return hash;
    }

    public static base64Encoder( target: string ): string {
        return btoa( encodeURIComponent( target ).replace( /%([0-9A-F]{2})/g, function ( match, p1 ) {
            return String.fromCharCode( Number.parseInt( `0x${p1}` ) );
        } ) );
    }

    public static base64Decoder( target: string ): string {
        return decodeURIComponent( atob( target ).split( "" ).map( function ( c ) {
            return "%" + ( "00" + c.charCodeAt( 0 ).toString( 16 ) ).slice( -2 );
        } ).join( "" ) );
    }

    public static uuid(): string {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function ( c ) {
            let r = Math.random() * 16 | 0, v = ( "x" === c ? r : ( r & 0x3 | 0x8 ) );
            return v.toString( 16 );

        } );
    }

    static deepCopy( to: any, from: any, ignoreFunction = true ) {
        if ( typeof to !== typeof from ) {
            throw new IllegalStateException( "Parameter 'to' and 'from' have different type." );
        }

        if ( CoreUtils.isNone( from ) || CoreUtils.isBaseType( from ) ) {
            return;
        }

        if ( from instanceof Array ) {
            let item;
            for ( let index = 0, size = from.length; index < size; index += 1 ) {
                item = from[ index ];

                if ( CoreUtils.isSimpleObject( item ) || item instanceof Array ) {
                    to[ index ] = {};
                    CoreUtils.deepCopy( to[ index ], item );
                }

                to[ index ] = item;
            }

            return;
        }

        let value;
        for ( let key in from ) {
            if ( !from.hasOwnProperty( key ) ) {
                continue;
            }

            value = from[ key ];
            if ( CoreUtils.isNone( value ) ) {
                to[ key ] = value;
                continue;
            }

            if ( value instanceof Array ) {
                let arr: any[] = [];

                value.forEach( ( item, index ) => {
                    if ( CoreUtils.isSimpleObject( item ) ) {
                        arr[ index ] = {};
                        CoreUtils.deepCopy( arr[ index ], item );
                        return;
                    }

                    arr[ index ] = item;
                } );

                to[ key ] = arr;
                continue;
            }

            if ( CoreUtils.isBaseType( value ) || value instanceof Function ) {
                if ( !( value instanceof Function && ignoreFunction ) ) {
                    to[ key ] = value;
                }

                continue;
            }

            to[ key ] = {};
            CoreUtils.deepCopy( to[ key ], value, ignoreFunction );
        }
    }

    static each<T>( collection: Array<T> | ArrayLike<T>, callback: ( item: T, index: number, collection: any ) => boolean, thisArg = null ) {
        if ( collection instanceof Array ) {
            collection.some( callback );
            return;
        }

        if ( CoreUtils.isArrayLike( collection ) ) {
            Array.prototype.some.call( thisArg, callback );
            return;
        }

        for ( let key in collection ) {
            if ( !collection.hasOwnProperty( key ) ) {
                continue;
            }

            if ( callback.call( thisArg, collection[ key ], key, collection ) ) {
                break;
            }
        }
    }

    static eq( target: any, src: any ): boolean {
        if ( ( !CoreUtils.isNone( target ) && CoreUtils.isNone( src ) ) ||
            ( CoreUtils.isNone( target ) && !CoreUtils.isNone( src ) ) ||
            typeof target !== typeof src
        ) {
            return false;
        }

        if ( CoreUtils.isNone( target ) && CoreUtils.isNone( src ) ) {
            return target === src;
        }

        if ( target instanceof Array && src instanceof Array ) {
            if ( target.length !== src.length ) {
                return false;
            }

            for ( let index = 0; index < src.length; index += 1 ) {
                if ( !CoreUtils.eq( target[ index ], src[ index ] ) ) {
                    return false;
                }
            }

            return true;
        }

        if ( CoreUtils.isBaseType( target ) && CoreUtils.isBaseType( src ) ) {

            if ( typeof src === "number" && isNaN( target ) && isNaN( src ) ) {
                return true;
            }

            return target === src;
        }

        if ( target instanceof Function && src instanceof Function ) {
            return target === src;
        }

        let srcKey = Object.keys( src ),
            targetKey = Object.keys( target );

        if ( srcKey.length !== targetKey.length || srcKey.some( key => targetKey.indexOf( key ) < 0 ) ) {
            return false;
        }

        // Like Date or Function etc... , no property of the object.
        // So that just judge by toString and prototype
        if ( srcKey.length <= 0 ) {
            return srcKey.toString() === targetKey.toString() &&
                Object.getPrototypeOf( src ) === Object.getPrototypeOf( target );
        }

        for ( let key of srcKey ) {
            if ( !CoreUtils.eq( target[ key ], src[ key ] ) ) {
                return false;
            }
        }

        return true;
    }
}

export class Assert {
    private constructor() {
    }

    public static requireNotNull( o: any, message: string = "" ): any {
        if ( CoreUtils.isNone( o ) ) {
            throw new NullPointException( message );
        }

        return o;
    }

    public static isNull( o: any ): boolean {
        return CoreUtils.isNone( o );
    }

    public static nonNull( o: any ): boolean {
        return !CoreUtils.isNone( o );
    }
}

export class StringUtils {

    static format( template: string, kwArgs: any, ...args: any[] ) {
        let index = 0;

        if ( !CoreUtils.isString( template ) ) {
            throw new TypeError( `Expect string type, but got ${typeof template}` );
        }

        if ( !CoreUtils.isSimpleObject( kwArgs ) ) {
            kwArgs = Object.create( null );
        }

        return template
            .replace( /\${([\w\-_]+)}/g, ( match, name ) => {
                return name in kwArgs ? kwArgs[ name ] : match;
            } )

            .replace( /\$\?/g, () => {
                return args[ index++ ];
            } );
    }

    static isBlank( str: string ): boolean {
        return CoreUtils.isNone( str ) || /^ *$/.test( str );
    }

    static isNotBlank( str: string ): boolean {
        return !StringUtils.isBlank( str );
    }
}

interface EventListener {
    fn: Function,
    isOnce?: boolean
}

export class EventEmitter {
    private events: any;
    private maxListeners: number;
    private delayList: { [event: string]: any[][] };
    private static EventListener = class implements EventListener {
        fn: Function;
        isOnce: boolean;


        constructor( fn: Function, isOnce: boolean = false ) {
            this.fn = fn;
            this.isOnce = isOnce;
        }
    };

    constructor( maxListeners: number = 10 ) {
        this.events = Object.create( null );
        this.maxListeners = maxListeners;
        this.delayList = Object.create( null );
    }

    private emitDelayEvent( eventName: string ): void {
        if ( this.delayList && eventName in this.delayList ) {
            this.delayList[ eventName ].forEach( args => this.emit( eventName, ...args ) );
            delete this.delayList[ eventName ];
        }
    }

    private addListener( eventName: string, listener: Function, isOnce: boolean, isPrepend: boolean ): this {
        let events = this.events,
            maxListeners = this.maxListeners;

        if ( !CoreUtils.isString( eventName ) ) {
            throw new TypeError( `Expect type string, but got ${typeof eventName}` );
        }

        if ( !( listener instanceof Function ) ) {
            throw new TypeError( `Expect type function, but got ${typeof listener}` );
        }

        if ( !( eventName in events ) ) {
            events[ eventName ] = new EventEmitter.EventListener( listener, isOnce );
            this.emitDelayEvent( eventName );
            return this;
        }

        let listeners = events[ eventName ];

        if ( listeners instanceof EventEmitter.EventListener ) {
            events[ eventName ] = isPrepend
                ? [ new EventEmitter.EventListener( listener, isOnce ), listeners ]
                : [ listeners, new EventEmitter.EventListener( listener, isOnce ) ];
            return this;
        }

        if ( listeners.length >= maxListeners ) {
            console.warn( "No more listener." );
        }

        isPrepend
            ? listeners.unshift( new EventEmitter.EventListener( listener, isOnce ) )
            : listeners.push( new EventEmitter.EventListener( listener, isOnce ) );

        // active event
        this.emitDelayEvent( eventName );

        return this;
    }

    private task( fn: Function, args: any[] ): () => Promise<any> {
        return () => {
            try {
                fn( ...args );

            } catch ( log ) {
                console.error( `function ${fn.name} raise an error in EventEmitter` );
                console.error( log );
            }

            return Promise.resolve();
        };
    }

    private executor( listeners: Function | Function[], args: any[] ): void {
        let tasks: Promise<any> = new Promise( resolve => resolve() );

        listeners instanceof Function
            ? tasks.then( this.task( listeners, args ) )
            : ( <Function[]>listeners ).forEach( listener => tasks = tasks.then( this.task( listener, args ) ) );
    }

    public emit( eventName: string, ...args: any[] ): boolean {
        let events = this.events,
            maxListeners = this.maxListeners;

        if ( !( eventName in events ) ) {
            return false;
        }

        let listeners = events[ eventName ];
        if ( listeners instanceof EventEmitter.EventListener ) {
            if ( ( <EventListener>listeners ).isOnce ) {
                delete events[ eventName ];
            }

            this.executor( ( <EventListener>listeners ).fn, args );
            return true;
        }

        let fns = ( <EventListener[]>listeners ).slice( 0, maxListeners ).map( listener => listener.fn );

        events[ eventName ] = ( <EventListener[]>listeners ).slice( 0, maxListeners )
            .filter( listener => !listener.isOnce ).concat( listeners.slice( maxListeners ) );

        this.executor( fns, args );
        return true;
    }

    public delayEmit( eventName: string, ...args: any[] ): void {
        if ( eventName in this.events ) {
            this.emit( eventName, ...args );
            return;
        }

        if ( !( eventName in this.delayList ) ) {
            this.delayList[ eventName ] = [];
        }

        this.delayList[ eventName ].push( args );
    }

    public eventNames(): string[] {
        return Object.keys( this.events );
    }

    public listenerCount( eventName: string ): number {
        let events = this.events;

        if ( !( eventName in events ) ) {
            return 0;
        }

        let listeners = events[ eventName ];
        if ( listeners instanceof EventEmitter.EventListener ) {
            return 1;
        }

        return listeners.length;
    }

    public on( eventName: string, listener: Function ): this {
        return this.addListener( eventName, listener, false, false );
    }

    public once( eventName: string, listener: Function ): this {
        return this.addListener( eventName, listener, true, false );
    }

    public prependListener( eventName: string, listener: Function ): this {
        return this.addListener( eventName, listener, false, true );
    }

    public prependOnceListener( eventName: string, listener: Function ): this {
        return this.addListener( eventName, listener, true, true );
    }

    public listeners( eventName: string ): EventListener | EventListener[] {
        let events = this.events;

        if ( !( eventName in events ) ) {
            return <any>null;
        }

        let listeners: EventListener | EventListener[] = events[ eventName ];

        return listeners instanceof EventEmitter.EventListener
            ? new EventEmitter.EventListener( listeners.fn, listeners.isOnce )
            : ( <EventListener[]>listeners ).map( listener => new EventEmitter.EventListener( listener.fn, listener.isOnce ) );
    }

    public removeAllListeners( eventName: string ): this {
        let events = this.events;

        if ( CoreUtils.isNone( eventName ) ) {
            this.events = Object.create( null );

        } else if ( eventName in events ) {
            delete events[ eventName ];
        }

        return this;
    }

    public removeListener( eventName: string, listener: Function ): this {
        let events = this.events;

        if ( eventName in events ) {
            let listeners = events[ eventName ];

            if ( listeners instanceof EventEmitter.EventListener ) {
                if ( listeners.fn === listener ) {
                    delete events[ eventName ];
                }

            } else {
                events[ eventName ] = ( <EventListener[]>listeners )
                    .filter( item => item.fn !== listener );
            }
        }

        return this;
    }
}

export class Dates {
    private constructor() {
    }

    static toLocalDateTimeString( millis: number ): string {
        let date = new Date( millis );
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
}