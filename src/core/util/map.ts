import { AbstractCollection, Collection, isCollection, ObjectIterator } from "./collection";
import { Assert, CoreUtils, MAX_INTEGER } from "../lang";
import { IllegalStateException, UnsupportedOperationException } from "../exception";

export interface Entry<K, V> {
    key: K;
    value: V;
    hash: number;
    next: Entry<K, V>;
}

function isMap( m: any ): void {
    if ( !(m instanceof AbstractMap) ) {
        throw new TypeError( `Expect type Map, but got ${typeof m}` );
    }
}

export interface Map<K, V> {
    clear(): void;

    containsKey( key: any ): boolean;

    containsValue( value: any ): boolean;

    entrySet(): Set<Entry<K, V>>;

    get( key: any ): V;

    getOrDefault( key: any, defaultVal: V ): V;

    isEmpty(): boolean;

    keySet(): Set<K>;

    put( key: K, value: V ): V;

    putAll( map: Map<K, V> ): void;

    remove( key: any ): V;

    size(): number;

    values(): Collection<V>;
}

export interface Set<T>extends Collection<T> {
    add( e: T ): boolean;

    addAll( c: Collection<T> ): boolean;

    remove( o: any ): boolean;
}

export abstract class AbstractMap<K, V> implements Map<K, V> {
    public size(): number {
        return this.entrySet().size();
    }

    public clear(): void {
        this.entrySet().clear();
    }

    public containsKey( key: any ): boolean {
        for ( let k of this.keySet() ) {
            if ( k === key ) {
                return true;
            }
        }

        return false;
    }

    public containsValue( value: any ): boolean {
        for ( let v of this.values() ) {
            if ( v === value ) {
                return true;
            }
        }

        return false;
    }

    public abstract entrySet(): Set<Entry<K, V>>;

    public get( key: any ): V {
        for ( let entry of this.entrySet() ) {
            if ( entry.key === key ) {
                return entry.value;
            }
        }

        return <any>null;
    }

    public getOrDefault( key: any, defaultVal: V ): V {
        return this.containsKey( key ) ? this.get( key ) : defaultVal;
    }

    public isEmpty(): boolean {
        return this.size() <= 0;
    }

    public keySet(): Set<K> {
        let that = this;

        return new class extends AbstractSet<K> {
            public iterator(): ObjectIterator<K> {
                let it: ObjectIterator<Entry<K, V>> = that.entrySet().iterator();

                return new class implements ObjectIterator<K> {
                    public next(): K {
                        return it.next().key;
                    }

                    public hasNext(): boolean {
                        return it.hasNext();
                    }

                    public remove(): void {
                        it.remove();
                    }
                };
            }

            public size(): number {
                return that.size();
            }

            public contains( o: any ): boolean {
                return that.containsKey( o );
            }

            public isEmpty(): boolean {
                return that.isEmpty();
            }

            public clear(): void {
                that.clear();
            }
        };
    }

    public abstract put( key: K, value: V ): V;

    public putAll( map: Map<K, V> ): void {
        Assert.requireNotNull( map );
        isMap( map );

        for ( let entry of map.entrySet() ) {
            this.put( entry.key, entry.value );
        }
    }

    public remove( key: any ): V {
        let entry,
            it = this.entrySet().iterator();

        while ( it.hasNext() ) {
            entry = it.next();

            if ( entry.key === key ) {
                it.remove();
                return entry.value;
            }
        }

        return <any>null;
    }

    public values(): Collection<V> {
        let that = this;

        return new class extends AbstractCollection<V> {
            public iterator(): ObjectIterator<V> {
                let it: ObjectIterator<Entry<K, V>> = that.entrySet().iterator();

                return new class implements ObjectIterator<V> {
                    public next(): V {
                        return it.next().value;
                    }

                    hasNext(): boolean {
                        return it.hasNext();
                    }

                    remove(): void {
                        it.remove();
                    }
                };
            }

            public size(): number {
                return that.size();
            }

            public contains( o: any ): boolean {
                return that.containsValue( o );
            }

            public clear(): void {
                that.clear();
            }
        };
    }

    public toString(): string {
        let entries = Object.create( null );

        for ( let entry of this.entrySet() ) {
            entries[ entry.key ] = entry.value;
        }

        return JSON.stringify( entries );
    }
}

export abstract class AbstractSet<T> extends AbstractCollection<T> implements Set<T> {
    public abstract iterator(): ObjectIterator<T>;

    public abstract size(): number;

    public add( e: T ): boolean {
        throw new UnsupportedOperationException();
    }

    public addAll( c: Collection<T> ): boolean {
        Assert.requireNotNull( c );
        isCollection( c );

        for ( let item of c ) {
            this.add( item );
        }

        return true;
    }

    public remove( o: any ): boolean {
        return super.remove( o );
    }
}

export class HashMap<K, V> extends AbstractMap<K, V> implements Map<K, V> {
    private static Entry = class<K, V> implements Entry<K, V> {
        key: K;
        value: V;
        hash: number;
        next: Entry<K, V>;

        constructor( key: K, value: V, hash: number, next: Entry<K, V> ) {
            this.key = key;
            this.value = value;
            this.hash = hash;
            this.next = next;
        }
    };

