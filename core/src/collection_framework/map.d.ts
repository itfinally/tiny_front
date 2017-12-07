import { Collection, CollectionType, Iterator } from "./collection";

export class MapEntry<K, V> {
    readonly key: K;
    readonly value: V;
}

export interface Set<T> extends Collection<T> {
}

export interface Map<K, V> {
    clear(): void;

    containsKey( key: K ): boolean;

    containsValue( val: V ): boolean;

    entrySet(): Set<MapEntry<K, V>>;

    get( key: K ): V;

    isEmpty(): boolean;

    keySet(): Set<K>;

    put( key: K, value: V ): V;

    putAll( map: Map<K, V> ): void;

    remove( key: K ): V;

    size(): number;

    values(): Collection<V>;
}

export declare class HashMap<K, V> implements Map<K, V> {
    constructor( initCapacity?: number, loadFactor?: number );

    public clear(): void;

    public containsKey( key: K ): boolean;

    public containsValue( val: V ): boolean;

    public entrySet(): Set<MapEntry<K, V>>;

    public get( key: K ): V;

    public isEmpty(): boolean;

    public keySet(): Set<K>;

    public put( key: K, value: V ): V;

    public putAll( map: Map<K, V> ): void;

    public remove( key: K ): V;

    public size(): number;

    public values(): Collection<V>;
}

export declare class HashSet<T> implements Set<T> {
    public add( val: T ): boolean;

    public addAll( val: CollectionType<T>, index?: number ): boolean;

    public clear(): void;

    public contains( val: T ): boolean;

    public containAll( collection: CollectionType<T> ): boolean;

    public isEmpty(): boolean;

    public remove( val?: T ): any;

    public removeAll( collection: CollectionType<T> ): boolean;

    public size(): number;

    public toArray(): T[];

    public iterator(): Iterator<T>;

    public [Symbol.iterator](): Iterator<T>;

    public forEach( callbackFn: ( val: T, index: number ) => boolean ): void;
}