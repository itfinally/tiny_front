import { IllegalStateException, UnsupportedOperationException } from "../exception";
import { Collection, Iterator } from "./collection";
import { CoreUtils } from "../core_utils";

// class HashUtils {
//     static dekHash( target ) {
//         let hashCode = 0;
//
//         for ( let i = 0; i < target.length; i += 1 ) {
//             hashCode = ( ( hashCode << 5 ) ^ ( hashCode >> 27 ) ) ^ target.charCodeAt( i );
//         }
//
//         return hashCode;
//     }
//
//     static fnvHash( target ) {
//         let fnvPrime = 0x811C9DC5,
//             hashCode = 0;
//
//         for ( let i = 0; i < target.length; i += 1 ) {
//             hashCode *= fnvPrime;
//             hashCode ^= target.charCodeAt( i );
//         }
//
//         return hashCode;
//     }
//
//     static pjwHash( target ) {
//         let bitsInUnsignedInt = 4 * 8,
//             threeQuarters = ( bitsInUnsignedInt * 3 ) / 4,
//             oneEighth = bitsInUnsignedInt / 8,
//             highBits = 0xffffffff << ( bitsInUnsignedInt - oneEighth ),
//             hashCode = 0,
//             tmp = 0;
//
//         for ( let i = 0; i < target.length; i += 1 ) {
//             hashCode = ( hashCode << oneEighth ) + target.charCodeAt( i );
//
//             if ( ( tmp = hashCode & highBits ) !== 0 ) {
//                 hashCode = ( ( hashCode ^ ( tmp >> threeQuarters ) ) & ( ~highBits ) );
//             }
//         }
//
//         return hashCode;
//     }
// }

/**
 * Cannot use number or boolean as key!!!
 *
 * @abstract
 * @class Map
 */
