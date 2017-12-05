type CollectionType<T> = Array<T> | Collection<T>;

export declare interface Collection<T> extends Iterable<T> {
    add( val: T ): boolean;

    addAll( val: CollectionType<T>, index?: number ): boolean;

    clear(): void;

    contains( val: T ): boolean;

    containAll( collection: CollectionType<T> ): boolean;

    isEmpty(): boolean;

    remove( val?: T ): any;

    removeAll( collection: CollectionType<T> ): boolean;

    size(): number;

    toArray(): T[];

    iterator(): Iterator<T>;

    [Symbol.iterator](): Iterator<T>;
}

export declare interface List<T> extends Collection<T> {
    get( index: number ): T;

    indexOf( target: any ): number;

    lastIndexOf( target: any ): number;

    set( index: number, element: T ): T;

    remove( val: T ): boolean;
}


export declare class ArrayList<T> implements List<T> {
    new( iterate?: Iterator<T> ): this;

    public addAll( val: Collection<T> | T[], index: number ): boolean;

    public get( index: number ): T;

    public indexOf( target: any ): number;

    public lastIndexOf( target: any ): number;

    public set( index: number, element: T ): T;

    public add( val: T ): boolean;

    public clear(): void;

    public contains( val: T ): boolean;

    public containAll( collection: Collection<T> | T[] ): boolean;

    public isEmpty(): boolean;

    public remove( val: T ): boolean;

    public removeAll( collection: Collection<T> | T[] ): boolean;

    public size(): number;

    public toArray(): T[];

    public [Symbol.iterator](): Iterator<T>;

    public iterator(): Iterator<T>;
}

export declare class LinkedList<T> implements List<T> {
    new( iterate?: Iterator<T> ): this;

    public get( index: number ): T;

    public indexOf( target: any ): number;

    public lastIndexOf( target: any ): number;

    public set( index: number, element: T ): T;

    public add( val: T ): boolean;

    public addAll( val: Collection<T> | T[], index?: number | undefined ): boolean;

    public clear(): void;

    public contains( val: T ): boolean;

    public containAll( collection: Collection<T> | T[] ): boolean;

    public isEmpty(): boolean;

    public remove( val: T ): boolean;

    public removeAll( collection: Collection<T> | T[] ): boolean;

    public size(): number;

    public toArray(): T[];

    public [Symbol.iterator](): Iterator<T>;

    public iterator(): Iterator<T>;
}

export declare interface Queue<T> extends Collection<T> {
    element(): T;

    offer( element: T ): boolean;

    peek(): T;

    poll(): T;

    remove(): T;
}

export declare interface Deque<T> extends Queue<T> {
    addFirst( element: T ): void;

    addLast( element: T ): void;

    getFirst(): T;

    getLast(): T;

    offerFirst( element: T ): boolean;

    offerLast( element: T ): boolean;

    peekFirst(): T;

    peekLast(): T;

    pollFirst(): T;

    pollLast(): T;

    pop(): T;

    push( element: T ): void;

    removeFirst(): T;

    removeLast(): T;
}

export class ArrayDeque<T> implements Deque<T> {
    new( initCapacity: number, border?: number ): this;

    public addFirst( element: T ): void;

    public addLast( element: T ): void;

    public getFirst(): T;

    public getLast(): T;

    public offerFirst( element: T ): boolean;

    public offerLast( element: T ): boolean;

    public peekFirst(): T;

    public peekLast(): T;

    public pollFirst(): T;

    public pollLast(): T;

    public pop(): T;

    public push( element: T ): void;

    public removeFirst(): T;

    public removeLast(): T;

    public element(): T;

    public offer( element: T ): boolean;

    public peek(): T;

    public poll(): T;

    public remove(): T;

    public add( val: T ): boolean;

    public addAll( val: Collection<T> | T[], index?: number | undefined ): boolean;

    public clear(): void;

    public contains( val: T ): boolean;

    public containAll( collection: Collection<T> | T[] ): boolean;

    public isEmpty(): boolean;

    public removeAll( collection: Collection<T> | T[] ): boolean;

    public size(): number;

    public toArray(): T[];

    public [Symbol.iterator](): Iterator<T>;

    public iterator(): Iterator<T>;
}

export class PriorityQueue<T> implements Queue<T> {
    public element(): T;

    public offer( element: T ): boolean;

    public peek(): T;

    public poll(): T;

    public remove(): T;

    public add( val: T ): boolean;

    public addAll( val: Collection<T> | T[], index?: number | undefined ): boolean;

    public clear(): void;

    public contains( val: T ): boolean;

    public containAll( collection: Collection<T> | T[] ): boolean;

    public isEmpty(): boolean;

    public removeAll( collection: Collection<T> | T[] ): boolean;

    public size(): number;

    public toArray(): T[];

    public [Symbol.iterator](): Iterator<T>;

    public iterator(): Iterator<T>;
}