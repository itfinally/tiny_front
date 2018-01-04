import { Map, Set, HashSet, HashMap, CoreUtils, NullPointException } from "@/core";
import { RequestDetails, RequestHeader, RequestMethod } from "./support";

let once: Set<string> = new HashSet(),

    methodMapping: Map<string, string> = new HashMap(),
    classMapping: Map<Function, string> = new HashMap(),
    details: Map<string, RequestDetails> = new HashMap(),
    requests: Map<string, RequestDetails> = new HashMap();

class Collector {
    private constructor() {
    }

    public static getKeys( target: Function | object, method: string, name: string ): Array<any> {
        // If target instance of Function, that means target is a constructor,
        // it can be get attribute from 'constructor.prototype'.
        // Otherwise, target is an instance, getting attribute from it self
        let self = target instanceof Function ? target : target.constructor,
            methodId = Collector.getMethodId( self, method ),
            alias = `${methodId}_${name}`;

        return [ methodId, alias ];
    }

    public static getMethodId( constructor: Function, method: string = "none" ): string {
        let part1: string = classMapping.get( constructor ),
            part2: string = methodMapping.get( method ),
            tempUUID: string = CoreUtils.uuid();

        if ( !part1 ) {
            part1 = tempUUID.substr( 0, 16 );
            classMapping.put( constructor, part1 );
        }

        if ( !part2 ) {
            part2 = tempUUID.substr( 16, 32 );
            methodMapping.put( method, part2 );
        }

        return `${part1}${part2}`;
    }

    public static getConstructorDetails( target: Function ): RequestDetails {
        let part1: string = classMapping.get( target ),
            part2: string = methodMapping.get( "none" );

        // not found!
        if ( !( part1 && part2 ) ) {
            return <any>null;
        }

        return details.get( `${part1}${part2}` );
    }

    // getting request details from prototype chain
    public static getMethodDetails( target: Function, method: string ): RequestDetails {
        // not found!
        if ( target === Object.prototype ) {
            return <any>null;
        }

        let part1: string = classMapping.get( target ),
            part2: string = methodMapping.get( method ),
            key = `${part1}${part2}`;

        if ( details.containsKey( key ) ) {
            return details.get( key );
        }

        return Collector.getMethodDetails( Object.getPrototypeOf( target ), method );
    }

    public static getDetails( uuid: string ): RequestDetails {
        if ( !details.containsKey( uuid ) ) {
            let request = new RequestDetails();
            details.put( uuid, request );

            return request;
        }

        return details.get( uuid );
    }
}


export function getRequestDetail( target: object, method: string ): RequestDetails {

    // return if exist
    let constructor = target.constructor,
        methodId = Collector.getMethodId( constructor, method );

    if ( requests.containsKey( method ) ) {
        return Object.assign( new RequestDetails(), requests.get( methodId ) );
    }

    let constructorDetails = Collector.getConstructorDetails( constructor ),
        methodDetails = Collector.getMethodDetails( constructor, method ),
        targetRequest = new RequestDetails();

    if ( !( constructorDetails && methodDetails ) ) {
        throw new NullPointException(
            `Request Details is not found. Missing method proxy -> ${constructor.name}.${method}, 
                    It is a network request interface?`
        );
    }

    targetRequest.url = ( constructorDetails.url ? `${constructorDetails.url}/${methodDetails.url}` : methodDetails.url )
        .replace( /\w(\/{2,})\w?/, ( match: string, key: string ) => match.replace( key, "/" ) );

    let baseHeaders = constructorDetails.headers,
        childHeaders = methodDetails.headers,
        header = targetRequest.headers;

    // headers merge
    baseHeaders.keySet().toArray().concat( childHeaders.keySet().toArray() )
        .forEach( ( key: string ) => header.put( key, childHeaders.get( key ) || baseHeaders.get( key ) ) );

    if ( CoreUtils.isBoolean( methodDetails.responseBody ) ) {
        targetRequest.responseBody = methodDetails.responseBody;

    } else if ( CoreUtils.isBoolean( constructorDetails.responseBody ) ) {
        targetRequest.responseBody = constructorDetails.responseBody;

    } else {
        targetRequest.responseBody = false;
    }

    targetRequest.method = ( RequestMethod.NONE !== methodDetails.method ? methodDetails.method : constructorDetails.method );
    targetRequest.requestBody = methodDetails.requestBody;
    targetRequest.multiPart = methodDetails.multiPart;
    targetRequest.args = methodDetails.args;

    requests.put( methodId, targetRequest );
    return Object.assign( new RequestDetails(), targetRequest );
}


function basicAnnotation( name: string, collector: ( requestDetails: RequestDetails ) => void ): Function {
    return ( target: Object | Function, method: string, descriptor: PropertyDescriptor ): PropertyDescriptor => {
        let [ uuid, alias ] = Collector.getKeys( target, method, name );

        if ( !once.contains( alias ) ) {
            once.add( alias );
            collector( Collector.getDetails( uuid ) );
        }

        return descriptor;
    }
}

export function Header( key: string, value: string ): Function {
    return basicAnnotation( "header", requestDetails => requestDetails.headers.put( key, value ) );
}

export function Headers( opts: Array<RequestHeader> ): Function {
    return basicAnnotation( "headers", requestDetails => {
        let headers = requestDetails.headers;
        opts.forEach( header => headers.put( header.key, header.value ) );
    } );
}

export function RequestMapping( url: string, requestMethod: RequestMethod = RequestMethod.NONE ): Function {
    return basicAnnotation( "requestMapping", requestDetails => {
        requestDetails.url = url;
        requestDetails.method = requestMethod;
        // form submit by default
        requestDetails.headers.put( "Content-Type", "application/x-www-form-urlencoded" );
    } );
}

export function GetMapping( url: string ): Function {
    return RequestMapping( url, RequestMethod.GET );
}

export function PostMapping( url: string ): Function {
    return RequestMapping( url, RequestMethod.POST );
}

export function PutMapping( url: string ): Function {
    return RequestMapping( url, RequestMethod.PUT );
}

export function DeleteMapping( url: string ): Function {
    return RequestMapping( url, RequestMethod.DELETE );
}

export function Args( ...parameters: string[] ): Function {
    return basicAnnotation( "args", requestDetails => requestDetails.args = parameters );
}

export function RequestBody( parameter: string ): Function {
    return basicAnnotation( "requestBody", requestDetails => {
        requestDetails.requestBody = parameter;
        // json submit by default
        requestDetails.headers.put( "Content-Type", "application/json" );
    } );
}

export function ResponseBody( isTrue: boolean = true ): Function {
    return basicAnnotation( "responseBody", requestDetails => requestDetails.responseBody = isTrue );
}

export function MultiPart( parameter: Array<string> ): Function {
    return basicAnnotation( "multipart", requestDetails => requestDetails.multiPart = parameter );
}