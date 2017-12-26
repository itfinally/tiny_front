import { TimeoutException } from "./exception";
import { RetrofitRequest, RetrofitResponse } from "./support";
import { IllegalArgumentException } from "@/core";

// Whatever response or error, must be added to macro task queue( setTimeout ) rather than micro task queue( Promise ).
//
// Quote: https://juejin.im/entry/58332d560ce46300610e4bad --> javascript micro/macro task execution details
//
// There is such a situation:
//    1. use resolve in response   ( nativeFetch(...args).then( response => resolve( response ) ) )
//    2. use setTimeout in timeout ( ( resolve, reject ) => setTimeout( () => reject( new Timeout( ... ) ), init.timeout ) )
//
// When timeout is happen and reject task( like TimeoutException ) add to macro task queue,
// but micro task queue is not empty in this time. So that response can be executed if it add to micro task queue
// before micro task queue is empty even that happen after timeout. And it is not our expect result.
//
// So, whatever response or timeout, should be executed as macro task( by setTimeout method ),
// as the blog( see the quote ) said, worker thread will be loop and executed in micro task queue
// after execute an macro task, for this reason that this code is correct:
//
// nativeFetch( input, init ).then(
//     response => setTimeout( () => resolve( response ), 0 ),
//     raise => reject( raise )
// );
//
export function fetchClient( input: string, init: RetrofitRequest ): Promise<Response> {
    let response: Promise<Response>,
        request = (): Promise<Response> => new Promise<Response>( ( resolve, reject ) => {
            try {
                fetch( input, init ).then(
                    response => setTimeout( () => resolve( response ), 0 ),
                    raise => reject( raise )
                );

            } catch ( e ) {

                // reject immediately if raise an error
                reject( e );
            }
        } );

    if ( !init.timeout ) {
        response = request();

    } else {
        let timeout: number = Math.ceil( init.timeout );
        if ( !(isFinite( timeout ) && timeout > 0) ) {
            throw new IllegalArgumentException( "Timeout must be a number" );
        }

        let rejectTask = (): Promise<Response> => new Promise( ( resolve, reject ) => setTimeout( () =>
            reject( new TimeoutException( `${input} is timeout.` ) ), init.timeout ) );

        response = Promise.race<Response>( [ rejectTask(), request() ] );
    }

    return response;
}

export function retrofitFetchClient( input: string, init: RetrofitRequest ): Promise<RetrofitResponse> {
    let _response: Response;

    return fetchClient( input, init ).then( response => {
        _response = response;
        return response.text();

    } ).then( content => {
        let response = new RetrofitResponse(_response);
        response.body = content;

        return response;
    } );
}