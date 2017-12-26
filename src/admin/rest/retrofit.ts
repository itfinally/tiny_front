import { Chain, FetchRetrofit, Interceptor, RetrofitResponse } from "@/retrofitjs";
import {
    GLOBAL_CACHE,
    REQUEST_ADDRESS,
    ResponseStatusEnum,
    ROUTER_KEY,
    TOKEN,
    IS_RE_LOGIN
} from "@admin/tools/constant";
import { CoreUtils, AuthenticationException } from "@/core";

class AuthenticationInterceptor implements Interceptor {

    public async intercept( chain: Chain ): Promise<RetrofitResponse> {
        let request = chain.request();

        if ( CoreUtils.isNone( request.headers ) ) {
            request.headers = [];
        }

        // abort if not token
        if ( !localStorage.getItem( TOKEN ) ) {
            let router = GLOBAL_CACHE.get( ROUTER_KEY );

            if ( router.history.current.path !== "/login" ) {
                router.push( { path: "/login" } );
            }

            return Promise.reject( new AuthenticationException() );
        }

        // added token to header
        request.headers[ "Authorization" ] = `Bearer ${localStorage.getItem( TOKEN )}`;

        let response = await chain.proceed( request );

        if ( response.body.statusCode !== ResponseStatusEnum.UNAUTHORIZED.statusCode ) {
            return response;
        }

        localStorage.removeItem( TOKEN );
        GLOBAL_CACHE.put( IS_RE_LOGIN, true );
        GLOBAL_CACHE.get( ROUTER_KEY ).push( { path: "/login" } );

        return Promise.reject( new AuthenticationException(
            "It meaning you must login before access the website if you see this exception."
        ) );
    }
}

export default new FetchRetrofit.Builder()
    .baseUrl( REQUEST_ADDRESS )
    .timeout( 0 )
    .addInterceptor( new AuthenticationInterceptor() )
    .build();