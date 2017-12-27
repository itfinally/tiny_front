import { RequestDetails, RequestMethod, RetrofitRequest } from "./support";
import { Set, HashSet, IllegalArgumentException, StringUtils, IllegalStateException } from "@/core";
import { DataType } from "@/retrofitjs";

let requestMethods: Set<RequestMethod> = new HashSet();

requestMethods.add( RequestMethod.GET );
requestMethods.add( RequestMethod.PUT );
requestMethods.add( RequestMethod.POST );
requestMethods.add( RequestMethod.PATCH );
requestMethods.add( RequestMethod.DELETE );
requestMethods.add( RequestMethod.OPTIONS );

class RequestValidator {
    private details: RequestDetails;
    private parameters: Array<any>;

    public constructor( detail: RequestDetails, parameters: Array<any> ) {
        this.details = detail;
        this.parameters = parameters;
    }

    public valid() {
        this.urlIsOk().methodIsOk().parameterIsOk().notConflictInRequest();
        this.details.requestBody ? this.requestBodyIsOk() : this.multiPartIsOk();
    }

    public static getRestfulExpression(): RegExp {
        return /\/:(\w+)/g;
    }

    private urlIsOk(): this {
        let url = this.details.url;

        if ( !/^https?:\/\/.+/.test( url ) ) {
            throw new IllegalArgumentException( `Require legal url. ( in url: ${url} )` );
        }

        return this;
    }

    private methodIsOk(): this {
        let url = this.details.url,
            method = this.details.method;

        if ( !(method && requestMethods.contains( method ) ) ) {
            throw new IllegalArgumentException(
                `Require one of method( use RequestMethod object ). ( in url: ${url} )`
            );
        }

        return this;
    }

    private parameterIsOk(): this {
        let url = this.details.url,
            args = this.parameters,
            argDeclares = this.details.args;

        if ( args.length > argDeclares.length ) {
            throw new IllegalArgumentException(
                `Missing parameters ( ${args.slice( argDeclares.length )} ). ( in url: ${url} )`
            );
        }

        if ( args.length < argDeclares.length ) {
            throw new IllegalArgumentException(
                `Missing parameters declaration ( ${argDeclares.slice( args.length )} ). ( in url: ${url} )`
            );
        }

        return this;
    }

    private requestBodyIsOk(): this {
        let count: number = 0,
            detail = this.details,

            url = detail.url,
            argDeclares = detail.args,
            body = detail.requestBody;

        if ( StringUtils.isBlank( body ) ) {
            return this;
        }

        if ( RequestValidator.getRestfulExpression().test( url ) ) {
            url.replace( RequestValidator.getRestfulExpression(), ( match, name ) => {
                let index = argDeclares.indexOf( name );
                if ( index >= 0 ) {
                    count += 1;
                }

                return match;
            } );
        }

        if ( count + 1 !== argDeclares.length ) {
            throw new IllegalArgumentException( `More than one parameter found in request body. ( in url: ${url} )` );
        }

        if ( argDeclares.indexOf( body ) < 0 ) {
            throw new IllegalArgumentException( `Request body variable is not found in args ( ${body} ). ( in url: ${url} )` );
        }

        return this;
    }

    private multiPartIsOk(): this {
        let details = this.details,

            url = details.url,
            argDeclares = details.args,
            multiPartDeclares = details.multiPart;

        multiPartDeclares.forEach( name => {
            if ( -1 === argDeclares.indexOf( name ) ) {
                throw new IllegalArgumentException( `Multi part variable is not found from args ( ${name} ). ( in url: ${url} )` );
            }
        } );

        return this;
    }

    private notConflictInRequest(): this {
        if ( this.details.requestBody && this.details.multiPart.length > 0 ) {
            throw new IllegalStateException( "Cannot use request body and multi part in same time." );
        }

        return this;
    }
}


