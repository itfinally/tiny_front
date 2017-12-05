export interface Map<K, V> {
    getValue( key: K ): V;

    setValue( key: K, value: V ): boolean;

    containsKey( key: K ): boolean;

    containsValue( value: V ): boolean;

    keys(): K[];

    values(): V[];

    entries(): Iterator<any>;

    put( key: K, value: V ): V;

    putAll( key: K, value: V ): void;

    clear(): void;

    size(): number;

    isEmpty(): boolean;
}

export class MapEntry<K, V> {
    readonly key: K;
    readonly value: V;
}