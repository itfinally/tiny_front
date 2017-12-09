import Promise from "ts-promise";

import { retrofitFetchClient } from "./fetch";
import { ProxyHandler, Proxy } from "./declare/proxy";
import { AbortException } from "./exception";
import { ContentTypeInterceptor, DeserializerInterceptor, LoggerInterceptor } from "./interceptor";

import {
    ApplicationInterceptorChain, DataType, Interceptor,
    RequestDetails, RequestHeader, RequestMethod, RetrofitRequest
} from "./support";

import { IllegalArgumentException, IllegalStateException, NullPointException } from "../core/exception";
import { CoreUtils, HashMap, HashSet, Map, Set } from "../core/index";

export namespace decorators {
    let once: Set<string> = new HashSet(),

        methodMapping: Map<string, string> = new HashMap(),
        classMapping: Map<Function, string> = new HashMap(),
        details: Map<string, RequestDetails> = new HashMap(),
        requests: Map<string, RequestDetails> = new HashMap();

    export let collector = new class Collector {
        private static getConstructorDetails( target: Function ): RequestDetails {
            let part1: string = classMapping.get( target ),
                part2: string = methodMapping.get( "none" );

            // not found!
            if ( !(part1 && part2) ) {
                return (<any>null);
            }

            return details.get( `${part1}${part2}` );
        }

        // getting request details from prototype chain
        private static getMethodDetails( target: Function, method: string ): RequestDetails {
            // not found!
            if ( target === Object.prototype ) {
                return (<any>null);
            }

            let part1: string = classMapping.get( target ),
                part2: string = methodMapping.get( method ),
                key = `${part1}${part2}`;

            if ( details.containsKey( key ) ) {
                return details.get( key );
            }

            return Collector.getMethodDetails( Object.getPrototypeOf( target ), method );
        }

        // only calling by method 'apply' of proxy
        public getRequestDetail( target: object, method: string ): RequestDetails {

            // return if exist
            let constructor = target.constructor,
                methodId = Collector.getMethodId( constructor, method );

            if ( requests.containsKey( method ) ) {
                return Object.assign( new RequestDetails(), requests.get( methodId ) );
            }

            let constructorDetails = Collector.getConstructorDetails( constructor ),
                methodDetails = Collector.getMethodDetails( constructor, method ),
                targetRequest = new RequestDetails();

            if ( !(constructorDetails && methodDetails) ) {
                throw new NullPointException(
                    `Request Details is not found. Missing method proxy -> ${constructor.name}.${method}, 
                    It is a network request interface?`
                );
            }

            targetRequest.url = (constructorDetails.url ? `${constructorDetails.url}/${methodDetails.url}` : methodDetails.url)
                .replace( /\w(\/{2,})\w?/, ( match, key ) => match.replace( key, "/" ) );

            let baseHeaders = constructorDetails.headers,
                childHeaders = methodDetails.headers,
                header = targetRequest.headers;

            baseHeaders.keySet().toArray().concat( childHeaders.keySet().toArray() )
                .forEach( ( key: string ) => header.put( key, childHeaders.get( key ) || baseHeaders.get( key ) ) );

            targetRequest.method = (RequestMethod.NONE !== methodDetails.method ? methodDetails.method : constructorDetails.method);
            targetRequest.responseBody = methodDetails.responseBody;
            targetRequest.requestBody = methodDetails.requestBody;
            targetRequest.multiPart = methodDetails.multiPart;
            targetRequest.args = methodDetails.args;

            requests.put( methodId, targetRequest );
            return Object.assign( new RequestDetails(), targetRequest );
        }

        private static getMethodId( constructor: Function, method: string = "none" ): string {
            let part1: string = classMapping.get( constructor ),
                part2: string = methodMapping.get( method ),
                tempUUID: string = CoreUtils.uuid();

            if ( !part1 ) {
                part1 = tempUUID.substr( 0, 16 );
                classMapping.put( constructor, part1 );
            }

            if ( !part2 ) {
                part2 = tempUUID.substr( 16, 32 );
                methodMapping.put( method, part2 );
            }

            return `${part1}${part2}`;
        }

        private static getDetails( uuid: string ): RequestDetails {
            if ( !details.containsKey( uuid ) ) {
                let request = new RequestDetails();
                details.put( uuid, request );

                return request;
            }

            return details.get( uuid );
        }

        private static getKeys( target: Function | object, method: string, name: string ): Array<any> {
            // If target instance of Function, that means target is a constructor,
            // it can be get attribute from 'constructor.prototype'.
            // Otherwise, target is an instance, getting attribute from it self
            let self = target instanceof Function ? target : target.constructor,
                methodId = Collector.getMethodId( self, method ),
                alias = `${methodId}_${name}`;

            return [ methodId, alias ];
        }

        public header( key: string, value: string ): Function {
            let name = "header";

            return ( target: Function | object, method: string, descriptor: PropertyDescriptor ): PropertyDescriptor => {
                let [ uuid, alias ] = Collector.getKeys( target, method, name );

                if ( !once.contains( alias ) ) {
                    once.add( alias );
                    Collector.getDetails( uuid ).headers.put( key, value );
                }

                return descriptor;
            };
        }

        public headers( opts: Array<RequestHeader> ): Function {
            let name = "headers";

            return ( target: Object | Function, method: string, descriptor: PropertyDescriptor ): PropertyDescriptor => {
                let [ uuid, alias ] = Collector.getKeys( target, method, name );

                if ( !once.contains( alias ) ) {
                    once.add( alias );

                    let headers = Collector.getDetails( uuid ).headers;
                    opts.forEach( header => headers.put( header.key, header.value ) );
                }

                return descriptor;
            };
        }

        public requestMapping( url: string, requestMethod: RequestMethod = RequestMethod.NONE ): Function {
            let name = "requestMapping";

            return ( target: Object | Function, method: string, descriptor: PropertyDescriptor ): PropertyDescriptor => {
                let [ uuid, alias ] = Collector.getKeys( target, method, name );

                if ( !once.contains( alias ) ) {
                    once.add( alias );

                    let request = Collector.getDetails( uuid );
                    request.url = url;
                    request.method = requestMethod;
                }

                return descriptor;
            };
        }

        public args( parameters: Array<string> ): Function {
            let name = "args";

            return ( target: Object | Function, method: string, descriptor: PropertyDescriptor ): PropertyDescriptor => {
                let [ uuid, alias ] = Collector.getKeys( target, method, name );

                if ( !once.contains( alias ) && parameters ) {
                    once.add( alias );
                    Collector.getDetails( uuid ).args = parameters;
                }

                return descriptor;
            };
        }

        public requestBody( parameter: string ): Function {
            let name = "requestBody";

            return ( target: Object | Function, method: string, descriptor: PropertyDescriptor ): PropertyDescriptor => {
                let [ uuid, alias ] = Collector.getKeys( target, method, name );

                if ( !once.contains( alias ) && parameter ) {
                    once.add( alias );
                    Collector.getDetails( uuid ).requestBody = parameter;
                }

                return descriptor;
            };
        }

        public responseBody(): Function {
            let name = "responseBody";

            return ( target: Object | Function, method: string, descriptor: PropertyDescriptor ): PropertyDescriptor => {
                let [ uuid, alias ] = Collector.getKeys( target, method, name );

                if ( !once.contains( alias ) ) {
                    once.add( alias );
                    Collector.getDetails( uuid ).responseBody = true;
                }

                return descriptor;
            };
        }

        public multipart( parameter: Array<string> ): Function {
            let name = "multipart";

            return ( target: Object | Function, method: string, descriptor: PropertyDescriptor ): PropertyDescriptor => {
                let [ uuid, alias ] = Collector.getKeys( target, method, name );

                if ( !once.contains( alias ) && parameter ) {
                    once.add( alias );
                    Collector.getDetails( uuid ).multiPart = parameter;
                }

                return descriptor;
            };
        }
    };