    private elements: Entry<K, V>[] = [];
    private loadFactor: number;
    private threshold: number;
    private capacity: number;
    private length: number;

    constructor( initCapacity: number = 16, loadFactor: number = .75 ) {
        super();

        this.length = 0;
        this.capacity = initCapacity;
        this.loadFactor = loadFactor;
        this.threshold = initCapacity * loadFactor;
    }

    private static hash( key: any ): number {
        let h;
        return CoreUtils.isNone( key ) ? 0 : (h = key.hashCode) & (h >>> 16);
    }

    private resize(): void {
        if ( this.length < this.threshold ) {
            return;
        }

        this.reload( this.capacity * 2 );
    }

    private reload( capacity: number ): void {
        capacity = capacity > MAX_INTEGER ? MAX_INTEGER : capacity;

        let elem: Entry<K, V>,
            cursor: number,

            newCapacity: Entry<K, V>[] = [],
            oldCapacity: Entry<K, V>[] = this.elements,
            threshold: number = capacity * this.loadFactor;

        for ( let index = 0, size = oldCapacity.length; index < size; index += 1 ) {
            elem = oldCapacity[ index ];

            while ( !CoreUtils.isNone( elem ) ) {
                cursor = elem.hash & (capacity - 1);

                if ( !newCapacity[ cursor ] ) {
                    newCapacity[ cursor ] = new HashMap.Entry( elem.key, elem.value, elem.hash, <any>null );

                } else {
                    let node = newCapacity[ cursor ];
                    while ( node.next !== null ) {
                        node = node.next;
                    }

                    node.next = new HashMap.Entry( elem.key, elem.value, elem.hash, <any>null );
                }

                elem = elem.next;
            }
        }

        this.capacity = capacity;
        this.threshold = threshold;
        this.elements = newCapacity;
    }

    private calculateSize( addSize: number ): number {
        let size = 2,
            requireCap = Math.min( (this.length + addSize) / this.loadFactor, MAX_INTEGER );

        // use '>>>' to remove sign flag
        while ( size < requireCap ) {
            size = (size <<= 1) >>> 0;
        }

        return size;
    }

    private getIterator(): ObjectIterator<Entry<K, V>> {
        let node: Entry<K, V>,
            mod: Entry<K, V>,

            index = 0,
            cursor = 0,
            that = this,
            elements = this.elements;

        return new class implements ObjectIterator<Entry<K, V>> {
            public next(): Entry<K, V> {
                if ( !this.hasNext() ) {
                    return <any>null;
                }

                if ( !CoreUtils.isNone( node ) && CoreUtils.isNone( node.next ) ) {
                    node = mod = <any>null;
                }

                // find node from other bucket if linked list is done
                while ( CoreUtils.isNone( node ) && index < elements.length ) {
                    if ( !CoreUtils.isNone( node = mod = elements[ index ] ) ) {

                        index += 1;
                        cursor += 1;
                        return node;
                    }

                    index += 1;
                }

                cursor += 1;

                // find node from linked list
                return node = mod = node.next;
            }

            public hasNext(): boolean {
                return cursor < that.length;
            }

            public remove(): void {
                if ( mod !== node || CoreUtils.isNone( node ) ) {
                    throw new IllegalStateException();
                }

                let head,
                    prevIndex = index - 1;

                while ( (head = elements[ prevIndex ]) === null ) {
                    prevIndex -= 1;
                }

                // back a step if node is head
                if ( node === head ) {
                    elements[ prevIndex ] = node.next;
                    node.next = <any>null;
                    index = prevIndex;

                } else {
                    while ( head && head.next !== node ) {
                        head = head.next;
                    }

                    if ( !head ) {
                        return;
                    }

                    head.next = node.next;
                    node = node.next = <any>null;
                }

                cursor -= 1;
                that.length -= 1;
            }
        };
    }

    public entrySet(): Set<Entry<K, V>> {
        let that = this;

        return new class extends AbstractSet<Entry<K, V>> {
            public iterator(): ObjectIterator<Entry<K, V>> {
                let it = that.getIterator();

                return new class implements ObjectIterator<Entry<K, V>> {
                    public next(): Entry<K, V> {
                        let entry = it.next();
                        return new HashMap.Entry( entry.key, entry.value, -1, <any>null );
                    }

                    public hasNext(): boolean {
                        return it.hasNext();
                    }

                    public remove(): void {
                        it.remove();
                    }
                };
            }

            public size(): number {
                return that.size();
            }

            public contains( o: any ): boolean {
                return that.containsKey( o );
            }

            public remove( o: any ): boolean {
                that.remove( o );
                return true;
            }

            public clear(): void {
                that.clear();
            }
        }
    }

