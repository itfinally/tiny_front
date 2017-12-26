import "ts-promise";

import { HashMap, Map } from "@core/util/map";
import { CoreUtils } from "@core/lang";
import { IllegalStateException } from "@core/exception";

interface Resolve {
    status( status: string ): Resolve;

    resolve( result: any ): Resolve;
}

interface StateRule {
    [event: string]: Map<string, string>;
}

interface TransitionMapping {
    [source: string]: Map<string, Function>;
}

type StateMachineFactoryDeclare = {
    initialStatus: string;
    events: Map<string, Function>;
    stateRules: StateRule;
    catcher: TransitionMapping;
    transitionMapping: TransitionMapping;
};

export class StateMachine {
    private transitionMapping: TransitionMapping;
    private catcher: TransitionMapping;
    private stateRules: StateRule;
    private resolve: Resolve;

    private currentStatus: string = <any>null;
    private isStartup: boolean = false;
    private isFinish: boolean = false;

    private nextStatus: string = <any>null;
    private result: any = <any>null;

    constructor( factory: StateMachineFactoryDeclare ) {
        this.transitionMapping = factory.transitionMapping;
        this.stateRules = factory.stateRules;
        this.catcher = factory.catcher;

        this.currentStatus = factory.initialStatus;

        let that = this;
        this.resolve = new class implements Resolve {
            public status( status: string ): Resolve {
                if ( status in that.stateRules && that.stateRules[ that.currentStatus ].containsKey( status ) ) {
                    that.nextStatus = status;
                    return this;
                }

                throw new IllegalStateException();
            }

            public resolve( result: any ): Resolve {
                that.result = result;
                return this;
            }
        };

        factory = <any>null;
    }

    public start(): void {
        if ( this.isStartup ) {
            throw new IllegalStateException( "" );
        }

        let mapping = this.transitionMapping[ <any>null ];
        if ( !CoreUtils.isNone( mapping ) && mapping.containsKey( this.currentStatus ) ) {
            this.result = mapping.get( this.currentStatus )();
        }

        this.isStartup = true;
    }

    public sendEvent( event: string ): Promise<any> {
        if ( !this.isStartup ) {
            return Promise.reject( new IllegalStateException( "State machine is not start." ) );
        }

        if ( this.isFinish ) {
            return Promise.reject( new IllegalStateException( "State machine is closed." ) );
        }

        if ( !(event in this.stateRules) ) {
            return Promise.reject( new IllegalStateException( `Event '${event}' is not found, maybe you forget to add this event.` ) );
        }

        let rules = this.stateRules[ event ];
        if ( !rules.containsKey( this.currentStatus ) ) {
            return Promise.reject( new IllegalStateException( `` ) );
        }

        return this.transitionTo( rules.get( this.currentStatus ) );
    }

    public transitionTo( target: string ): Promise<any> {
        if ( !this.isStartup ) {
            return Promise.reject( new IllegalStateException( "State machine is not start." ) );
        }

        if ( this.isFinish ) {
            return Promise.reject( new IllegalStateException( "State machine is closed." ) );
        }

        // clear
        this.nextStatus = <any>null;

        try {
            let mapping = this.transitionMapping[ this.currentStatus ];
            if ( mapping.containsKey( target ) ) {
                this.result = mapping.get( target )( this.result );
            }

            this.currentStatus = target;

            mapping = this.transitionMapping[ target ];
            this.isFinish = CoreUtils.isNone( mapping ) || mapping.isEmpty();

        } catch ( e ) {
            let mapping = this.catcher[ this.currentStatus ];
            if ( !mapping.containsKey( target ) ) {
                return Promise.reject( new IllegalStateException( e ) );

            } else {
                try {
                    mapping.get( target )( e, this.resolve );

                    // maybe dead loop
                    if ( !CoreUtils.isNone( this.nextStatus ) ) {
                        this.currentStatus = this.nextStatus;
                    }

                    mapping = this.transitionMapping[ this.nextStatus ];
                    this.isFinish = CoreUtils.isNone( mapping ) || mapping.isEmpty();

                } catch ( e ) {
                    return Promise.reject( e );
                }
            }
        }

        return Promise.resolve( this.result );
    }

    public isDone(): boolean {
        return this.isFinish;
    }
}

export class StateMachineFactory {
    private initialStatus: string;
    private events: Map<string, Function> = new HashMap();
    private stateRules: StateRule = Object.create( null );
    private catcher: TransitionMapping = Object.create( null );
    private transitionMapping: TransitionMapping = Object.create( null );

    public addRule( source: string | string[], target: string | string[], event: string ): this {
        if ( !(event in this.stateRules) ) {
            this.stateRules[ event ] = new HashMap();
        }

        let rules: Map<string, string> = this.stateRules[ event ];

        if ( CoreUtils.isString( source ) || null === source ) {
            source = <string[]>[ source ];
        }

        if ( CoreUtils.isString( target ) || null === source ) {
            target = <string[]>[ target ];
        }

        (<string[]>source).forEach( s => (<string[]>target).forEach( t => rules.put( s, t ) ) );

        return this;
    }

    public addAction( source: string | string[], target: string | string[], processor: Function ): this {
        if ( CoreUtils.isString( source ) || null === source ) {
            source = <string[]>[ source ];
        }

        if ( CoreUtils.isString( target ) || null === source ) {
            target = <string[]>[ target ];
        }

        (<string[]>source).forEach( s => {
            if ( !(s in this.transitionMapping) ) {
                this.transitionMapping[ s ] = new HashMap();
            }

            let mapping = this.transitionMapping[ s ];
            (<string[]>target).forEach( t => mapping.put( t, processor ) )
        } );

        return this;
    }

    public addExceptionCatcher( source: string | string[], target: string | string[], catcher: ( e: Error, resolve: Resolve ) => void ): this {
        if ( CoreUtils.isString( source ) || null === source ) {
            source = <string[]>[ source ];
        }

        if ( CoreUtils.isString( target ) || null === source ) {
            target = <string[]>[ target ];
        }

        (<string[]>source).forEach( s => {
            if ( !(s in this.catcher) ) {
                this.catcher[ s ] = new HashMap();
            }

            let mapping = this.catcher[ s ];
            (<string[]>target).forEach( t => mapping.put( t, catcher ) )
        } );

        return this;
    }

    public addStateDetails( source: string | string[], target: string | string[], event: string,
                            processor?: Function, catcher?: ( e: Error, resolve: Resolve ) => void ) {

        this.addRule( source, target, event );

        if ( processor instanceof Function ) {
            this.addAction( source, target, processor );
        }

        if ( catcher instanceof Function ) {
            this.addExceptionCatcher( source, target, catcher );
        }

        return this;
    }

    public setInitialStatus( status: string ): this {
        this.initialStatus = status;
        return this;
    }

    public build(): StateMachine {
        return new StateMachine( {
            initialStatus: this.initialStatus,
            events: this.events,
            stateRules: this.stateRules,
            catcher: this.catcher,
            transitionMapping: this.transitionMapping
        } );
    }
}