    export function Header( key: string, value: string ): Function {
        return collector.header( key, value );
    }

    export function Headers( ...opts: Array<RequestHeader> ): Function {
        return collector.headers( opts );
    }

    export function RequestMapping( url: string, method: RequestMethod = RequestMethod.NONE ): Function {
        return collector.requestMapping( url, method );
    }

    export function GetMapping( url: string ): Function {
        return collector.requestMapping( url, RequestMethod.GET );
    }

    export function PostMapping( url: string ): Function {
        return collector.requestMapping( url, RequestMethod.POST );
    }

    export function PutMapping( url: string ): Function {
        return collector.requestMapping( url, RequestMethod.PUT );
    }

    export function DeleteMapping( url: string ): Function {
        return collector.requestMapping( url, RequestMethod.DELETE );
    }

    export function Args( ...parameters: Array<string> ): Function {
        return collector.args( parameters );
    }

    export function RequestBody( parameter: string ): Function {
        return collector.requestBody( parameter );
    }

    export function ResponseBody(): Function {
        return collector.responseBody();
    }

    export function MultiPart( ...parameter: Array<string> ): Function {
        return collector.multipart( parameter );
    }
}

namespace HttpRequest {
    let requestMethods: Set<RequestMethod> = new HashSet();

    requestMethods.add( RequestMethod.GET );
    requestMethods.add( RequestMethod.PUT );
    requestMethods.add( RequestMethod.POST );
    requestMethods.add( RequestMethod.PATCH );
    requestMethods.add( RequestMethod.DELETE );
    requestMethods.add( RequestMethod.OPTIONS );

