import { Chain, Interceptor, ResponseInterface, Retrofit, RetrofitConfig, RetrofitResponse } from "retrofitjs";
import { address, GLOBAL_CACHE, IS_RE_LOGIN, ROUTER_KEY, TOKEN, VUE_KEY } from "@/tiny/support/commons";
import { CoreUtils, Exception } from "jcdt";
import { ResponseStatus } from "@/tiny/support/status";
import { AxiosResponse } from "axios";
import { UnAuthenticationException } from "@/tiny/support/exception";

interface BasicResponseBasic {
  code: Number;
  message: String;
}

interface SingleResponseBasic<T> extends BasicResponseBasic {
  result: T
}

interface ListResponseBasic<T> extends BasicResponseBasic {
  result: T[]
}

export type BasicResponse = Promise<RetrofitResponse<BasicResponseBasic>> & void;
export type ListResponse<T> = Promise<RetrofitResponse<ListResponseBasic<T>>> & void;
export type SingleResponse<T> = Promise<RetrofitResponse<SingleResponseBasic<T>>> & void;

class AuthenticationInterceptor implements Interceptor {
  public order: number = 9999;

  init( config: RetrofitConfig ): void {
  }

  async intercept( chain: Chain ): Promise<ResponseInterface<any>> {
    let request = chain.request();

    if ( CoreUtils.isNone( request.headers ) ) {
      request.headers = {};
    }

    // abort if not token
    if ( !localStorage.getItem( TOKEN ) ) {
      let router = GLOBAL_CACHE.get( ROUTER_KEY );

      if ( router.history.current.path !== "/login" ) {
        router.push( { path: "/login" } );
      }

      return Promise.reject( new UnAuthenticationException( "请先登录再访问" ) );
    }

    // Add token to header
    request.headers[ "Authorization" ] = `Bearer ${localStorage.getItem( TOKEN )}`;

    let response: ResponseInterface<BasicResponseBasic> = await chain.proceed( request );

    if ( response.data.code !== ResponseStatus.UNAUTHORIZED.code ) {
      return response;
    }

    localStorage.removeItem( TOKEN );
    GLOBAL_CACHE.put( IS_RE_LOGIN, true );
    GLOBAL_CACHE.get( ROUTER_KEY ).push( { path: "/login" } );

    return Promise.reject( new UnAuthenticationException( "请先登录再访问" ) );
  }
}

export let retrofit = Retrofit.getBuilder()
  .setConfig<RetrofitConfig>( {
    baseURL: address,
    timeout: 0
  } )
  .setErrorHandler( {
    handler( realReason: any, exception: Exception ) {
      if ( exception instanceof UnAuthenticationException ) {
        GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { content: exception.message } );
        return;
      }

      // Report error
      console.error( [ realReason, exception ] );
    }
  } )
  .addInterceptor( new AuthenticationInterceptor() )
  .build();

export async function authentication( account: String, password: String, verifyCode: String,
                                      successCallback: ( response: AxiosResponse<any> ) => null,
                                      failedCallback: ( response: AxiosResponse<any> ) => null ) {

  let basic = CoreUtils.base64Encoder( `${account}:${password}` ),
    response: AxiosResponse<any> = await retrofit.getEngine().post( `${address}/verifies/login`, { verifyCode }, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${basic}`
      }
    } );

  let content: any = response.data;

  if ( response.status !== ResponseStatus.SUCCESS.code ) {
    GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": "登陆失败, 请查看控制台了解更多信息" } );
    console.warn( content );
    return;
  }

  if ( content.code !== ResponseStatus.SUCCESS.code ) {
    GLOBAL_CACHE.get( VUE_KEY ).$Message.error( { "content": `登录失败, ${content.message}` } );
    failedCallback( response );
    return;
  }

  // Save token
  localStorage.setItem( TOKEN, content.result );

  // Back to previous path
  if ( GLOBAL_CACHE.get( IS_RE_LOGIN ) ) {
    GLOBAL_CACHE.remove( IS_RE_LOGIN );
    GLOBAL_CACHE.get( ROUTER_KEY ).go( -1 );
    return;
  }

  successCallback( response );
  GLOBAL_CACHE.get( ROUTER_KEY ).replace( { "path": "/console" } );
}