import { Collection } from "./collection";

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