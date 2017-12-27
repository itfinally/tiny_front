import { Map, HashMap, IllegalStateException } from "@/core";
import { ProxyHandler, Proxy } from "@retrofitjs/declare/proxy";
import { getRequestDetail } from "@/retrofitjs/base/decorators";
import {
    ApplicationInterceptorChainActor, Interceptor, InterceptorChainActor,
    RequestDetails, RetrofitRequest, RetrofitResponse
} from "@/retrofitjs/base/support";
import { RequestBuilder } from "@/retrofitjs/base/builder";
import {
    ContentTypeInterceptor, DeserializerInterceptor, LoggerInterceptor,
    RealCall, CacheInterceptor,
} from "@/retrofitjs/base/interceptors";


class RequestClientProxies<T> extends ProxyHandler<T> {
    private proxyCls: any;
    private configure: RetrofitConfigure;

    public constructor( configure: RetrofitConfigure ) {
        super();
        this.configure = configure;
    }

    public construct( nativeCls: any, propKey: string ): T {
        let childPrototype = nativeCls.prototype,
            methods = this.scanMethodFromPrototypeChain( nativeCls.prototype );

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
    public apply( method: any, thisArg: T, parameters: Array<any> ): Promise<any> {
        if ( this.proxyCls && !( thisArg instanceof this.proxyCls ) ) {
            throw new IllegalStateException(
                "Cannot call with other object. " +
                "( should be binding with original class if is necessary )"
            );
        }

        let basedDetails = getRequestDetail( (<any>thisArg), method.name ),
            request = new RequestBuilder( this.configureMerge( basedDetails ), parameters ).build();

        let catcher = this.configure.catcher,
            future = this.configure.interceptor.intercept( request );

        return !catcher
            ? future
            : future.catch( ( raise: Error | RetrofitResponse ) => catcher( request, raise ) );
    }

    private scanMethodFromPrototypeChain( prototype: any, methods: Array<string> = [] ): Array<string> {
        if ( prototype === Object.prototype ) {
            return methods.filter( name => name !== "constructor" );
        }

        return this.scanMethodFromPrototypeChain(
            Object.getPrototypeOf( prototype ),
            methods.concat( Object.getOwnPropertyNames( prototype ) )
        );
    }

    private configureMerge( details: RequestDetails ): RequestDetails {
        let configure = this.configure;

        if ( !/^https?:\/\/.+/.test( details.url ) ) {
            details.url = `${configure.baseUrl}/${details.url}`
                .replace( /\w(\/{2,})\w?/, ( match, key ) => match.replace( key, "/" ) )
        }

        details.timeout = configure.timeout;
        details.retry = 3;

        return details;
    }
}


interface RetrofitConfigure {
    retry: number;
    debug: boolean;
    baseUrl: string;
    timeout: number;
    catcher: ( request: RetrofitRequest, raise: Error | RetrofitResponse ) => void;
    interceptor: InterceptorChainActor;
}

export class FetchRetrofit {
    public static Builder = class {
        private _baseUrl: string;
        private _retry: number = 3;
        private _debug: boolean = false;
        private _timeout: number = 5000;
        private exceptionCatcher: ( request: RetrofitRequest, raise: Error | RetrofitResponse ) => void;
        private interceptorActor: InterceptorChainActor = new ApplicationInterceptorChainActor();

        public baseUrl( url: string ): this {
            this._baseUrl = url;
            return this;
        }

        public retry( tryTime: number ): this {
            this._retry = tryTime;
            return this;
        }

        public debug( isDebug: boolean ): this {
            this._debug = isDebug;
            return this;
        }

        public timeout( time: number ): this {
            this._timeout = time;
            return this;
        }

        public addExceptionProcessor( func: ( request: RetrofitRequest, raise: Error | RetrofitResponse ) => void ): this {
            this.exceptionCatcher = func;
            return this;
        }

        public addInterceptor( interceptor: Interceptor ): this {
            this.interceptorActor.addInterceptor( interceptor );
            return this;
        }

        build(): FetchRetrofit {
            this.interceptorActor.addInterceptor( new RealCall() )
                .addInterceptor( new LoggerInterceptor( this._debug ) )
                // .addInterceptor( new CacheInterceptor() )
                .addInterceptor( new ContentTypeInterceptor() )
                .addInterceptor( new DeserializerInterceptor() );

            return new FetchRetrofit( {
                retry: this._retry,
                debug: this._debug,
                baseUrl: this._baseUrl,
                timeout: this._timeout,
                catcher: this.exceptionCatcher,
                interceptor: this.interceptorActor
            } );
        }
    };

    private configure: RetrofitConfigure;
    private proxiesMap: Map<object, ProxyHandler<any>> = new HashMap();

    private constructor( configure: RetrofitConfigure ) {
        this.configure = configure;
    }

    public create<T>( cls: any ): T {
        if ( !(cls instanceof Object) ) {
            throw new TypeError( `Expect Class object but got ${typeof cls}` );
        }

        let proxies: ProxyHandler<T>,
            proxiesMap = this.proxiesMap;

        if ( proxiesMap.containsKey( cls ) ) {
            proxies = proxiesMap.get( cls );

        } else {
            proxies = new RequestClientProxies( this.configure );
            proxiesMap.put( cls, proxies );
        }

        // "Proxy.newProxy" will be return a proxy Class
        return new (Proxy.newProxy<any>( cls, proxies ))();
    }
}