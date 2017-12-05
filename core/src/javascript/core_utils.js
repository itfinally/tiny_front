import { IllegalArgumentException, IllegalStateException } from "./exception";

// Added hashCode hook
Object.defineProperty( Object.prototype, "hashCode", {
    get: function () {
        if ( this === Object.prototype ) {
            return undefined;
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

        return this._hashCode;
    }
} );

export class CoreUtils {
    static isBaseType( target ) {
        return CoreUtils.isString( target ) || CoreUtils.isBoolean( target ) || CoreUtils.isNumber( target );
    }

    static isNumber( target ) {
        return typeof target === "number" || target instanceof Number;
    }

    static isString( target ) {
        return typeof target === "string" || target instanceof String;
    }

    static isBoolean( target ) {
        return typeof target === "boolean" || target instanceof Boolean;
    }

    static isSimpleObject( target ) {
        return target instanceof Object && undefined === target.prototype;
    }

    static isArrayLike( target ) {
        return target instanceof Object && target.hasOwnProperty( "length" ) &&
            CoreUtils.isNumber( target.length ) && isFinite( target.length ) && target.length >= 0;
    }

    static isNone( target ) {
        return undefined === target || null === target;
    }

    static getOrDefault( expect, defaultVal ) {
        return expect ? expect : defaultVal;
    }

    static hashCode( target ) {
        let hash = 0;
        for ( let i = 0, length = target.length; i < length; i++ ) {
            let character = target.charCodeAt( i );
            hash = ((hash << 5) - hash) + character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    static base64Encoder( target ) {
        return btoa( encodeURIComponent( target ).replace( /%([0-9A-F]{2})/g, function ( match, p1 ) {
            return String.fromCharCode( Number.parseInt( `0x${p1}` ) );
        } ) );
    }

    static base64Decoder( target ) {
        return decodeURIComponent( atob( target ).split( "" ).map( function ( c ) {
            return "%" + ("00" + c.charCodeAt( 0 ).toString( 16 )).slice( -2 );
        } ).join( "" ) );
    }

    static uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function ( c ) {
            let r = Math.random() * 16 | 0, v = ( "x" === c ? r : ( r & 0x3 | 0x8 ) );
            return v.toString( 16 );

        } );
    }

    static deepCopy( to, from, ignoreFunction = true ) {
        if ( typeof to !== typeof from ) {
            throw new IllegalStateException( "Parameter 'to' and 'from' have different type." );
        }

        if ( CoreUtils.isNone( from ) || CoreUtils.isBaseType( from ) ) {
            return;
        }

        if ( from instanceof Array ) {
            from.forEach( ( item, index ) => {
                if ( CoreUtils.isSimpleObject( item ) || item instanceof Array ) {
                    to[ index ] = {};
                    CoreUtils.deepCopy( to[ index ], item );
                }

                to[ index ] = item;
            } );

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
                let arr = [];

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
                if ( !(value instanceof Function && ignoreFunction) ) {
                    to[ key ] = value;
                }

                continue;
            }

            to[ key ] = {};
            CoreUtils.deepCopy( to[ key ], value, ignoreFunction );
        }
    }

    static each( collection, callback, thisArg = null ) {
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

            if ( callback( collection[ key ], key, thisArg ) ) {
                break;
            }
        }
    }
}

export class StringUtils {
    static format( template, kwArgs, ...args ) {
        let index = 0;

        if ( !CoreUtils.isString( template ) ) {
            throw new TypeError( `Expect string type, but got ${typeof template}` );
        }

        if ( !CoreUtils.isSimpleObject( kwArgs ) ) {
            throw new TypeError( `Expect object type, but got ${typeof kwArgs}` );
        }

        return template
            .replace( /\${([\w\-_]+)}/g, ( match, name ) => {
                return kwArgs.hasOwnProperty( name ) ? kwArgs[ name ] : match;
            } )

            .replace( /\$\?/g, () => {
                return args[ index++ ];
            } );
    }
}

export class Observer {
    constructor() {
        this._events = new Map();
        this._mapping = new Map();
        this._delayEvents = new Map();
    }

    _call( channel, bind, args ) {
        let parameters = ( args instanceof Array ? args : [ args ] );

        this._events.get( channel ).forEach( listener => {
            setTimeout( () => listener.apply( bind || window, parameters ), 0 );
        } );
    }

    _cleanTask( delayId ) {
        let maxAge = 20, delay = 1000,
            delayEvents = this._delayEvents,

            task = () => {
                if ( !delayEvents.has( delayId ) ) {
                    return;
                }

                if ( maxAge <= 0 ) {
                    delayEvents.delete( delayId );
                    return;
                }

                maxAge -= 1;
                setTimeout( task, delay );
            };

        setTimeout( task, delay );
    }

    subscription( channel, callback ) {
        if ( !CoreUtils.isString( channel ) ) {
            throw new IllegalArgumentException( `Channel expect string, but got ${typeof channel}.` );
        }

        if ( !(callback instanceof Function) ) {
            throw new IllegalArgumentException( `Channel expect function, but got ${typeof channel}.` );
        }

        let listeners,
            events = this._events;

        if ( events.has( channel ) ) {
            listeners = events.get( channel );

        } else {
            listeners = new Set();
            events.set( channel, listeners );
        }

        if ( listeners.has( callback ) ) {
            return;
        }

        let id = CoreUtils.uuid(),
            delayEvents = this._delayEvents;

        listeners.add( callback );
        this._mapping.set( id, { channel, callback } );

        if ( delayEvents.size > 0 ) {
            delayEvents.forEach( ( detail, delayId ) => {
                delayEvents.delete( delayId );
                this._call( detail.channel, detail.bind, detail.args );
            } );
        }

        return id;
    }

    publish( channel, bind, ...args ) {
        if ( !CoreUtils.isString( channel ) ) {
            throw new IllegalArgumentException( `channel expect string, but got ${typeof channel}` );
        }

        if ( !this._events.has( channel ) ) {
            let delayId = CoreUtils.uuid();

            this._delayEvents.set( delayId, { channel, bind, args } );
            this._cleanTask( delayId );

            return;
        }

        this._call( channel, bind, args );
    }

    remove( ...ids ) {
        let mapping = this._mapping,
            event = this._events;

        ids.forEach( id => {
            if ( !mapping.has( id ) ) {
                return;
            }

            let entry = mapping.get( id );
            if ( event.has( entry.channel ) ) {
                event.get( entry.channel ).delete( entry.callback );
            }
        } );
    }
}