    function getRestfulExpression(): RegExp {
        return /\/:(\w+)/g;
    }

    class Valid {
        private static urlChecking( url: string ): void {
            if ( !/^https?:\/\/.+/.test( url ) ) {
                throw new IllegalArgumentException( `Require legal url. ( in url: ${url} )` );
            }
        }

        private static requestMethodChecking( url: string, method: RequestMethod ): void {
            if ( !(method && requestMethods.contains( method ) ) ) {
                throw new IllegalArgumentException(
                    `Require one of method( use RequestMethod object ). ( in url: ${url} )`
                );
            }
        }

        private static parameterChecking( url: string, args: Array<any> = [], parameters: Array<string> = [] ): void {
            if ( parameters.length === args.length ) {
                return;
            }

            if ( args.length > parameters.length ) {
                throw new IllegalArgumentException(
                    `Missing parameters ( ${args.slice( parameters.length )} ). ( in url: ${url} )`
                );
            }

            if ( args.length < parameters.length ) {
                throw new IllegalArgumentException(
                    `Missing parameters declaration ( ${parameters.slice( args.length )} ). ( in url: ${url} )`
                );
            }
        }

        private static requestBodyChecking( url: string, requestBody: string, args: Array<string> ): void {
            if ( !requestBody ) {
                return;
            }

            let count: number = 0;

            if ( getRestfulExpression().test( url ) ) {
                url.replace( getRestfulExpression(), ( match, name ) => {
                    let index = args.indexOf( name );
                    if ( index >= 0 ) {
                        count += 1;
                    }

                    return match;
                } );
            }

            if ( count + 1 !== args.length ) {
                throw new IllegalArgumentException( `More than one parameter found in request body. ( in url: ${url} )` );
            }

            if ( args.indexOf( requestBody ) < 0 ) {
                throw new IllegalArgumentException( `Request body variable is not found in args ( ${requestBody} ). ( in url: ${url} )` );
            }
        }

        private static multiPartChecking( url: string, args: Array<string>, multiPartArgs: Array<string> ): void {
            multiPartArgs.forEach( name => {
                if ( -1 === args.indexOf( name ) ) {
                    throw new IllegalArgumentException( `Multi part variable is not found from args ( ${name} ). ( in url: ${url} )` );
                }
            } );
        }

        private static conflictChecking( requestBody: string, multiPartArgs: Array<string> ) {
            if ( requestBody && multiPartArgs.length > 0 ) {
                throw new IllegalStateException( "Cannot use request body and multi part in same time." );
            }
        }

        public static validation( detail: RequestDetails, parameters: Array<any> ) {
            Valid.urlChecking( detail.url );
            Valid.requestMethodChecking( detail.url, detail.method );
            Valid.parameterChecking( detail.url, detail.args, parameters );

            Valid.conflictChecking( detail.requestBody, detail.multiPart );
            Valid.multiPartChecking( detail.url, detail.args, detail.multiPart );
            Valid.requestBodyChecking( detail.url, detail.requestBody, detail.args );
        }
    }

    class Builder {
        private static buildRestfulUrl( url: string, args: Array<string>, parameter: Array<any> ): string {
            if ( Object.keys( args ).length <= 0 ) {
                return url;
            }

            return url.replace( getRestfulExpression(), ( match: string, name: string ): string => {
                let index = args.indexOf( name );
                return index >= 0 ? `/${parameter[ index ]}` : match;
            } );
        }

