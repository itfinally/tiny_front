import "ts-promise"

import { DataType, Interceptor, RetrofitRequest, RetrofitResponse } from "./support";
import { HashMap, Map } from "../core/index";

export class LoggerInterceptor extends Interceptor {
    public order: number = 9990;

    private debug: boolean;
    private requestMap: Map<string, any> = new HashMap();

    constructor( debug: boolean = false ) {
        super();

        this.debug = debug;
    }

    public preHandle( id: string, request: RetrofitRequest ): boolean {
        if ( !this.debug ) {
            return true;
        }

        this.requestMap.put( id, {
            "start": (Date.now || new Date().getTime)(),
            "request": request
        } );

        return true;
    }

    public postHandle( id: string, response: RetrofitResponse ): RetrofitResponse {
        if ( !this.debug ) {
            return response;
        }

        let curRequest = this.requestMap.get( id ),
            startTime: number = curRequest[ "start" ],
            request: RetrofitRequest = curRequest[ "request" ];

        this.requestMap.remove( id );

        this.requestLogger( request );

        console.group( "\n------------------ Response information ------------------\n" );
        console.log( `Response time: ${(Date.now || new Date().getTime)() - startTime}ms` );
        console.log( `Response status: ${response.status}` );
        console.log( `Response status text: ${response.statusText}` );

        console.groupCollapsed( "Headers:" );
        let responseHeaders = response.headers;
        responseHeaders.forEach( ( value: string, name: string ) => console.log( `${name}:  ${value}` ) );
        console.groupEnd();

        console.groupEnd();

        console.log( "\n\n\n\n" );
        return response;
    }

    public failedHandle( id: string, raise: Error ): Error {
        if ( !this.debug ) {
            return raise;
        }

        let curRequest = this.requestMap.get( id ),
            request: RetrofitRequest = curRequest[ "request" ];

        this.requestMap.remove( id );
        this.requestLogger( request );

        console.group( "\n------------------ Request Error ------------------\n" );
        console.log( `Error: ${raise.name}` );
        console.log( `message: ${raise.message}` );
        console.groupEnd();

        return raise;
    }

    private requestLogger( request: RetrofitRequest ) {
        console.group( "\n------------------ Request information ------------------\n" );

        console.log( `url: ${request.url} ${request.method}` );

        console.groupCollapsed( "Headers:" );
        let requestHeaders = request.headers;
        Object.keys( requestHeaders ).forEach( name => console.log( `${name}:  ${requestHeaders[ name ]}` ) );
        console.groupEnd();

        let requestBody = request.body;
        if ( requestBody ) {
            if ( typeof requestBody === "string" ) {
                console.log( `body ${requestBody}` );
            }

            if ( requestBody instanceof FormData ) {
                let entries = requestBody.entries(),
                    next = entries.next();

                console.groupCollapsed( "Body: " );

                while ( !next.done ) {
                    console.log( `${next.value[ 0 ]} --> ${next.value[ 1 ]}` );
                }

                console.groupEnd();
            }
        }

        console.groupEnd();
    }
}


export class ContentTypeInterceptor extends Interceptor {
    public order: number = 9800;

    public preHandle( id: string, request: RetrofitRequest ): boolean {
        if ( typeof request.body === "string" && /^{.+}$/.test( request.body ) ) {
            request.headers[ "Content-Type" ] = "application/json";
        }

        if ( request.body instanceof FormData ) {
            delete request.headers[ "Content-Type" ];
        }

        return true;
    }
}


export class DeserializerInterceptor extends Interceptor {
    public order: number = 9700;

    private requestMap: Map<string, DataType | undefined> = new HashMap();

    public preHandle( id: string, request: RetrofitRequest ): boolean {
        this.requestMap.put( id, request.dataType );
        return true;
    }

    public postHandle( id: string, response: RetrofitResponse ): RetrofitResponse {
        let dataType = this.requestMap.get( id );
        this.requestMap.remove( id );

        if ( DataType.JSON === dataType ) {
            response.body = JSON.parse( response.body );
        }

        return response;
    }
}