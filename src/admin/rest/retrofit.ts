import { FetchRetrofit, Interceptor } from "@/retrofitjs";
import {
    GLOBAL_CACHE,
    REQUEST_ADDRESS,
    ResponseStatusEnum,
    ROUTER_KEY,
    TOKEN,
    IS_RE_LOGIN
} from "@admin/tools/constant";
import { RetrofitRequest, RetrofitResponse } from "@retrofitjs/support";
import { CoreUtils, AuthenticationException } from "@/core";

class AuthenticationInterceptor extends Interceptor {
    constructor() {
        super();
    }

    public preHandle( id: string, request: RetrofitRequest ): boolean {
        if ( CoreUtils.isNone( request.headers ) ) {
            request.headers = [];
        }

        // abort if not token
        if ( !localStorage.getItem( TOKEN ) ) {
            let router = GLOBAL_CACHE.get( ROUTER_KEY );

            if ( router.history.current.path !== "/login" ) {
                router.push( { path: "/login" } );
            }

            return false;
        }

        // added token to header
        request.headers[ "Authorization" ] = `Bearer ${localStorage.getItem( TOKEN )}`;

        return true;
    }

    public postHandle( id: string, response: RetrofitResponse ): RetrofitResponse {
        if ( response.body.statusCode !== ResponseStatusEnum.UNAUTHORIZED.statusCode ) {
            return response;
        }

        localStorage.removeItem( TOKEN );
        GLOBAL_CACHE.put( IS_RE_LOGIN, true );
        GLOBAL_CACHE.get( ROUTER_KEY ).push( { path: "/login" } );

        throw new AuthenticationException( "It meaning you must login before access the website if you see this exception." );
    }
}

export default new FetchRetrofit.Builder()
    .baseUrl( REQUEST_ADDRESS )
    .addInterceptor( new AuthenticationInterceptor() )
    .build();