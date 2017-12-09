import { Assert } from "../lang";
import { UnsupportedOperationException } from "../exception";

export function isCollection( c: any ): void {
    if( !(c instanceof AbstractCollection) ) {
        throw new TypeError( `Expect type Collection, but got ${typeof c}` );
    }
}

export interface Iterator<T> {
    next(): any;

    hasNext(): boolean;

    remove(): void;
}

// Just for 'iterator' function
export interface ObjectIterator<T> extends Iterator<T> {
    next(): T;
}

// Just for 'of' operation
export interface SymbolIterator<T> extends Iterator<T> {
    next(): IteratorResult<T>;
}

export interface Iterable<T> {
    [Symbol.iterator](): SymbolIterator<T>;

    forEach( callbackFn: ( elem: T, index: number ) => boolean ): void;
}

export interface Collection<T> extends Iterable<T> {
    add( e: T, index?: number ): boolean;

    addAll( c: Collection<T>, index?: number ): void;

    iterator(): ObjectIterator<T>;

    clear(): void;

    contains( o: any ): boolean;

    containsAll( c: Collection<any> ): boolean;

    isEmpty(): boolean;

    remove( o: any ): any;

    removeAll( c: Collection<any> ): boolean;

    size(): number;

    toArray(): T[];
}

export interface List<T> extends Collection<T> {
    get( index: number ): T;

    indexOf( o: any ): number;

    lastIndexOf( o: any ): number;

    remove( index: number ): boolean;

    remove( o: any ): boolean;

    set( index: number, element: T ): T;

    subList( fromIndex: number, toIndex: number ): List<T>;
}

export interface Queue<T> extends Collection<T> {
    add( e: T ): boolean;

    element(): T;

    offer( e: T ): boolean;

    peek(): T;

    poll(): T;

    remove( o?: any ): T | boolean;
}

export interface Deque<T> extends Queue<T> {
    addFirst( e: T ): void;

    addLast( e: T ): void;

    getFirst(): T;

    getLast(): T;

    offerFirst( e: T ): boolean;

    offerLast( e: T ): boolean;

    peekFirst(): T;

    peekLast(): T;

    pollFirst(): T;

    pollLast(): T;

    pop(): T;

    push( e: T ): void;

    removeFirst(): T;

    removeLast(): T;
}

export abstract class AbstractCollection<T> implements Collection<T> {
    public add( e: T, index?: number ): boolean {
        throw new UnsupportedOperationException();
    }

    public addAll( c: Collection<T>, index?: number ): void {
        Assert.requireNotNull( c );
        isCollection( c );

        if ( index ) {
            throw new UnsupportedOperationException();
        }

        let it: Iterator<T> = c.iterator();
        while ( it.hasNext() ) {
            this.add( it.next() );
        }
    }

    public abstract iterator(): ObjectIterator<T>;

    public clear(): void {
        let it: Iterator<T> = this.iterator();

        while ( it.hasNext() ) {
            it.next();
            it.remove();
        }
    }

    public contains( o: any ): boolean {
        let it: ObjectIterator<T> = this.iterator();
        while ( it.hasNext() ) {
            if ( it.next() === o ) {
                return true;
            }
        }

        return false;
    }

    public containsAll( c: Collection<any> ): boolean {
        Assert.requireNotNull( c );
        isCollection(c);

        let all: boolean = true;

        for ( let elem of c ) {
            if ( !((<any>all) &= (<any>this.contains( elem ))) ) {
                break;
            }
        }

        return all;
    }

    public isEmpty(): boolean {
        return this.size() <= 0;
    }

    public remove( o: any ): any {
        let it: Iterator<any> = this.iterator();

        while ( it.hasNext() ) {
            if ( it.next() === o ) {
                it.remove();
                return true;
            }
        }

        return false;
    }

    public removeAll( c: Collection<any> ): boolean {
        Assert.requireNotNull( c );
        isCollection(c);

        let modified = false,
            it: Iterator<any> = c.iterator();

        while ( it.hasNext() ) {
            if ( this.contains( it.next() ) ) {
                modified = true;
                it.remove();
            }
        }

        return true;
    }

    public abstract size(): number;

    public toArray(): T[] {
        let elements: T[] = [];

        let it: Iterator<T> = this.iterator();
        while ( it.hasNext() ) {
            elements.push( it.next() );
        }

        return elements;
    }

    [Symbol.iterator](): Iterator<T> {
        let it: Iterator<T> = this.iterator();

        return new class implements SymbolIterator<T> {
            next(): IteratorResult<T> {
                let done = !it.hasNext();
                return { done, value: done ? undefined : it.next() };
            }

            hasNext(): boolean {
                return it.hasNext();
            }

            remove(): void {
                // ignore
            }
        }
    }

    public forEach( callbackFn: ( elem: T, index: number ) => boolean ): void {
        if ( !(callbackFn instanceof Function) ) {
            throw new TypeError( `Expect type function, but got ${typeof callbackFn}` );
        }

        let index: number = 0,
            it: Iterator<T> = this.iterator();

        while ( it.hasNext() ) {
            if ( true === callbackFn( it.next(), index++ ) ) {
                break;
            }
        }
    }

    toString() {
        return JSON.stringify( this.toArray() );
    }
}