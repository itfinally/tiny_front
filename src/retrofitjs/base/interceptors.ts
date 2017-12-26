import { Chain, DataType, Interceptor, RetrofitRequest, RetrofitResponse } from "@/retrofitjs/base/support";
import { retrofitFetchClient } from "@/retrofitjs/base/fetch";
import { Map, HashMap, CoreUtils, NullPointException } from "@/core";

export class RealCall implements Interceptor {
    public order: number = 9999;

    public intercept( chain: Chain ): Promise<RetrofitResponse> {
        let request: RetrofitRequest = chain.request();

        return retrofitFetchClient( <string>request.url, request );
    }
}

export class CacheInterceptor implements Interceptor {
    private cache: Map<string, RetrofitResponse> = new HashMap();
    public order: number = 9995;

    public async intercept( chain: Chain ): Promise<RetrofitResponse> {
        let url = <string>chain.request().url,
            key = `${url}_${CoreUtils.hashCode( url )}`;

        if ( this.cache.containsKey( key ) ) {
            return Promise.resolve( this.cache.get( key ) );
        }

        let response = await chain.proceed( chain.request() );
        this.cache.put( key, response );

        return Promise.reject( response );
    }
}

export class LoggerInterceptor implements Interceptor {
    public order: number = 9990;
    private debug: boolean = false;

    public constructor( debug: boolean ) {
        this.debug = debug;
    }

    public async intercept( chain: Chain ): Promise<RetrofitResponse> {
        if ( !this.debug ) {
            return chain.proceed( chain.request() );
        }

        let response,
            request = chain.request(),
            startTime = (Date.now || new Date().getTime)();

        try {
            response = await chain.proceed( request );

        } catch ( e ) {
            LoggerInterceptor.failure( e );
            return <Promise<any>>Promise.reject( e );

        } finally {
            this.before( request );
        }

        this.after( startTime, response );

        return Promise.resolve( response );
    }

    private before( request: RetrofitRequest ): void {
        console.group( "\n------------------ Request information ------------------\n" );

        console.log( `url: ${request.url} ${request.method}` );

        console.groupCollapsed( "Headers:" );
        let requestHeaders = request.headers;
        if ( requestHeaders ) {
            Object.keys( requestHeaders ).forEach( name =>
                console.log( `${name}:  ${requestHeaders[ name ]}` ) );
        }

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

        console.log( "\n\n" );
    }

    private after( startTime: number, response: RetrofitResponse ): void {
        console.group( "\n------------------ Response information ------------------\n" );
        console.log( `Response time: ${(Date.now || new Date().getTime)() - startTime}ms` );
        console.log( `Response status: ${response.status}` );
        console.log( `Response status text: ${response.statusText}` );

        console.groupCollapsed( "Headers:" );
        let responseHeaders = response.headers;
        responseHeaders.forEach( ( value: string, name: string ) => console.log( `${name}:  ${value}` ) );
        console.groupEnd();

        console.groupEnd();

        console.log( "\n\n" );
    }

    private static failure( raise: Error ): void {
        console.group( "\n------------------ Request Error ------------------\n" );
        console.log( `Error: ${raise.name}` );
        console.log( `message: ${raise.message}` );
        console.groupEnd();
    }
}

export class ContentTypeInterceptor implements Interceptor {
    public order: number = 9900;

    public intercept( chain: Chain ): Promise<RetrofitResponse> {
        let request = chain.request();

        if ( request.body instanceof FormData ) {
            delete request.headers[ "Content-Type" ];
        }

        return chain.proceed( request );
    }
}

export class DeserializerInterceptor implements Interceptor {
    public order: number = 9700;

    public async intercept( chain: Chain ): Promise<RetrofitResponse> {
        let request = chain.request(),
            response = await chain.proceed( request );

        if ( DataType.JSON === request.dataType ) {
            response.body = JSON.parse( response.body );
        }

        return Promise.resolve( response );
    }
}