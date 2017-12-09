/**
 * ##################################################
 *
 * fetch retrofit entity definition
 *
 * ##################################################
 */
import { HashMap, HashSet, Map, Set } from "../core/index";

export enum DataType {
    XML = "xml",
    HTML = "html",
    JSON = "json",
    TEXT = "text",
    SCRIPT = "script"
}

export class RequestHeader {
    key: string;
    value: string;

    constructor( key: string, value: string ) {
        this.key = key;
        this.value = value;
    }
}

export enum RequestMethod {
    GET = "GET",
    PUT = "PUT",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS",

    NONE = "NONE"
}

export class RequestDetails {
    public url: string = "";
    public retry: number = 0;
    public timeout: number = 0;
    public args: Array<string> = [];
    public requestBody: string = "";
    public multiPart: Array<string> = [];
    public responseBody: boolean = false;
    public method: RequestMethod = RequestMethod.NONE;
    public headers: Map<string, string> = new HashMap();
}

export class RetrofitRequest implements RequestInit {
    body: any;
    cache: RequestCache;
    credentials: RequestCredentials;
    headers: any;
    integrity: string;
    keepalive: boolean;
    method: string;
    mode: RequestMode;
    redirect: RequestRedirect;
    referrer: string;
    referrerPolicy: ReferrerPolicy;
    window: any;

    // extend field
    url: string;
    retry?: number;
    timeout?: number;
    dataType?: DataType;

    constructor( requestInit: RequestInit | RetrofitRequest | null = null ) {
        return requestInit ? Object.assign( this, requestInit ) : this;
    }
}

export class RetrofitResponse {
    body: any;
    headers: Headers;
    ok: boolean;
    status: number;
    statusText: string;
    type: ResponseType;
    url: string;

    constructor( response: Response ) {
        if ( !(response instanceof Response) ) {
            throw new TypeError( "RetrofitResponse require response object." );
        }

        this.ok = response.ok;
        this.url = response.url;
        this.type = response.type;
        this.status = response.status;
        this.headers = response.headers;
        this.statusText = response.statusText;
    }
}


/**
 * ##################################################
 *
 * fetch retrofit interceptor definition
 *
 * ##################################################
 */
export abstract class Interceptor extends Object {
    public order?: number = 0;

    public preHandle( id: string, request: RetrofitRequest ): boolean {
        return true;
    }

    public postHandle( id: string, response: RetrofitResponse ): RetrofitResponse {
        return response;
    }

    public failedHandle( id: string, raise: Error ): Error {
        return raise;
    }
}

abstract class InterceptorChain {
    private orderInterceptors: Array<Interceptor> = [];
    protected inOrder: boolean = false;
    private requestStack: any = {};

    private static onlyInterceptor( interceptor: Interceptor ) {
        if ( !( interceptor instanceof Interceptor) ) {
            throw new TypeError( `Expect interceptor but got ${typeof interceptor}` );
        }
    }

    protected ordered() {
        this.inOrder = true;

        this.orderInterceptors = this.getInterceptorChain().toArray();
        this.orderInterceptors.sort( ( a: Interceptor, b: Interceptor ): number => {
            if ( !a.order || a.order >= 10000 ) {
                a.order = 9000;
            }

            if ( !b.order || b.order >= 10000 ) {
                b.order = 9000;
            }

            return a.order === b.order ? 0 : a.order < b.order ? -1 : 1;
        } );
    }

    public addInterceptor( interceptor: Interceptor ) {
        InterceptorChain.onlyInterceptor( interceptor );
        this.getInterceptorChain().add( interceptor );
    }

    public removeInterceptor( interceptor: Interceptor ) {
        InterceptorChain.onlyInterceptor( interceptor );
        this.getInterceptorChain().remove( interceptor );
    }

    // true -> forward & false -> abort
    public forward( id: string, request: RetrofitRequest ): boolean {
        if ( !this.inOrder ) {
            this.ordered();
        }

        // meaning forward if return false in inner function,
        // because function 'some' will be stop if return true from inner function
        return !this.orderInterceptors.some( ( interceptor, index ) => {

            // record stack
            this.requestStack[ id ] = index;

            return !interceptor.preHandle( id, request );
        } );
    }

    public reverseForResponse( id: string, response: RetrofitResponse ): RetrofitResponse {
        if ( !this.inOrder ) {
            this.ordered();
        }

        let index = this.requestStack[ id ];
        delete this.requestStack[ id ];

        this.orderInterceptors.slice( 0, index + 1 ).reverse()
            .forEach( interceptor => response = interceptor.postHandle( id, response ) );

        return response;
    }

    public reverseForError( id: string, raise: Error ): Error {
        if ( !this.inOrder ) {
            this.ordered();
        }

        let index = this.requestStack[ id ];
        delete this.requestStack[ id ];

        this.orderInterceptors.slice( 0, index + 1 ).reverse()
            .forEach( interceptor => raise = interceptor.failedHandle( id, raise ) );

        return raise;
    }

    protected abstract getInterceptorChain(): Set<Interceptor>;
}

export class ApplicationInterceptorChain extends InterceptorChain {
    private interceptors: Set<Interceptor> = new HashSet();

    protected getInterceptorChain(): Set<Interceptor> {
        return this.interceptors;
    }

    public getInterceptors() {
        return this.interceptors.toArray();
    }


}

export class WebInterceptorChain extends InterceptorChain {
    private interceptors: Set<Interceptor> = new HashSet();

    protected getInterceptorChain(): Set<Interceptor> {
        return this.interceptors;
    }

    public getInterceptors() {
        return this.interceptors.toArray();
    }
}