export class RequestBuilder {
    private request: RetrofitRequest = new RetrofitRequest();
    private specificFields: Set<string> = new HashSet();

    private details: RequestDetails;
    private parameters: Array<any>;

    public constructor( details: RequestDetails, parameters: Array<any> ) {
        this.details = details;
        this.parameters = parameters;

        let fields = this.specificFields;

        details.url.replace( RequestValidator.getRestfulExpression(), ( match, name ) => {
            fields.add( name );
            return match;
        } );

        if ( StringUtils.isNotBlank( details.requestBody ) ) {
            fields.add( details.requestBody );
        }

        if ( details.multiPart.length > 0 ) {
            details.multiPart.forEach( name => fields.add( name ) );
        }
    }

    public build(): RetrofitRequest {
        if ( RequestMethod.GET === this.details.method ) {
            return this.buildGet();

        } else if ( RequestMethod.POST === this.details.method ) {
            return this.buildPost();
        }

        throw new IllegalStateException( "Not match request method." );
    }

    private buildGet(): RetrofitRequest {
        (RequestValidator.getRestfulExpression().test( this.details.url )
            ? this.createRestUrl()
            : this.createUrl())
            .createBasicInfo()
            .createHeaders();

        return this.request;
    }

    private buildPost(): RetrofitRequest {
        let details = this.details;

        if ( RequestValidator.getRestfulExpression().test( details.url ) ) {
            this.createRestUrl();

        } else {
            this.request.url = details.url;
        }

        if ( details.requestBody ) {
            this.createRequestBody();

        } else if ( details.multiPart.length > 0 ) {
            this.createMultiPart();

        } else {
            this.createForm();
        }

        return this.createBasicInfo().createHeaders().request;
    }

    private createRestUrl(): this {
        let args = this.parameters,
            url = this.details.url,
            argDeclare = this.details.args;

        this.request.url = url.replace( RequestValidator.getRestfulExpression(), ( match: string, name: string ): string => {
            let index = argDeclare.indexOf( name );
            return index >= 0 ? `/${args[ index ]}` : match;
        } );

        return this;
    }

    private createUrl(): this {
        let body: Array<string> = [],

            args = this.parameters,
            url = this.details.url,
            argDeclares = this.details.args;

        argDeclares.forEach( ( name, index ) => body.push( `${name}=${args[ index ]}` ) );

        this.request.url = body.length <= 0
            ? url

            : (-1 === url.indexOf( "?" )
                ? `${url}?${body.join( "&" )}`
                : `${url}&${body.join( "&" )}`);

        return this;
    }

    private createBasicInfo(): this {
        this.request.dataType = this.details.responseBody ? DataType.JSON : DataType.TEXT;
        this.request.method = this.details.method;
        return this;
    }

    private createHeaders(): this {
        let headers: { [key: string]: string } = {};

        for ( let entry of this.details.headers.entrySet() ) {
            headers[ entry.key ] = entry.value;
        }

        this.request.headers = headers;
        return this;
    }

    private createForm(): this {
        let formArray: Array<string> = [],

            args = this.parameters,
            fields = this.specificFields,
            argDeclares = this.details.args;

        argDeclares.forEach( ( name, index ) => {
            if ( fields.contains( index ) ) {
                return;
            }

            formArray.push( `${name}=${args[ index ]}` );
        } );

        this.request.body = formArray.join( "&" );
        return this;
    }

    private createRequestBody(): this {
        this.request.body = JSON.stringify( this.parameters[ this.details.args.indexOf( this.details.requestBody ) ] );
        return this;
    }

    private createMultiPart(): this {
        let formBody = new FormData(),

            args = this.parameters,
            fields = this.specificFields,
            argDeclares = this.details.args;

        argDeclares.forEach( ( name, index ) => {
            if ( fields.contains( name ) ) {
                return;
            }

            formBody.set( name, args[ index ] );
        } );

        this.request.body = formBody;
        return this;
    }
}