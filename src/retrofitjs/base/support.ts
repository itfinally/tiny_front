import { CoreUtils, HashMap, HashSet, IllegalArgumentException, Map, NullPointException, Set } from "@/core";

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
    body?: any;
    cache?: RequestCache;
    credentials?: RequestCredentials;
    headers?: any;
    integrity?: string;
    keepalive?: boolean;
    method?: string;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    window?: any;

    // extend field
    url?: string;
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

    constructor( response?: Response ) {
        if ( CoreUtils.isNone( response ) ) {
            return;
        }

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

export interface Interceptor {
    order?: number;

    intercept( chain: Chain ): Promise<RetrofitResponse>
}

export interface Chain {
    proceed( request: RetrofitRequest ): Promise<RetrofitResponse>

    request(): RetrofitRequest
}

export abstract class InterceptorChainActor {
    private orderInterceptors: Array<Interceptor>;
    private inOrder: boolean = false;

    public abstract getInterceptors(): Set<Interceptor>;

    public intercept( request: RetrofitRequest ): Promise<RetrofitResponse> {
        if ( !(request instanceof RetrofitRequest) ) {
            throw new IllegalArgumentException( "Require retrofit request object." );
        }

        if ( !this.inOrder ) {
            this.sort();
        }

        let that = this,
            chain: Chain = new class implements Chain {
                private index: number = 0;
                private length: number = that.orderInterceptors.length;

                // this is a reverse function
                // this-proceed -> interceptor-proceed-1 -> this-proceed -> interceptor-proceed-2 -> ...
                public proceed( request: RetrofitRequest ): Promise<RetrofitResponse> {
                    if ( CoreUtils.isNone( request ) ) {
                        throw new NullPointException( "Request must not be null." );
                    }

                    let result: Promise<RetrofitResponse> = this.index < this.length
                        ? that.orderInterceptors[ this.index++ ].intercept( this )
                        : new Promise( resolve => resolve( new RetrofitResponse() ) );

                    this.index -= 1;
                    return result;
                }

                public request(): RetrofitRequest {
                    return request;
                }
            };

        return chain.proceed( request );
    }

    private sort() {
        this.inOrder = true;

        this.orderInterceptors = this.getInterceptors().toArray();
        this.orderInterceptors.sort( ( a: Interceptor, b: Interceptor ): number => {
            if ( !CoreUtils.isNumber( a.order ) || <number>a.order >= 10000 ) {
                a.order = 9000;
            }

            if ( !CoreUtils.isNumber( b.order ) || <number>b.order >= 10000 ) {
                b.order = 9000;
            }

            return a.order === b.order ? 0 : <number>a.order < <number>b.order ? -1 : 1;
        } );
    }

    public addInterceptor( interceptor: Interceptor ): this {
        this.getInterceptors().add( interceptor );
        return this;
    }

    public removeInterceptor( interceptor: Interceptor ): boolean {
        return this.getInterceptors().remove( interceptor );
    }
}

export class ApplicationInterceptorChainActor extends InterceptorChainActor {
    private interceptors: Set<Interceptor> = new HashSet();

    public getInterceptors(): Set<Interceptor> {
        return this.interceptors;
    }
}

export class WebApplicationInterceptorChainActor extends InterceptorChainActor {
    private interceptors: Set<Interceptor> = new HashSet();

    public getInterceptors(): Set<Interceptor> {
        return this.interceptors;
    }
}