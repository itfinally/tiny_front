import { Lang, HashMap, Map, IllegalArgumentException } from "jcdt";

export class BasicEnum<SubEnum> {
  private static enums: Map<Function, any[]> = new HashMap();

  protected constructor() {
    let enums = BasicEnum.enums,
      constructor = Object.getPrototypeOf( this ).constructor;

    if ( !enums.containsKey( constructor ) ) {
      enums.put( constructor, [] );
    }

    enums.get( constructor ).push( this );
  }

  // it will be implicit call by THIS if naming 'valueOf'
  public static of<SubEnum>( name: string ): SubEnum {
    if ( !this.hasOwnProperty( name ) ) {
      throw new IllegalArgumentException( `enum '${name}' is not found from ${this.name}` );
    }

    return ( <any>this )[ name ];
  }

  public static values<SubEnum>(): SubEnum[] {
    return BasicEnum.enums.getOrDefault( this, [] );
  }
}

export class ResponseStatus extends BasicEnum<ResponseStatus> {
  public static SUCCESS = new ResponseStatus( 200, "请求成功" );
  public static EMPTY_RESULT = new ResponseStatus( 204, "请求成功, 但没有数据" );
  public static BAD_REQUEST = new ResponseStatus( 400, "用户请求错误或请求缺少参数" );
  public static UNAUTHORIZED = new ResponseStatus( 401, "未登录" );
  public static FORBIDDEN = new ResponseStatus( 403, "没有权限访问" );
  public static TOO_MARY_REQUEST = new ResponseStatus( 429, "当前 ip 或用户请求过多" );
  public static ILLEGAL_REQUEST = new ResponseStatus( 430, "用户非法操作, 暂无更多细节" );
  public static SERVER_ERROR = new ResponseStatus( 500, "服务器异常" );

  public readonly message: string;
  public readonly code: number;

  private constructor( code: number, message: string ) {
    super();

    this.code = code;
    this.message = message;
  }

  public static getMessageByStatusCode( code: number, defaultMessage: string = "unknown statusCode" ): string {
    if ( !Lang.isNumber( code ) ) {
      throw new IllegalArgumentException( `Expect number, but got ${typeof code}` );
    }

    for ( let item of ResponseStatus.values<ResponseStatus>() ) {
      if ( item.code === code ) {
        return item.message;
      }
    }

    return defaultMessage;
  }

  public static expect( statusCode: number, ...expectStatusCodes: number[] ): boolean {
    return expectStatusCodes.some( status => status === statusCode );
  }
}

export class EntityStatus extends BasicEnum<EntityStatus> {
  public static DELETE = new EntityStatus( -1, "已逻辑删除" );
  public static NORMAL = new EntityStatus( 1, "正常" );

  public readonly status: number;
  public readonly name: string;

  private constructor( status: number, name: string ) {
    super();
    this.status = status;
    this.name = name;
  }

  public static getNameByStatus( status: number, defaultName: string = "unknown name" ): string {
    if ( !Lang.isNumber( status ) ) {
      throw new IllegalArgumentException( `Expect number, but got ${typeof status}` );
    }

    for ( let item of EntityStatus.values<EntityStatus>() ) {
      if ( item.status === status ) {
        return item.name;
      }
    }

    return defaultName;
  }

  public static contains( status: number ): boolean {
    return EntityStatus.values<EntityStatus>().some( item => item.status === status );
  }
}