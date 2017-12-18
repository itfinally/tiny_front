import { AbstractCollection, List, Collection, ObjectIterator, Iterator, Deque, isCollection } from "./collection";
import {
    IllegalStateException,
    IndexOutOfBoundsException,
    NoSuchElementException,
    UnsupportedOperationException
} from "../exception";

import { Assert, CoreUtils, MAX_INTEGER } from "../lang";

export abstract class AbstractList<T> extends AbstractCollection<T> implements List<T> {
    protected checkForRange( index: number ): void {
        if ( index < 0 || index >= this.size() ) {
            throw new IndexOutOfBoundsException();
        }
    }

    public abstract get( index: number ): T;

    public indexOf( o: any ): number {
        let index = 0,
            it: Iterator<T> = this.iterator();

        while ( it.hasNext() ) {
            if ( it.next() === o ) {
                return index;
            }

            index += 1;
        }

        return -1;
    }

    public abstract lastIndexOf( o: any ): number;

    public remove( indexOrObject: number | any ): boolean | any {
        return CoreUtils.isNumber( indexOrObject )
            ? this.removeByIndex( indexOrObject )
            : super.remove( indexOrObject )
    }

    protected removeByIndex( index: number ): boolean {
        this.checkForRange( index );

        let cursor = 0,
            it: Iterator<T> = this.iterator();

        while ( it.hasNext() ) {
            it.next();

            if ( index === cursor ) {
                it.remove();
                return true;
            }

            cursor += 1;
        }

        return false;
    }

    public abstract set( index: number, element: T ): T;

    // Like most java api, sub string, sub list, all are reference to the original object and limit range as sub object.
    // It make original object cannot be collected by gc even you don't want use, because sub object still effective.
    // That is the reason of create new one as sub list in here.
    public subList( fromIndex: number, toIndex: number ): List<T> {
        let newList = <List<T>>new (Object.getPrototypeOf( this ).constructor)(),
            elements = this.toArray().slice( fromIndex, toIndex );

        elements.forEach( elem => newList.add( elem ) );
        return newList;
    }
}

export class ArrayList<T> extends AbstractList<T> implements List<T> {
    private elements: T[] = [];

    public constructor( c?: Collection<T> ) {
        super();

        if ( c && c instanceof AbstractCollection ) {
            this.addAll( c );
        }
    }

    public get( index: number ): T {
        this.checkForRange( index );
        return this.elements[ index ];
    }

    public indexOf( o: any ): number {
        return this.elements.indexOf( o );
    }

    public lastIndexOf( o: any ): number {
        let elements = this.elements;

        for ( let index = elements.length - 1; index >= 0; index -= 1 ) {
            if ( elements[ index ] === o ) {
                return index;
            }
        }

        return -1;
    }

    public set( index: number, element: T ): T {
        this.checkForRange( index );

        let oldVal = this.elements[ index ];
        this.elements[ index ] = element;

        return oldVal;
    }

    public add( e: T, index?: number ): boolean {
        let elements = this.elements;

        if ( CoreUtils.isNumber( index ) ) {
            elements.splice( <number>index, 1, ...[ e, elements[ <number>index ] ] );
            return true;
        }

        elements.push( e );
        return true;
    }

    public iterator(): ObjectIterator<T> {
        let mod: any,
            index = 0,
            that = this,
            elements = this.elements.slice();

        return new class implements ObjectIterator<T> {
            next(): T {
                if ( !this.hasNext() ) {
                    throw new IllegalStateException();
                }

                return elements[ mod = index++ ];
            }

            hasNext(): boolean {
                return index < elements.length;
            }

            remove(): void {
                if ( CoreUtils.isNone( mod ) || index - 1 !== mod ) {
                    throw new IllegalStateException();
                }

                that.elements.splice( index - 1, 1 );
            }
        };
    }

    public contains( o: any ): boolean {
        return this.elements.indexOf( o ) >= 0;
    }

    public isEmpty(): boolean {
        return this.elements.length <= 0;
    }

    public size(): number {
        return this.elements.length;
    }

