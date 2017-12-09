import { FetchRetrofit, Interceptor } from "@retrofitjs/index";
import { TOKEN } from "@admin/config/cache_key";

console.log( Interceptor.prototype );

class AuthenticationInterceptor extends Interceptor {
    constructor() {
        super();
    }

    preHandle( id, request ) {
        return super.preHandle( id, request );
    }

    postHandle( id, response ) {
        return super.postHandle( id, response );
    }
}

export default new FetchRetrofit.Builder()
    .baseUrl( "http://127.0.0.1:8080" )
    .addInterceptor( new AuthenticationInterceptor() )
    .build();