    public put( key: K, value: V ): V {
        let elements = this.elements,
            hash = HashMap.hash( key ),
            node = elements[ hash & (this.capacity - 1) ];

        if ( CoreUtils.isNone( node ) ) {
            elements[ hash & (this.capacity - 1) ] = new HashMap.Entry( key, value, hash, <any>null );

        } else {
            let last: Entry<K, V> = node;

            while ( node !== null ) {
                if ( node.hash === hash && (key === node.key || CoreUtils.eq( key, node.key )) ) {
                    let oldVal = node.value;
                    node.value = value;

                    return oldVal;
                }

                last = node;
                node = node.next;
            }

            last.next = new HashMap.Entry( key, value, hash, <any>null );
        }

        this.length += 1;
        this.resize();

        return <any>null;
    }

    public putAll( map: Map<K, V> ): void {
        Assert.requireNotNull( map );
        isMap( map );

        if ( this.length + map.size() >= this.threshold ) {
            this.reload( this.calculateSize( map.size() ) );
        }

        for ( let entry of map.entrySet() ) {
            this.put( entry.key, entry.value );
        }
    }

    public remove( key: any ): V {
        let elements = this.elements,
            hash = HashMap.hash( key ),
            index = hash & (this.capacity - 1),

            node = elements[ index ];

        if ( CoreUtils.isNone( node ) ) {
            return <any>null;
        }

        if ( node.hash === hash && ( key === node.key || CoreUtils.eq( key, node.key ) ) ) {

            // one node bucket
            if ( node === elements[ index ] && null === node.next ) {
                elements[ index ] = <any>null;

            } else {
                // multi node bucket
                elements[ index ] = node.next;
                node.next = <any>null;
            }

            this.length -= 1;

            return node.value;
        }

        let last;
        while ( node.next !== null ) {
            last = node;
            node = node.next;

            if ( node.hash === hash && ( key === node.key || CoreUtils.eq( key, node.key ) ) ) {
                last.next = node.next;
                this.length -= 1;

                return node.value;
            }
        }

        return <any>null;
    }

    public containsKey( key: any ): boolean {
        let hash = HashMap.hash( key ),
            node = this.elements[ hash & (this.capacity - 1) ];

        while ( !CoreUtils.isNone( node ) ) {
            if ( node.hash === hash && (key === node.key || CoreUtils.eq( key, node.key )) ) {
                return true;
            }

            node = node.next;
        }

        return false;
    }

    public containsValue( value: any ): boolean {
        let node,
            elements = this.elements;

        for ( let index = 0, size = elements.length; index < size; index += 1 ) {
            node = elements[ index ];

            while ( !CoreUtils.isNone( node ) ) {
                if ( typeof node.value !== typeof value ) {
                    node = node.next;
                    continue;
                }

                if ( node.value === value || CoreUtils.eq( node.value, value ) ) {
                    return true;
                }

                node = node.next;
            }
        }

        return false;
    }

    public size(): number {
        return this.length;
    }

    public get( key: any ): V {
        let hash = HashMap.hash( key ),
            node = this.elements[ hash & (this.capacity - 1) ];

        while ( !CoreUtils.isNone( node ) ) {
            if ( node.hash === hash && ( key === node.key || CoreUtils.eq( key, node.key ) ) ) {
                return node.value;
            }

            node = node.next;
        }

        return <any>null;
    }

    public values(): Collection<V> {
        let that = this;

        return new class extends AbstractCollection<V> {
            public iterator(): ObjectIterator<V> {
                let it = that.getIterator();

                return new class implements ObjectIterator<V> {
                    public next(): V {
                        return it.next().value;
                    }

                    public hasNext(): boolean {
                        return it.hasNext();
                    }

                    public remove(): void {
                        it.remove();
                    }
                };
            }

            public size(): number {
                return that.length;
            }

            public clear(): void {
                that.clear();
            }

            public contains( o: any ): boolean {
                return that.containsValue( o );
            }
        };
    }

    public keySet(): Set<K> {
        let that = this;
        return new class extends AbstractSet<K> {
            public iterator(): ObjectIterator<K> {
                let it = that.getIterator();

                return new class implements ObjectIterator<K> {
                    public next(): K {
                        return it.next().key;
                    }

                    public hasNext(): boolean {
                        return it.hasNext();
                    }

                    public remove(): void {
                        it.remove();
                    }
                };
            }

            public size(): number {
                return that.length;
            }

            public contains( o: any ): boolean {
                return that.containsKey( o );
            }

            public clear(): void {
                that.clear();
            }
        }
    }

    public clear(): void {
        this.elements = [];
        this.length = 0;
    }

    public isEmpty(): boolean {
        return this.length <= 0;
    }
}

export class HashSet<T> extends AbstractSet<T> implements Set<T> {
    private map: Map<T, null> = new HashMap();

    public iterator(): ObjectIterator<T> {
        return this.map.keySet().iterator();
    }

    public size(): number {
        return this.map.size();
    }

    public add( e: T ): boolean {
        this.map.put( e, null );
        return true;
    }

    public remove( o: any ): boolean {
        this.map.remove( o );
        return true;
    }

    public contains( o: any ): boolean {
        return this.map.containsKey( o );
    }

    public isEmpty(): boolean {
        return this.map.isEmpty();
    }

    public clear(): void {
        this.map.clear();
    }
}