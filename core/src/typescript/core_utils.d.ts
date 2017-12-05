export class CoreUtils {
    public static isBaseType( target: any ): boolean;

    public static isNumber( target: any ): boolean;

    public static isString( target: any ): boolean;

    public static isBoolean( target: any ): boolean;

    public static isSimpleObject( target: any ): boolean;

    public static isArrayLike( target: any ): boolean;

    public static isNone( target: any ): boolean;

    public static getOrDefault<T>( expect: T, defaultVal: T ): T;

    public static hashCode( target: string ): number;

    public static base64Encoder( target: string ): string;

    public static base64Decoder( target: string ): string;

    public static uuid(): string;

    public static deepCopy( to: any, from: any, ignoreFunction: boolean ): void;

    public static each( collection: Array<any> | object, callbackFn: Function, thisArg: object ): void;
}

export class StringUtils {
    public static format( template: string, kwArgs: any, ...args: Array<any> ): string;
}

export class Observer {
    public subscription( channel: string, callbackFn: Function ): string;

    public publish( channel: string, bind: any, ...args: Array<any> ): void;

    public remove( ...ids: Array<string> ): void;
}