import { IllegalArgumentException, IllegalStateException } from "./exception";

// Added hashCode hook
(() => {
    let constant = Object.create( null );

    Object.defineProperty( Object.prototype, "hashCode", {
        get: function () {
            if ( this === Object.prototype ) {
                return undefined;
            }

            if ( CoreUtils.isBaseType( this ) ) {
                let key = this.toString();
                if ( !(key in constant) ) {
                    constant[ key ] = CoreUtils.hashCode( key );
                }

                return constant[ key ];
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
})();

/**
 * @class CoreUtils
 */
export class CoreUtils {
    /**
     * @static
     * @param target
     * @return {boolean}
     */
    static isBaseType( target ) {
        return CoreUtils.isString( target ) || CoreUtils.isBoolean( target ) || CoreUtils.isNumber( target );
    }

    /**
     * @static
     * @param target
     * @return {boolean}
     */
    static isNumber( target ) {
        return typeof target === "number" || target instanceof Number;
    }

    /**
     * @static
     * @param target
     * @return {boolean}
     */
    static isString( target ) {
        return typeof target === "string" || target instanceof String;
    }

    /**
     * @static
     * @param target
     * @return {boolean}
     */
    static isBoolean( target ) {
        return typeof target === "boolean" || target instanceof Boolean;
    }

    /**
     * @static
     * @param target
     * @return {boolean}
     */
    static isSimpleObject( target ) {
        return target instanceof Object && undefined === target.prototype;
    }

    /**
     * @static
     * @param target
     * @return {boolean}
     */
    static isArrayLike( target ) {
        return target instanceof Object && target.hasOwnProperty( "length" ) &&
            CoreUtils.isNumber( target.length ) && isFinite( target.length ) && target.length >= 0;
    }

    /**
     * @static
     * @param target
     * @return {boolean}
     */
    static isNone( target ) {
        return undefined === target || null === target;
    }

    /**
     * @static
     * @template T
     * @param {T} expect
     * @param {T} defaultVal
     * @return {T}
     */
    static getOrDefault( expect, defaultVal ) {
        return expect ? expect : defaultVal;
    }

    /**
     * @static
     * @param target
     * @return {number}
     */
    static hashCode( target ) {
        let hash = 0;
        for ( let i = 0, length = target.length; i < length; i++ ) {
            let character = target.charCodeAt( i );
            hash = ((hash << 5) - hash) + character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * @static
     * @param target
     * @return {string}
     */
    static base64Encoder( target ) {
        return btoa( encodeURIComponent( target ).replace( /%([0-9A-F]{2})/g, function ( match, p1 ) {
            return String.fromCharCode( Number.parseInt( `0x${p1}` ) );
        } ) );
    }

    /**
     * @static
     * @param target
     * @return {string}
     */
    static base64Decoder( target ) {
        return decodeURIComponent( atob( target ).split( "" ).map( function ( c ) {
            return "%" + ("00" + c.charCodeAt( 0 ).toString( 16 )).slice( -2 );
        } ).join( "" ) );
    }

    /**
     * @static
     * @return {string}
     */
    static uuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function ( c ) {
            let r = Math.random() * 16 | 0, v = ( "x" === c ? r : ( r & 0x3 | 0x8 ) );
            return v.toString( 16 );

        } );
    }

    /**
     * @static
     * @param to
     * @param from
     * @param [ignoreFunction]
     */
    static deepCopy( to, from, ignoreFunction = true ) {
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

    /**
     * @static
     * @param collection
     * @param callback
     * @param [thisArg]
     */
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

    /**
     * @static
     * @param target
     * @param src
     * @return {boolean}
     */
    static eq( target, src ) {
        if ( (!CoreUtils.isNone( target ) && CoreUtils.isNone( src )) ||
            (CoreUtils.isNone( target ) && !CoreUtils.isNone( src )) ||
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

/**
 * @class StringUtils
 */
export class StringUtils {

    /**
     * @static
     * @param template
     * @param kwArgs
     * @param args
     * @return {string}
     */
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