    public remove( indexOrObject: any ): boolean {
        if ( CoreUtils.isNumber( indexOrObject ) ) {
            this.checkForRange( indexOrObject );
            this.elements.splice( indexOrObject, 1 );
            return true;
        }

        return this.elements.some( ( elem, index, elements ): boolean => {
            if ( elem === indexOrObject ) {
                elements.splice( index, 1 );
                return true;
            }

            return false;
        } );
    }

    public clear(): void {
        this.elements = [];
    }
}

export class ArrayDeque<T> extends AbstractCollection<T> implements Deque<T> {
    private capacity: number = 8;
    private head: number = 0;
    private tail: number = 0;

    private border: boolean = false;
    private full: boolean = false;

    private elements: T[] = [];

    constructor( initCapacity: number = 8, border: boolean = false ) {
        super();

        if ( !CoreUtils.isNumber( initCapacity ) ) {
            throw new TypeError( `Expect type number, but got ${typeof initCapacity}` );
        }

        if ( !CoreUtils.isBoolean( border ) ) {
            throw new TypeError( `Expect type boolean, but got ${typeof border}` );
        }

        this.border = border;

        this.capacity = initCapacity > MAX_INTEGER
            ? MAX_INTEGER

            // force to even number
            : parseInt( ((initCapacity & 0b1) === 0 ? initCapacity : initCapacity + 1).toFixed( 0 ) );
    }

    private doubleCapacity() {
        if ( this.head !== this.tail ) {
            throw new IllegalStateException();
        }

        let elements = this.elements,
            capacity = this.capacity,
            length = elements.length,
            head = this.head,

            halfPart = length - head,
            newCapacity = [];

        newCapacity.push( ...elements.slice( halfPart ) );
        newCapacity.push( ...elements.slice( 0, halfPart ) );

        this.capacity = capacity > MAX_INTEGER ? MAX_INTEGER : capacity * 2;
        this.elements = newCapacity;
        this.tail = elements.length;
        this.head = 0;
    }

    public add( e: T, index?: number ): boolean {
        if ( index ) {
            throw new UnsupportedOperationException();
        }

        this.addLast( e );
        return true;
    }

    public contains( o: any ): boolean {
        return this.elements.indexOf( o ) >= 0;
    }

    public addFirst( e: T ): void {
        if ( !this.offerFirst( e ) ) {
            throw new IllegalStateException( "Deque full." );
        }
    }

    public addLast( e: T ): void {
        if ( !this.offerLast( e ) ) {
            throw new IllegalStateException( "Deque full." );
        }
    }

    public offerFirst( e: T ): boolean {
        Assert.requireNotNull( e, "Element must not be null." );

        if ( this.full ) {
            return false;
        }

        this.elements[ this.head = (this.head - 1) & (this.capacity - 1) ] = e;

        if ( this.head === this.tail ) {
            this.border ? this.full = true : this.doubleCapacity();
        }

        return true;
    }

    public offerLast( e: T ): boolean {
        Assert.requireNotNull( e, "Element must not be null." );

        if ( this.full ) {
            return false;
        }

        let tail = this.tail;

        this.elements[ tail ] = e;
        this.tail = tail = (tail + 1) & (this.capacity - 1);

        if ( this.head === tail ) {
            this.border ? this.full = true : this.doubleCapacity();
        }

        return true;
    }