        private static buildSimpleUrl( url: string, args: Array<string>, parameter: Array<any> ): string {
            if ( args.length <= 0 ) {
                return url;
            }

            let body: Array<string> = [];

            args.forEach( ( name, index ) => body.push( `${name}=${parameter[ index ]}` ) );
            return -1 === url.indexOf( "?" ) ? `${url}?${body.join( "&" )}` : `${url}&${body.join( "&" )}`;
        }

        public static urlBuilder( url: string, args: any, parameter: Array<any> ): string {
            return getRestfulExpression().test( url ) ?
                Builder.buildRestfulUrl( url, args, parameter ) : Builder.buildSimpleUrl( url, args, parameter );
        }

        public static headerBuilder( headers: Map<string, string> ): object {
            let _header: any = {};

            for ( let entry of headers.entrySet() ) {
                _header[entry.key] = entry.value;
            }

            // headers.keys().forEach( name => _header[ name ] = headers.get( name ) );
            return _header;
        }

        private static getIgnoreArgs( url: string, args: Array<string> ): Set<number> {
            let ignore: Set<number> = new HashSet();

            url.replace( getRestfulExpression(), ( match, name ) => {
                let index = args.indexOf( name );
                if ( index >= 0 ) {
                    ignore.add( index );
                }

                return match;
            } );

            return ignore;
        }

        private static formBodyBuilder( url: string, args: Array<string>, parameters: Array<any> ): string {
            let formBody: Array<string> = [],
                ignore: Set<number> = Builder.getIgnoreArgs( url, args );

            args.forEach( ( name, index ) => {
                if ( ignore.contains( index ) ) {
                    return;
                }

                formBody.push( `${name}=${parameters[ index ]}` );
            } );

            return formBody.join( "&" );
        }

        private static requestBodyBuilder( bodyName: string, args: Array<string>, parameters: Array<any> ): string {
            return JSON.stringify( parameters[ args.indexOf( bodyName ) ] );
        }

        private static multiPartBuilder( url: string, args: Array<string>, parameters: Array<any> ): FormData {
            let body = new FormData(),
                ignore: Set<number> = Builder.getIgnoreArgs( url, args );

            args.forEach( ( name, index ) => {
                if ( ignore.contains( index ) ) {
                    return;
                }

                body.set( name, parameters[ index ] );
            } );

            return body;
        }

        public static bodyBuilder( details: RequestDetails, parameters: Array<any> ): any {
            if ( details.requestBody ) {
                return Builder.requestBodyBuilder( details.requestBody, details.args, parameters );
            }

            if ( details.multiPart.length > 0 ) {
                return Builder.multiPartBuilder( details.url, details.args, parameters );
            }

            return Builder.formBodyBuilder( details.url, details.args, parameters );
        }
    }

    function translateToGet( details: RequestDetails, parameters: Array<any> ): RetrofitRequest {
        let request: RetrofitRequest = new RetrofitRequest();

        request.url = Builder.urlBuilder( details.url, details.args, parameters );
        request.headers = Builder.headerBuilder( details.headers );
        request.method = details.method;

        return request;
    }

    function translateToPost( details: RequestDetails, parameters: Array<any> ): RetrofitRequest {
        let request: RetrofitRequest = new RetrofitRequest();

        request.url = Builder.urlBuilder( details.url, details.args, parameters );
        request.headers = Builder.headerBuilder( details.headers );
        request.body = Builder.bodyBuilder( details, parameters );
        request.method = details.method;

        return request;
    }

    export function translator( details: RequestDetails, parameters: Array<any> ): RetrofitRequest {
        Valid.validation( details, parameters );

        let request: RetrofitRequest = new RetrofitRequest();

        if ( RequestMethod.GET === details.method ) {
            request = translateToGet( details, parameters );
        }

        if ( RequestMethod.POST === details.method ) {
            request = translateToPost( details, parameters );
        }

        request.timeout = details.timeout;
        if ( details.responseBody ) {
            request.dataType = DataType.JSON;
        }

        return request;
    }
}

export namespace FetchRetrofit {
    let handlers: Map<object, ProxyHandler<any>> = new HashMap();

    class Handler<T> extends ProxyHandler<T> {
        private collector = decorators.collector;
        private builder: Builder;
        private proxyCls: any;

