import { HashMap, Map, CoreUtils, IllegalArgumentException, EventEmitter } from "@/core";

export let
    GLOBAL_CACHE: Map<string, any> = new HashMap(),
    GLOBAL_EVENT_EMITTER = new EventEmitter();

// root address
let devAddress = "http://127.0.0.1:8080",
    produceAddress = "";

export let
    // cache key
    VUE_KEY = "vue",
    ROUTER_KEY = "router",
    MENU_ITEMS = "menuItems",


    // login flag
    TOKEN = "token",
    IS_RE_LOGIN = "isReLogin",


    // event name
    MENU_INITIALIZE = "menuInitialize",
    FRAME_RECT = "frameRect",


    // request address
    REQUEST_ADDRESS = devAddress;

export class Enum<SubEnum> {
    private static enums: Map<Function, any[]> = new HashMap();

    protected constructor() {
        let enums = Enum.enums,
            constructor = Object.getPrototypeOf( this ).constructor;

        if ( !enums.containsKey( constructor ) ) {
            enums.put( constructor, [] );
        }

        enums.get( constructor ).push( this );
    }

    // it will be implicit call by THIS if naming 'valueOf'
    static of<SubEnum>( name: string ): SubEnum {
        if ( !this.hasOwnProperty( name ) ) {
            throw new IllegalArgumentException( `enum '${name}' is not found from ${this.name}` );
        }

        return (<any>this)[ name ];
    }

    static values<SubEnum>(): SubEnum[] {
        return Enum.enums.getOrDefault( this, [] );
    }
}

export class ResponseStatusEnum extends Enum<ResponseStatusEnum> {
    public static SUCCESS = new ResponseStatusEnum( 200, "请求成功" );
    public static EMPTY_RESULT = new ResponseStatusEnum( 204, "请求成功, 但没有数据" );
    public static BAD_REQUEST = new ResponseStatusEnum( 400, "用户请求错误或请求缺少参数" );
    public static UNAUTHORIZED = new ResponseStatusEnum( 401, "未登录" );
    public static TOO_MARY_REQUEST = new ResponseStatusEnum( 429, "当前 ip 或用户请求过多" );
    public static ILLEGAL_REQUEST = new ResponseStatusEnum( 430, "用户非法操作, 暂无更多细节" );
    public static SERVER_ERROR = new ResponseStatusEnum( 500, "服务器异常" );

    public readonly message: string;
    public readonly statusCode: number;

    private constructor( statusCode: number, message: string ) {
        super();

        this.statusCode = statusCode;
        this.message = message;
    }

    public static getMessageByStatusCode( statusCode: number, defaultMessage: string = "unknown statusCode" ): string {
        if ( !CoreUtils.isNumber( statusCode ) ) {
            throw new IllegalArgumentException( `Expect number, but got ${typeof statusCode}` );
        }

        for ( let item of this.values<ResponseStatusEnum>() ) {
            if( item.statusCode === statusCode ) {
                return item.message;
            }
        }

        return defaultMessage;
    }
}

export class DataStatusEnum extends Enum<DataStatusEnum> {
    public static DELETE = new DataStatusEnum( -1, "已逻辑删除" );
    public static NORMAL = new DataStatusEnum( 1, "正常" );

    public readonly status: number;
    public readonly name: string;

    private constructor( status: number, name: string ) {
        super();
        this.status = status;
        this.name = name;
    }

    public static getNameByStatus( status: number, defaultName: string = "unknown name" ): string {
        if ( !CoreUtils.isNumber( status ) ) {
            throw new IllegalArgumentException( `Expect number, but got ${typeof status}` );
        }

        for ( let item of this.values<DataStatusEnum>() ) {
            if( item.status === status ) {
                return item.name;
            }
        }

        return defaultName;
    }
}