class Map {
    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    clear() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param key
     * @throws {UnsupportedOperationException}
     * @return {boolean}
     */
    containsKey( key ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param val
     * @throws {UnsupportedOperationException}
     * @return {boolean}
     */
    containsValue( val ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    entrySet() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param key
     * @throws {UnsupportedOperationException}
     */
    get( key ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @throws {UnsupportedOperationException}
     * @return {boolean}
     */
    isEmpty() {
        return this.size() <= 0;
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    keySet() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param key
     * @param value
     * @throws {UnsupportedOperationException}
     */
    put( key, value ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param {Map} map
     * @throws {UnsupportedOperationException}
     */
    putAll( map ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param key
     * @throws {UnsupportedOperationException}
     */
    remove( key ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    size() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     * @return {List}
     */
    values() {
        throw new UnsupportedOperationException();
    }
}

/**
 * @type {Map.Entry}
 * @private
 */
Map.Entry = class {
    constructor( hash, key, val, next ) {
        this.hash = hash;
        this.key = key;
        this.val = val;
        this.next = next;
    }
};

/**
 * @abstract
 * @class SortedMap
 * @extends Map
 */
class SortedMap extends Map {
    /**
     * @throws {UnsupportedOperationException}
     */
    comparator() {
        throw new UnsupportedOperationException();
    }

    /**
     * @throws {UnsupportedOperationException}
     */
    firstKey() {
        throw new UnsupportedOperationException();
    }

    /**
     * @param toKey
     * @throws {UnsupportedOperationException}
     */
    headMap( toKey ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @throws {UnsupportedOperationException}
     */
    lastKey() {
        throw new UnsupportedOperationException();
    }

    /**
     * @param fromKey
     * @param toKey
     * @throws {UnsupportedOperationException}
     */
    subMap( fromKey, toKey ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @param fromKey
     * @throws {UnsupportedOperationException}
     */
    tailMap( fromKey ) {
        throw new UnsupportedOperationException();
    }
}

/**
 * @abstract
 * @class Set
 * @extends Collection
 */
class Set extends Collection {

    /**
     * @abstract
     * @param element
     * @throws {UnsupportedOperationException}
     */
    add( element ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param collection
     * @throws {UnsupportedOperationException}
     */
    addAll( collection ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param target
     * @throws {UnsupportedOperationException}
     */
    contains( target ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param collection
     * @throws {UnsupportedOperationException}
     */
    containsAll( collection ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    isEmpty() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param target
     * @throws {UnsupportedOperationException}
     */
    remove( target ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param collection
     * @throws {UnsupportedOperationException}
     */
    removeAll( collection ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    size() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    toArray() {
        throw new UnsupportedOperationException();
    }
}

/**
 * @class HashMap
 * @extends Map
 */
export class HashMap extends Map {
    /**
     * @param {number} [initCapacity]
     * @param {number} [loadFactor]
     */
    constructor( initCapacity = 16, loadFactor = .75 ) {
        super();

        /**
         * @type {number}
         * @private
         */
        this._size = 0;

        /**
         * @type {Array}
         * @private
         */
        this._elements = [];

        /**
         * @type {number}
         * @private
         */
        this._capacity = initCapacity;

        /**
         * @type {number}
         * @private
         */
        this._loadFactor = loadFactor;

        /**
         * @type {number}
         * @private
         */
        this._threshold = initCapacity * loadFactor;
    }

    /**
     * @private
     */
    _resize() {
        if ( this._size < this._threshold ) {
            return;
        }

        this._reload( this._capacity * 2 )
    }

    /**
     * @private
     */
    _reload( capacity ) {
        capacity = capacity > Collection.MAX_CACPCITY ? Collection.MAX_CACPCITY : capacity;

        let elem, cursor,

            newCapacity = [],
            oldCapacity = this._elements,
            threshold = capacity * this._loadFactor;

        for ( let index = 0, size = oldCapacity.length; index < size; index += 1 ) {
            elem = oldCapacity[ index ];

            while ( !CoreUtils.isNone( elem ) ) {
                cursor = elem.hash & (capacity - 1);

                if ( !newCapacity[ cursor ] ) {
                    newCapacity[ cursor ] = new Map.Entry( elem.hash, elem.key, elem.val, null );

                } else {
                    let node = newCapacity[ cursor ];
                    while ( node.next !== null ) {
                        node = node.next;
                    }

                    node.next = new Map.Entry( elem.hash, elem.key, elem.val, null );
                }

                elem = elem.next;
            }
        }

        this._capacity = capacity;
        this._threshold = threshold;
        this._elements = newCapacity;
    }

    /**
     * @param addSize
     * @return {number}
     * @private
     */
    _calculateSize( addSize ) {
        let size = 2,
            requireCap = (this._size + addSize) / this._loadFactor;

        while ( size < requireCap ) {
            size *= 2;
        }

        return size;
    }

    /**
     * @param key
     * @return {number}
     * @private
     */
    _hash( key ) {
        let h;
        return null === key || undefined === key ? 0 : (h = key.hashCode) & (h >>> 16);
    }

    /**
     * @protected
     * @return Iterator
     */
    _iterator() {
        let node, mod,

            index = 0,
            cursor = 0,
            that = this,
            elements = this._elements;

        return new class extends Iterator {
            next() {
                if ( !this.hasNext() ) {
                    return;
                }

                if ( !CoreUtils.isNone( node ) && CoreUtils.isNone( node.next ) ) {
                    node = mod = null;
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

            hasNext() {
                return cursor < that._size;
            }

            remove() {
                if ( mod !== node || CoreUtils.isNone( node ) ) {
                    throw new IllegalStateException();
                }

                let head,
                    lastIndex = index - 1;

                while( (head = elements[ lastIndex ]) === null ) {
                    lastIndex -= 1;
                }

                // back a step if node is head
                if ( node === head ) {
                    elements[ lastIndex ] = node.next;
                    index = lastIndex;
                    node.next = null;

                } else {
                    while ( head && head.next !== node ) {
                        head = head.next;
                    }

                    if ( !head ) {
                        return;
                    }

                    head.next = node.next;
                    node = node.next = null;
                }

                cursor -= 1;
                that._size -= 1;
            }
        };
    }

    /**
     * @param key
     * @return {*}
     */
    get( key ) {
        let hash = this._hash( key ),
            node = this._elements[ hash & (this._capacity - 1) ];

        while ( node !== null ) {
            if ( node.hash === hash && ( key === node.key || CoreUtils.eq( key, node.key ) ) ) {
                return node.val;
            }

            node = node.next;
        }

        return null;
    }

    /**
     * @param key
     * @param value
     * @return {*}
     */
    put( key, value ) {
        let last,
            hash = this._hash( key ),
            node = this._elements[ hash & (this._capacity - 1) ];

        if ( CoreUtils.isNone( node ) ) {
            this._elements[ hash & (this._capacity - 1) ] = new Map.Entry( hash, key, value, null );

        } else {
            while ( node !== null ) {
                if ( node.hash === hash && (key === node.key || CoreUtils.eq( key, node.key )) ) {
                    let oldVal = node.val;
                    node.val = value;

                    return oldVal;
                }

                last = node;
                node = node.next;
            }

            last.next = new Map.Entry( hash, key, value, null );
        }

        this._size += 1;
        this._resize();
        return null;
    }

    /**
     * @param map
     */
    putAll( map ) {
        if ( this._size + map.size() >= this._threshold ) {
            this._reload( this._calculateSize( map.size() ) );
        }

        for ( let entry of map.entrySet() ) {
            this.put( entry.key, entry.val );
        }
    }

    /**
     * @param key
     * @return {*}
     */
    remove( key ) {
        let hash = this._hash( key ),
            node = this._elements[ hash & (this._capacity - 1) ];

        if ( CoreUtils.isNone( node ) ) {
            return null;
        }

        if ( node.hash === hash && ( key === node.key || CoreUtils.eq( key, node.key ) ) ) {
            this._elements[ hash & (this._capacity - 1) ] = null;
            this._size -= 1;
            return node.val;
        }

        let last;
        while ( node.next !== null ) {
            last = node;
            node = node.next;

            if ( node.hash === hash && ( key === node.key || CoreUtils.eq( key, node.key ) ) ) {
                last.next = node.next;
                this._size -= 1;
                return node.val;
            }
        }

        return null;
    }

    /**
     * @return {number}
     */
    size() {
        return this._size;
    }

    /**
     * @param key
     * @return {boolean}
     */
    containsKey( key ) {
        let hash = this._hash( key ),
            node = this._elements[ hash & (this._capacity - 1) ];

        while ( !CoreUtils.isNone( node ) ) {
            if ( node.hash === hash && (key === node.key || CoreUtils.eq( key, node.key )) ) {
                return true;
            }

            node = node.next;
        }

        return false;
    }

    /**
     * @param val
     * @return {boolean}
     */
    containsValue( val ) {
        let node,
            elements = this._elements;

        for ( let index = 0, size = elements.length; index < size; index += 1 ) {
            node = elements[ index ];

            while ( !CoreUtils.isNone( node ) ) {
                if ( typeof node.val !== typeof val ) {
                    node = node.next;
                    continue;
                }

                if ( node.val === val || CoreUtils.eq( node.val, val ) ) {
                    return true;
                }

                node = node.next;
            }
        }

        return false;
    }

    /**
     * @return {Set<K>}
     */
    keySet() {
        let that = this;

        return new class extends Set {
            contains( target ) {
                return that.containsKey( target );
            }

            remove( target ) {
                return that.remove( target );
            }

            size() {
                return that._size;
            }

            clear() {
                return that.clear();
            }

            iterator() {
                let iterator = that._iterator();

                return new class extends Iterator {
                    next() {
                        let node = iterator.next();
                        return node !== null ? node.key : null;
                    }

                    hasNext() {
                        return iterator.hasNext();
                    }

                    remove() {
                        return iterator.remove();
                    }
                };
            }
        };
    }

    /**
     * @return {Collection<V>}
     */
    values() {
        let that = this,
            elements = this._elements;

        return new class extends Collection {
            contains( target ) {
                return that.containsValue( target );
            }

            size() {
                return super.size();
            }

            clear() {
                that.clear();
            }

            iterator() {
                let iterator = that._iterator();

                return new class extends Iterator {
                    next() {
                        let node = iterator.next();
                        return node !== null ? node.val : null;
                    }

                    hasNext() {
                        return iterator.hasNext();
                    }

                    remove() {
                        return iterator.remove();
                    }
                };
            }
        };
    }

    /**
     * @return {Set<MapEntry<K, V>>}
     */
    entrySet() {
        let that = this;

        return new class extends Set {
            contains( target ) {
                if ( !(target instanceof Map.Entry) ) {
                    return false;
                }

                let node = that._elements[ target.hash & (that._capacity - 1) ];
                while ( node !== null ) {
                    if ( node.hash === target.hash && (target.key === node.key || CoreUtils.eq( target.key, node.key )) ) {
                        return true;
                    }

                    node = node.next;
                }

                return false;
            }

            remove( target ) {
                return that.remove( target );
            }

            size() {
                return that._size;
            }

            clear() {
                that.clear();
            }

            iterator() {
                let iterator = that._iterator();

                return new class extends Iterator {
                    next() {
                        let node = iterator.next();
                        return node !== null ? new Map.Entry( null, node.key, node.val, null ) : null;
                    }

                    hasNext() {
                        return iterator.hasNext();
                    }

                    remove() {
                        return iterator.remove();
                    }
                };
            }
        };
    }

    /**
     */
    clear() {
        this._elements = [];
        this._size = 0;
    }

    toString() {
        let entries = Object.create( null );
        for ( let entry of this.entrySet() ) {
            entries[ entry.key ] = entry.val;
        }

        return JSON.stringify( entries );
    }
}