        constructor( builder: Builder ) {
            super();
            this.builder = builder;
        }

        construct( nativeCls: any, propKey: string ): any {
            let childPrototype = nativeCls.prototype,
                methods = this.trackPrototypeChain( nativeCls.prototype );

            // Binding native class for type checking.
            this.proxyCls = nativeCls;

            // In order to make 'thisArg' parameter pointer to instance who activation 'apply' method,
            // should be overwrite prototype object of this instance, and added methods from all parent prototype,
            // also it can be avoided to traverse prototype chain when method called.
            let instance = new nativeCls();
            methods.forEach( name => instance[ name ] = Proxy.newProxy( childPrototype[ name ], this ) );

            return instance;
        }

        // 'thisArg' parameter must be instance of native class( see 'construct' method parameter -> 'nativeCls' )
        apply( method: any, thisArg: T, parameters: Array<any> ): Promise<any> {
            if ( this.proxyCls && !( thisArg instanceof this.proxyCls ) ) {
                throw new IllegalStateException(
                    "Cannot call with other object. " +
                    "( should be binding with original class if is necessary )"
                );
            }

            let basedDetails = this.collector.getRequestDetail( (<any>thisArg), method.name ),
                details = this.merge( basedDetails ),
                request = HttpRequest.translator( details, parameters ),

                requestId = CoreUtils.uuid(),
                chain: ApplicationInterceptorChain = this.builder._chain;

            if ( !chain.forward( requestId, request ) ) {
                return Promise.reject( chain.reverseForError( requestId, new AbortException( `Request ${request.url} has been aborted.` ) ) );
            }

            return retrofitFetchClient( request.url, request ).then(
                response => chain.reverseForResponse( requestId, response ),
                raise => (<any>chain.reverseForError( requestId, raise ))
            );
        }

        private merge( details: RequestDetails ): RequestDetails {
            let builder = this.builder;

            if ( !/^https?:\/\/.+/.test( details.url ) ) {
                details.url = `${builder._baseUrl}/${details.url}`
                    .replace( /\w(\/{2,})\w?/, ( match, key ) => match.replace( key, "/" ) )
            }

            details.timeout = builder._timeout;
            details.retry = 3;

            return details;
        }

        private trackPrototypeChain( prototype: any, methods: Array<string> = [] ): Array<string> {
            if ( prototype === Object.prototype ) {
                return methods.filter( name => name !== "constructor" );
            }

            return this.trackPrototypeChain(
                Object.getPrototypeOf( prototype ),
                methods.concat( Object.getOwnPropertyNames( prototype ) )
            );
        }
    }

    export class Builder {
        _debug: boolean;
        _baseUrl: string = "";
        _timeout: number = 5000;
        _byBuilder: boolean = false;
        _chain: ApplicationInterceptorChain = new ApplicationInterceptorChain();

        addInterceptor( interceptor: Interceptor ): Builder {
            this._chain.addInterceptor( interceptor );
            return this;
        }

        baseUrl( url: string ): Builder {
            this._baseUrl = url;
            return this;
        }

        timeout( timeout: number ): Builder {
            this._timeout = timeout;
            return this;
        }

        debug( debug: boolean ): Builder {
            this._debug = debug;
            return this;
        }

        build() {
            this.addInterceptor( new LoggerInterceptor( this._debug ) )
                .addInterceptor( new ContentTypeInterceptor() )
                .addInterceptor( new DeserializerInterceptor() );

            this._byBuilder = true;
            return new FetchRetrofit( this );
        }
    }

    export class FetchRetrofit {
        private builder: Builder;

        constructor( builder: FetchRetrofit.Builder ) {
            if ( !builder._byBuilder ) {
                throw new IllegalStateException( "Should be new by builder." );
            }

            this.builder = builder;
        }

        public create<T>( cls: any ): T {
            let handler: ProxyHandler<T>;

            if ( !(cls instanceof Object) ) {
                throw new TypeError( `Expect Class object but got ${typeof cls}` );
            }

            if ( handlers.containsKey( cls ) ) {
                handler = handlers.get( cls );

            } else {
                handler = new Handler( this.builder );
                handlers.put( cls, handler );
            }

            // "Proxy.newProxy" will be return a proxy Class
            return new (Proxy.newProxy<any>( cls, handler ))();
        }
    }
}