import { CoreUtils, IllegalArgumentException } from "@core/index";

export class Enum {
    constructor() {
    }

    // it will be implicit call by THIS if naming 'valueOf'
    static of( name ) {
        if ( !this.hasOwnProperty( name ) ) {
            throw new IllegalArgumentException( `enum '${name}' is not found from ${this.name}` );
        }

        return this[ name ];
    }
}

export class ResponseStatusEnum extends Enum {
    constructor( statusCode, message ) {
        super();

        this.statusCode = statusCode;
        this.message = message;
    }

    static getMessageByStatusCode( statusCode, defaultMessage = "unknown statusCode" ) {
        if ( !CoreUtils.isNumber( statusCode ) ) {
            throw new IllegalArgumentException( `expect number, but got ${typeof statusCode}` );
        }

        let item, that = ResponseStatusEnum;

        for ( let name in that ) {
            if ( !that.hasOwnProperty( name ) ) {
                continue;
            }

            item = that[ name ];
            if ( !(item instanceof that) ) {
                continue;
            }

            if ( statusCode === item.statusCode ) {
                return item.message;
            }
        }

        return defaultMessage;
    }
}

ResponseStatusEnum.SUCCESS = new ResponseStatusEnum( 200, "请求成功" );
ResponseStatusEnum.EMPTY_RESULT = new ResponseStatusEnum( 204, "请求成功, 但没有数据" );
ResponseStatusEnum.BAD_REQUEST = new ResponseStatusEnum( 400, "用户请求错误或请求缺少参数" );
ResponseStatusEnum.UNAUTHORIZED = new ResponseStatusEnum( 401, "未登录" );
ResponseStatusEnum.TOO_MARY_REQUEST = new ResponseStatusEnum( 429, "当前 ip 或用户请求过多" );
ResponseStatusEnum.ILLEGAL_REQUEST = new ResponseStatusEnum( 430, "用户非法操作, 暂无更多细节" );
ResponseStatusEnum.SERVER_ERROR = new ResponseStatusEnum( 500, "服务器异常" );
