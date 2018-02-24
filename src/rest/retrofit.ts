import { Chain, Interceptor, ResponseInterface, Retrofit, RetrofitConfig } from "retrofitjs";
import {
  GLOBAL_CACHE, IS_RE_LOGIN, REQUEST_ADDRESS, ResponseStatusEnum, ROUTER_KEY, TOKEN,
  VUE_KEY
} from "@/tools/constant";
import { CoreUtils } from "jcdt";

class AuthenticationInterceptor implements Interceptor {
  public order: number = 9999;


  public init( config: RetrofitConfig ): void {
  }

  public async intercept( chain: Chain ): Promise<ResponseInterface<any>> {
    let request = chain.request(),
      vue = GLOBAL_CACHE.get( VUE_KEY );

    if ( CoreUtils.isNone( request.headers ) ) {
      request.headers = {};
    }

    // abort if not token
    if ( !localStorage.getItem( TOKEN ) ) {
      let router = GLOBAL_CACHE.get( ROUTER_KEY );

      if ( router.history.current.path !== "/login" ) {
        router.push( { path: "/login" } );
      }

      vue.$Message.warning( { "content": "请先登录再访问" } );
      return Promise.reject( null );
    }

    // added token to header
    request.headers[ "Authorization" ] = `Bearer ${localStorage.getItem( TOKEN )}`;

    let response: ResponseInterface<any> = await chain.proceed( request );

    if ( response.data.statusCode !== ResponseStatusEnum.UNAUTHORIZED.statusCode ) {
      return response;
    }

    localStorage.removeItem( TOKEN );
    GLOBAL_CACHE.put( IS_RE_LOGIN, true );
    GLOBAL_CACHE.get( ROUTER_KEY ).push( { path: "/login" } );

    vue.$Message.warning( { "content": "请先登录再访问" } );
    return Promise.reject( null );
  }
}

export default Retrofit.getBuilder()
  .setConfig<RetrofitConfig>( {
    baseURL: REQUEST_ADDRESS,
    timeout: 0
  } )
  .addInterceptor( new AuthenticationInterceptor() )
  .build();