    public getFirst(): T {
        let val = this.elements[ this.head ];
        if ( CoreUtils.isNone( val ) ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    public getLast(): T {
        let val = this.elements[ (this.tail - 1) & (this.capacity - 1) ];
        if ( CoreUtils.isNone( val ) ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    public peekFirst(): T {
        return this.elements[ this.head ];
    }

    public peekLast(): T {
        return this.elements[ (this.tail - 1) & (this.capacity - 1) ];
    }

    public pollFirst(): T {
        let head = this.head,
            elements = this.elements,
            elem = elements[ head ];

        if ( CoreUtils.isNone( elem ) ) {
            return <any>null;
        }

        this.full = false;
        elements[ head ] = <any>null;
        this.head = (head + 1) & (this.capacity - 1);

        return elem;
    }

    public pollLast(): T {
        let tail = (this.tail - 1) & (this.capacity - 1),
            elements = this.elements,
            elem = elements[ tail ];

        if ( CoreUtils.isNone( elem ) ) {
            return <any>null;
        }

        this.tail = tail;
        this.full = false;
        elements[ tail ] = <any>null;

        return elem;
    }

    public pop(): T {
        return this.removeFirst();
    }

    public push( e: T ): void {
        this.addFirst( e );
    }

    public removeFirst(): T {
        let val = this.pollFirst();
        if ( CoreUtils.isNone( val ) ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    public removeLast(): T {
        let val = this.pollLast();
        if ( CoreUtils.isNone( val ) ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    public element(): T {
        return this.getFirst();
    }

    public offer( e: T ): boolean {
        return this.offerLast( e );
    }

    public peek(): T {
        return this.peekFirst();
    }

    public poll(): T {
        return this.pollFirst();
    }

    public remove( o?: any ): T | boolean {
        if ( !o ) {
            return this.removeFirst();
        }

        let elements = this.elements,
            index = elements.indexOf( o );

        if ( index <= 0 ) {
            return false;
        }

        elements.splice( index, 1, <any>null );
        return true;
    }

    public clear(): void {
        this.head = this.tail = 0;
        this.elements = [];
    }

    public iterator(): ObjectIterator<T> {
        let index = 0,
            mod: number,
            that = this,
            elements = this.elements.slice();

        return new class implements ObjectIterator<T> {
            next(): T {
                if ( !this.hasNext() ) {
                    return <any>null;
                }

                let elem = elements[ mod = index ];
                index += 1;

                return elem;
            }


            hasNext(): boolean {
                return index < elements.length;
            }

            remove(): void {
                if ( !mod || index - 1 !== mod ) {
                    throw new IllegalStateException();
                }

                that.elements.splice( index - 1, 1, <any>null );
            }
        }
    }

    public isEmpty(): boolean {
        return this.head === this.tail;
    }

    public size(): number {
        return (this.tail - this.head) & (this.capacity - 1);
    }
}

declare interface Node<T> {
    val: T;
    next: Node<T>;
    prev: Node<T>;
}

export class LinkedList<T> extends AbstractList<T> implements Deque<T> {
    private static Node = class _Node<T> implements Node<T> {
        public val: T;
        public next: Node<T>;
        public prev: Node<T>;

        constructor( val: T, next: Node<T>, prev: Node<T> ) {
            this.val = val;
            this.next = next;
            this.prev = prev;
        }
    };

    private head: Node<T>;
    private tail: Node<T>;
    private length: number;

    constructor( c?: Collection<T> ) {
        super();

        this.head = new LinkedList.Node<T>( <any>null, <any>null, <any>null );
        this.tail = new LinkedList.Node<T>( <any>null, <any>null, <any>null );
        this.clear();

        if ( c && !isCollection( c ) ) {
            this.addAll( c );
        }
    }

    public get( index: number ): T {
        let cursor = 0,
            head = this.head,
            tail = this.tail;

        while ( (head = head.next) !== tail ) {
            if ( index === cursor ) {
                return head.val;
            }

            cursor += 1;
        }

        return <any>null;
    }

    public lastIndexOf( o: any ): number {
        let index = this.length - 1,
            head = this.head,
            tail = this.tail;

        while ( (tail = tail.prev) !== head ) {
            if ( tail.val === o ) {
                return index;
            }

            index -= 1;
        }

        return -1;
    }

    public set( index: number, element: T ): T {
        this.checkForRange( index );

        let cursor = 0,
            head = this.head,
            tail = this.tail,
            node = new LinkedList.Node( element, <any>null, <any>null );

        while ( (head = head.next) !== tail ) {
            if ( cursor === index ) {
                break;
            }

            cursor += 1;
        }

        head.prev.next = head.next.prev = node;
        node.prev = head.prev;
        node.next = head.next;

        node.next = node.prev = <any>null;
        return node.val;
    }

    public add( e: T, index?: number ): boolean {
        let head = this.head,
            tail = this.tail,
            node = new LinkedList.Node( e, <any>null, <any>null );

        if ( CoreUtils.isNumber( index ) && !this.checkForRange( <number>index ) ) {
            let cursor = this.size() - 1;

            while ( (tail = tail.prev) !== head ) {
                if ( cursor === index ) {
                    break;
                }

                cursor -= 1;
            }
        }

        tail.prev = tail.prev.next = node;
        node.prev = tail.prev;
        node.next = tail;

        this.length += 1;
        return true;
    }

    private removeNode( n: Node<T> ): void {
        n.next.prev = n.prev;
        n.prev.next = n.next;
        n.next = n.prev = <any>null;

        this.length -= 1;
    }

    public iterator(): ObjectIterator<T> {
        let that = this,
            mod: Node<T>,
            cursor: Node<T> = this.head,

            head = this.head,
            tail = this.tail;

        return new class implements ObjectIterator<T> {
            next(): T {
                if ( (mod = cursor = cursor.next) === tail ) {
                    return <any>null;
                }

                return cursor.val;
            }

            hasNext(): boolean {
                return cursor !== tail && cursor.next !== tail;
            }

            remove(): void {
                if ( mod !== cursor || mod === head || mod === tail || CoreUtils.isNone( cursor ) ) {
                    throw new IllegalStateException();
                }

                let tmp = cursor.prev;
                that.removeNode( cursor );
                cursor = tmp;
            }
        };
    }

    public size(): number {
        return this.length;
    }

    public addFirst( e: T ): void {
        if ( !this.offerFirst( e ) ) {
            throw new IllegalStateException( "Deque full." );
        }
    }

    public addLast( e: T ): void {
        if ( !this.offerLast( e ) ) {
            throw new IllegalStateException( "Deque full." );
        }
    }

    public getFirst(): T {
        let node = this.head.next;

        if ( node === this.tail ) {
            throw new NoSuchElementException();
        }

        return node.val;
    }

    public getLast(): T {
        let node = this.tail.prev;

        if ( node === this.head ) {
            throw new NoSuchElementException();
        }

        return node.val;
    }

    public offerFirst( e: T ): boolean {
        let head = this.head,
            node = new LinkedList.Node( e, <any>null, <any>null );

        node.prev = head;
        node.next = head.next;
        head.next = head.next.prev = node;

        this.length += 1;
        return true;
    }

    public offerLast( e: T ): boolean {
        let tail = this.tail,
            node = new LinkedList.Node( e, <any>null, <any>null );

        node.next = tail;
        node.prev = tail.prev;
        tail.prev = tail.prev.next = node;

        this.length += 1;
        return true;
    }

    public peekFirst(): T {
        let node = this.head.next;
        return node !== this.tail ? node.val : <any>null;
    }

    public peekLast(): T {
        let node = this.tail.prev;
        return node !== this.head ? node.val : <any>null;
    }

    public pollFirst(): T {
        let node = this.head.next;

        if ( node === this.tail ) {
            return <any>null;
        }

        this.removeNode( node );
        return node.val;
    }

    public pollLast(): T {
        let node = this.tail.prev;

        if ( node === this.head ) {
            return <any>null;
        }

        this.removeNode( node );
        return node.val;
    }

    public pop(): T {
        return this.removeFirst();
    }

    public push( e: T ): void {
        this.addFirst( e );
    }

    public removeFirst(): T {
        let val = this.pollFirst();
        if ( CoreUtils.isNone( val ) ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    public removeLast(): T {
        let val = this.pollLast();
        if ( CoreUtils.isNone( val ) ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    public element(): T {
        return this.getFirst();
    }

    public offer( e: T ): boolean {
        return this.offerLast( e );
    }

    public peek(): T {
        return this.peekFirst();
    }

    public poll(): T {
        return this.pollFirst();
    }

    public remove( o?: any ): T | boolean {
        if ( !o ) {
            return this.removeFirst();
        }

        let head = this.head,
            tail = this.tail;

        while ( (head = head.next) !== tail ) {
            if ( head.val === o ) {
                this.removeNode( head );
                return true;
            }
        }

        return false;
    }

    public clear(): void {
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.length = 0;
    }
}