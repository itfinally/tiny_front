import {
    UnsupportedOperationException,
    IndexOutOfBoundException,
    NoSuchElementException,
    IllegalStateException,
    NullPointException,

} from "../exception";

function isCollection( target ) {
    if ( !( target instanceof Array || target instanceof Collection ) ) {
        throw new TypeError( `Expect array or collection, bot got ${typeof target}` );
    }
}

/**
 * @interface Iterator
 */
export class Iterator {
    /**
     * @throws {UnsupportedOperationException}
     * @return {*}
     */
    next() {
    }

    /**
     * @throws {UnsupportedOperationException}
     * @return {boolean}
     */
    hasNext() {
    }

    /**
     * @throws {UnsupportedOperationException}
     * @return {boolean}
     */
    remove() {
    }
}

/**
 * @interface Iterable
 */
export class Iterable {

    /**
     * @return {Iterator}
     */
    iterator() {
    }

    /**
     * @param callbackFn
     */
    forEach( callbackFn ) {
    }
}

/**
 * @abstract
 * @class Collection
 * @extends Iterable
 */
export class Collection extends Iterable {
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
     * @param target
     * @throws {UnsupportedOperationException}
     */
    contains( target ) {
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
    clear() {
        throw new UnsupportedOperationException();
    }

    /**
     * @param collection
     * @throws {UnsupportedOperationException}
     */
    addAll( collection ) {
        isCollection( collection );

        for ( let elem of collection ) {
            this.add( elem );
        }
    }

    /**
     * @param collection
     * @throws {UnsupportedOperationException}
     * @return {boolean}
     */
    containsAll( collection ) {
        isCollection( collection );

        let all = true;

        for ( let elem of collection ) {
            if ( !this.contains( elem ) ) {
                all = false;
                break;
            }
        }

        return all;
    }

    /**
     * @throws {UnsupportedOperationException}
     * @return {boolean}
     */
    isEmpty() {
        return this.size() <= 0;
    }

    /**
     * @param target
     * @throws {UnsupportedOperationException}
     */
    remove( target ) {
        let iterator = this.iterator();

        while ( iterator.hasNext() ) {
            if ( iterator.next() === target ) {
                iterator.remove();
                return true;
            }
        }

        return false;
    }

    /**
     * @param collection
     * @throws {UnsupportedOperationException}
     * @return {boolean}
     */
    removeAll( collection ) {
        isCollection( collection );

        let all = true;
        for ( let elem of collection ) {
            all &= this.remove( elem );
        }

        return all;
    }

    /**
     * @throws {UnsupportedOperationException}
     */
    toArray() {
        let elements = [],
            iterator = this.iterator();

        while ( iterator.hasNext() ) {
            elements.push( iterator.next() );
        }

        return elements;
    }

    /**
     * @throws {UnsupportedOperationException}
     * @return {{next: (function())}}
     */
    [Symbol.iterator]() {
        let iterator = this.iterator();

        return {
            next: () => {
                return {
                    done: !iterator.hasNext(),
                    value: iterator.hasNext() ? iterator.next() : undefined
                };
            },
        };
    }

    /**
     * @param callbackFn
     * @throws {UnsupportedOperationException}
     */
    forEach( callbackFn ) {
        if ( !(callbackFn instanceof Function) ) {
            throw new TypeError( `Expect function but got ${callbackFn}` );
        }

        for ( let elem of this ) {
            if ( callbackFn( elem ) ) {
                break;
            }
        }
    }
}

// 0x7FFFFFFF === (2147483648 - 1), that is max unsigned integer in memory of javascript( 32 bit ).
// The highest bit is a flag bit, so capacity cannot greater than MAX_CAPACITY(either equal) otherwise
// the operation will be overflow or getting an negative number.
Collection.MAX_CACPCITY = 2147483648;

/**
 * @abstract
 * @class List
 * @extends Collection
 */
class List extends Collection {
    /**
     * @param collection
     * @param index
     * @throws {UnsupportedOperationException}
     */
    addAll( collection, index ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @param index
     * @throws {UnsupportedOperationException}
     */
    get( index ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @param target
     * @throws {UnsupportedOperationException}
     */
    indexOf( target ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @param target
     * @throws {UnsupportedOperationException}
     */
    lastIndexOf( target ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @param index
     * @param element
     * @throws {UnsupportedOperationException}
     */
    set( index, element ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @param fromIndex
     * @param toIndex
     * @throws {UnsupportedOperationException}
     */
    subList( fromIndex, toIndex ) {
        throw new UnsupportedOperationException();
    }
}

/**
 * @abstract
 * @class Queue
 * @extends Collection
 */
class Queue extends Collection {

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    element() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param element
     * @throws {UnsupportedOperationException}
     */
    offer( element ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    peek() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    poll() {
        throw new UnsupportedOperationException();
    }
}

/**
 * @abstract
 * @class Deque
 * @extends Queue
 */
class Deque extends Queue {
    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    getFirst() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    getLast() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param element
     * @throws {UnsupportedOperationException}
     */
    offerFirst( element ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @param element
     * @throws {UnsupportedOperationException}
     */
    offerLast( element ) {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    peekFirst() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    peekLast() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    pollFirst() {
        throw new UnsupportedOperationException();
    }

    /**
     * @abstract
     * @throws {UnsupportedOperationException}
     */
    pollLast() {
        throw new UnsupportedOperationException();
    }

    /**
     * @param element
     * @throws {IllegalStateException}
     * @return {boolean}
     */
    add( element ) {
        this.addLast( element );
        return true;
    }

    /**
     * @throws {NoSuchElementException}
     * @return {*}
     */
    element() {
        return this.getFirst();
    }

    /**
     * @param element
     * @return {*}
     */
    offer( element ) {
        return this.offerLast( element );
    }

    /**
     * @return {*}
     */
    peek() {
        return this.peekFirst();
    }

    /**
     * @return {*}
     */
    poll() {
        return this.pollFirst();
    }

    /**
     * @param element
     * @throws {IllegalStateException}
     */
    addFirst( element ) {
        if ( !this.offerFirst( element ) ) {
            throw new IllegalStateException();
        }
    }

    /**
     * @param element
     * @throws {IllegalStateException}
     */
    addLast( element ) {
        if ( !this.offerLast( element ) ) {
            throw new IllegalStateException();
        }
    }

    /**
     * @return {*}
     */
    pop() {
        return this.removeFirst();
    }

    /**
     * @param target
     * @return {*}
     */
    push( target ) {
        return this.addFirst( target );
    }

    /**
     * @throws {NoSuchElementException}
     * @return {*}
     */
    removeFirst() {
        let val = this.pollFirst();
        if ( null === val || undefined === val ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    /**
     * @throws {NoSuchElementException}
     * @return {*}
     */
    removeLast() {
        let val = this.pollLast();
        if ( null === val || undefined === val ) {
            throw new NoSuchElementException();
        }

        return val;
    }
}

/**
 * @class ArrayList
 * @extends List
 */
export class ArrayList extends List {
    /**
     * @constructor
     * @template T
     * @param canBeIteration
     */
    constructor( canBeIteration ) {
        super();
        this._elements = [];

        if ( canBeIteration ) {
            this.addAll( canBeIteration );
        }
    }

    /**
     * @param index
     * @private
     */
    _isOutOfBound( index ) {
        if ( index >= this._elements.length || index < 0 ) {
            throw new IndexOutOfBoundException();
        }
    }

    /**
     * @param element
     * @return {boolean}
     */
    add( element ) {
        this._elements.push( element );
        return true;
    }

    /**
     * @param target
     * @return {boolean}
     */
    contains( target ) {
        return this._elements.indexOf( target ) >= 0;
    }

    /**
     * @param collection
     * @param index
     */
    addAll( collection, index ) {
        isCollection( collection );

        let targets = [];
        for ( let elem of collection ) {
            targets.push( elem );
        }

        if ( !isFinite( index ) ) {
            this._elements = this._elements.concat( targets );

        } else {
            this._isOutOfBound( index );
            this._elements.splice( index, 1, ...targets );
        }
    }

    /**
     * @param index
     * @return {*}
     */
    get( index ) {
        this._isOutOfBound( index );
        return this._elements[ index ];
    }

    /**
     * @param target
     * @return {number}
     */
    indexOf( target ) {
        return this._elements.indexOf( target );
    }

    /**
     * @param target
     * @return {number}
     */
    lastIndexOf( target ) {
        let elements = this._elements;

        for ( let index = elements.length - 1; index >= 0; index -= 1 ) {
            if ( target === elements[ index ] ) {
                return index;
            }
        }
    }

    /**
     * @param index
     * @param element
     * @return {*}
     */
    set( index, element ) {
        let oldVal = this.get( index );
        this._elements.splice( index, 1, element );
        return oldVal;
    }

    /**
     * @param from
     * @param to
     * @return {Object}
     */
    subList( from = 0, to = this._elements.length - 1 ) {
        return new (Object.getPrototypeOf( this ).constructor)( this._elements.slice( from, to ) );
    }

    size() {
        return this._elements.length;
    }

    /**
     */
    clear() {
        this._elements = [];
    }

    /**
     * @return {Iterator<T>}
     */
    iterator() {
        let mod = 0,
            index = 0,
            elements = this._elements;

        return new class extends Iterator {
            next() {
                let elem = this.hasNext() ? elements[ mod = index ] : null;
                index += 1;

                return elem;
            }

            hasNext() {
                return index < elements.length;
            }

            remove() {
                if ( !(index - 1 === mod && mod < elements.length) ) {
                    return;
                }

                index -= 1;
                elements.splice( index, 1 );
            }
        };
    }

    toString() {
        return JSON.stringify( this._elements );
    }
}

/**
 * @class LinkedList
 * @extends List
 */
export class LinkedList extends List {
    /**
     * @constructor
     * @template T
     * @param canBeIteration
     */
    constructor( canBeIteration ) {
        super();
        this._head = new LinkedList.Node( null, null, null );
        this._tail = new LinkedList.Node( null, null, null );

        this.clear();

        if ( canBeIteration ) {
            this.addAll( canBeIteration );
        }
    }

    /**
     * @param index
     * @private
     */
    _isOutOfBound( index ) {
        if ( index >= this._size || index < 0 ) {
            throw new IndexOutOfBoundException();
        }
    }

    /**
     * @param last
     * @param node
     * @private
     */
    _addNode( last, node ) {
        if ( !(last instanceof LinkedList.Node && node instanceof LinkedList.Node) ) {
            return;
        }

        node.next = last.next;
        node.prev = last;

        last.next.prev = node;
        last.next = node;

        this._size += 1;
    }

    /**
     * @param element
     * @return {boolean}
     */
    add( element ) {
        this._addNode( this._tail.prev, new LinkedList.Node( null, null, element ) );
        return true;
    }

    /**
     * @param collection
     * @param index
     * @return {boolean}
     */
    addAll( collection, index ) {
        isCollection( collection );

        let begin;
        if ( !index ) {
            begin = this._tail.prev;

        } else {
            this._isOutOfBound( index );
            begin = this.get( index );
        }

        let node;
        for ( let elem of collection ) {
            node = new LinkedList.Node( null, null, elem );
            this._addNode( begin, node );

            begin = node;
        }

        return true;
    }

    /**
     * @param val
     * @return {boolean}
     */
    contains( val ) {
        let begin = this._head.next;

        while ( begin !== this._tail ) {
            if ( begin.val === val ) {
                return true;
            }

            begin = begin.next;
        }

        return false;
    }

    /**
     */
    clear() {
        this._head.next = this._tail;
        this._tail.prev = this._head;
        this._size = 0;
    }

    /**
     * @return {number}
     */
    size() {
        return this._size;
    }

    /**
     * @param index
     * @return {*}
     */
    get( index ) {
        this._isOutOfBound( index );

        let i = 0,
            begin = this._head.next;

        while ( i < index ) {
            begin = begin.next;
            i += 1;
        }

        return begin;
    }

    /**
     * @param target
     * @return {number}
     */
    indexOf( target ) {
        let index = 0,
            begin = this._head.next;

        while ( begin !== this._tail ) {
            if ( begin.val === target ) {
                return index;
            }

            index += 1;
            begin = begin.next;
        }

        return -1;
    }

    /**
     * @param target
     * @return {number}
     */
    lastIndexOf( target ) {
        let index = this._size - 1,
            begin = this._tail.prev;

        while ( begin !== this._head ) {
            if ( begin.val === target ) {
                return index;
            }

            index -= 1;
            begin = begin.prev;
        }

        return -1;
    }

    /**
     * @param index
     * @param val
     * @return {*}
     */
    set( index, val ) {
        let node = this.get( index ),
            oldVal = node.val;

        node.val = val;
        return oldVal;
    }

    /**
     * @param fromIndex
     * @param toIndex
     * @return {Object}
     */
    subList( fromIndex = 0, toIndex = this._size - 1 ) {
        let fromElem = this.get( fromIndex ),
            toElem = this.get( toIndex ),
            cursor = fromElem,

            subList = new (Object.getPrototypeOf( this ).constructor)();

        while ( cursor !== toElem.next ) {
            subList.add( cursor.val );
            cursor = cursor.next;
        }

        return subList;
    }

    iterator() {
        let mod,
            that = this,
            tail = that._tail,
            head = this._head,
            cursor = this._head;

        return new class extends Iterator {
            next() {
                if ( this.hasNext() ) {
                    mod = cursor = cursor.next;
                    return cursor.val;
                }

                return null;
            }

            hasNext() {
                return cursor.next !== tail;
            }

            remove() {
                if ( cursor === head || cursor === tail || cursor !== mod ) {
                    return;
                }

                cursor.prev.next = cursor.next;
                cursor.next.prev = cursor.prev;

                let tmp = cursor.prev;
                cursor.next = null;
                cursor.prev = null;
                cursor = tmp;

                that._size -= 1;
            }
        }
    }

    toString() {
        return JSON.stringify( this.toArray() );
    }
}

/**
 * @type {LinkedList.Node}
 * @class LinkedList.Node
 * @private
 */
LinkedList.Node = class {
    constructor( prev, next, val ) {
        this.prev = prev;
        this.next = next;
        this.val = val;
    }
};

/**
 * @class ArrayDeque
 * @extends Deque
 */
export class ArrayDeque extends Deque {
    /**
     * @constructor
     * @template T
     * @param {number} initCapacity
     * @param {boolean} [border]
     */
    constructor( initCapacity = 8, border ) {
        super();

        /**
         * @type {boolean}
         * @private
         */
        this._full = false;

        /**
         * @type {Array}
         * @private
         */
        this._elements = [];

        /**
         * @type {boolean}
         * @private
         */
        this._border = border;

        /**
         * @type {number}
         * @private
         */
        this._head = this._tail = 0;

        /**
         * @desc capacity must be an even
         * @private
         */
        this._capacity = border > Collection.MAX_CACPCITY
            ? Collection.MAX_CACPCITY
            : parseInt( (initCapacity & 0b1) === 0 ? initCapacity : initCapacity + 1 );
    }

    /**
     * @param index
     * @private
     */
    _isOutOfBound( index ) {
        if ( index >= this._elements.length || index < 0 ) {
            throw new IndexOutOfBoundException();
        }
    }

    /**
     * @private
     */
    _doubleCapacity() {
        if ( this._head !== this._tail ) {
            throw new IllegalStateException();
        }

        let elements = this._elements,
            capacity = this._capacity,
            length = elements.length,
            head = this._head,

            halfPart = length - head,
            newCapacity = [];

        newCapacity.push( ...(elements.slice( halfPart )) );
        newCapacity.push( ...(elements.slice( 0, halfPart )) );

        this._capacity = capacity > Collection.MAX_CACPCITY ? Collection.MAX_CACPCITY : capacity * 2;
        this._elements = newCapacity;
        this._tail = elements.length;
        this._head = 0;
    }

    /**
     * @param target
     * @return {boolean}
     */
    contains( target ) {
        return this._elements.indexOf( target ) >= 0;
    }

    /**
     * @return {boolean}
     */
    isEmpty() {
        return this._head === this._tail;
    }

    /**
     * @param element
     * @return {boolean}
     */
    offerFirst( element ) {
        if ( null === element || undefined === element ) {
            throw new NullPointException( "Element must not be null." );
        }

        if ( this._full ) {
            return false;
        }

        this._elements[ this._head = (this._head - 1) & (this._capacity - 1) ] = element;

        if ( this._head === this._tail ) {
            this._border ? this._full = true : this._doubleCapacity();
        }

        return true;
    }

    /**
     * @param element
     * @return {boolean}
     */
    offerLast( element ) {
        if ( null === element || undefined === element ) {
            throw new NullPointException( "Element must not be null." );
        }

        if ( this._full ) {
            return false;
        }

        let tail = this._tail;

        this._elements[ tail ] = element;
        this._tail = (tail + 1) & (this._capacity - 1);

        if ( this._head === this._tail ) {
            this._border ? this._full = true : this._doubleCapacity();
        }

        return true;
    }

    /**
     * @return {*}
     */
    pollFirst() {
        let head = this._head,
            elements = this._elements,
            elem = elements[ head ];

        if ( null === elem || undefined === elem ) {
            return null;
        }

        this._full = false;
        elements[ head ] = null;
        this._head = (head + 1) & (this._capacity - 1);

        return elem;
    }

    /**
     * @return {*}
     */
    pollLast() {
        let tail = this._tail,
            elements = this._elements,
            elem = elements[ tail ];

        if ( null === elem || undefined === elem ) {
            return null;
        }

        this._full = false;
        elements[ tail ] = null;
        this._tail = (tail - 1) & (this._capacity - 1);

        return elem;
    }

    /**
     * @return {*}
     */
    peekFirst() {
        return this._elements[ this._head ];
    }

    /**
     * @return {*}
     */
    peekLast() {
        return this._elements[ (this._tail - 1) & (this._capacity - 1) ];
    }

    /**
     * @return {*}
     */
    getFirst() {
        let val = this._elements[ this._head ];
        if ( null === val || undefined === val ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    /**
     * @return {*}
     */
    getLast() {
        let val = this._elements[ (this._tail - 1) & (this._capacity - 1) ];
        if ( null === val || undefined === val ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    /**
     * @return {number}
     */
    size() {
        return (this._tail - this._head) & (this._capacity - 1);
    }

    /**
     */
    clear() {
        this._head = this._tail = 0;
        this._elements = [];
    }

    /**
     * @param target
     * @return {*}
     */
    remove( target ) {
        if ( !target ) {
            return this.removeFirst();
        }

        let elements = this._elements,
            index = elements.indexOf( target );

        if ( index <= 0 ) {
            return false;
        }

        elements.splice( index, 1, null );
        return true;
    }

    /**
     * @return Iterator<T>
     */
    iterator() {
        let mod,
            that = this,
            head = this._head,
            tail = this._tail,
            capacity = this._capacity,
            elements = this._elements;

        return new class extends Iterator {
            next() {
                let elem = elements[ head ];
                mod = head = (head + 1) & (capacity - 1);

                return elem;
            }

            hasNext() {
                return ((head + 1) & (capacity - 1)) === tail;
            }

            remove() {
                if ( !(head !== tail && head - 1 === mod) ) {
                    return;
                }

                that._tail = (tail - 1) & (capacity - 1);
                head = (head - 1) & (capacity - 1);
                elements.splice( head, 1 );
            }
        };
    }

    toString() {
        return JSON.stringify( this.toArray() );
    }
}

/**
 * @class LinkedDeque
 * @extends Deque
 */
export class LinkedDeque extends Deque {
    /**
     * @constructor
     * @template T
     */
    constructor() {
        super();

        /**
         * @type {number}
         * @private
         */
        this._size = 0;

        /**
         * @type {LinkedList.Node}
         * @private
         */
        this._head = new LinkedList.Node( null, null, null );

        /**
         * @type {LinkedList.Node}
         * @private
         */
        this._tail = new LinkedList.Node( null, null, null );

        this._head.next = this._tail;
        this._tail.prev = this._head;
    }

    /**
     * @param element
     * @throws {NullPointException}
     * @return {boolean}
     */
    offerFirst( element ) {
        if ( null === element || undefined === element ) {
            throw new NullPointException( "Element must not be null." );
        }

        let head = this._head,
            node = new LinkedList.Node( null, null, element );

        head.next.prev = node;
        node.next = head.next;

        head.next = node;
        node.prev = head;

        this._size += 1;
        return true;
    }

    /**
     * @param element
     * @throws {NullPointException}
     * @returns {boolean}
     */
    offerLast( element ) {
        if ( null === element || undefined === element ) {
            throw new NullPointException( "Element must not be null." );
        }

        let tail = this._tail,
            node = new LinkedList.Node( null, null, element );

        tail.prev.next = node;
        node.prev = tail.prev;

        tail.prev = node;
        node.next = tail;

        this._size += 1;
        return true;
    }

    /**
     * @return {T}
     */
    pollFirst() {
        if ( this._head.next === this._tail ) {
            return null;
        }

        let node = this._head.next;

        node.prev.next = node.next;
        node.next.prev = node.prev;

        node.prev = node.next = null;
        this._size -= 1;

        return node.val;
    }

    /**
     * @return {*}
     */
    pollLast() {
        if ( this._tail.prev === this._head ) {
            return null;
        }

        let node = this._tail.prev;

        node.prev.next = node.next;
        node.next.prev = node.prev;

        node.prev = node.next = null;
        this._size -= 1;

        return node.val;
    }

    /**
     * @return {*|val}
     * @throws {NoSuchElementException}
     */
    getFirst() {
        if ( null === this._head ) {
            throw new NoSuchElementException();
        }

        return this._head.val;
    }

    /**
     * @return {*|val}
     * @throws {NoSuchElementException}
     */
    getLast() {
        if ( null === this._tail ) {
            throw new NoSuchElementException();
        }

        return this._tail.val;
    }

    /**
     * @return {*}
     */
    peekFirst() {
        let head = this._head;
        return null === head ? null : head.val;
    }

    /**
     * @return {*}
     */
    peekLast() {
        let tail = this._tail;
        return null === tail ? null : tail.val;
    }

    /**
     * @param target
     * @return {boolean}
     */
    contains( target ) {
        let cursor = this._head,
            tail = this._tail;

        while ( cursor.next !== tail ) {
            cursor = cursor.next;
            if ( cursor.val === target ) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param target
     * @throws {NoSuchElementException}
     * @return {*}
     */
    remove( target ) {
        if ( !target ) {
            return this.removeFirst();
        }

        let node = this._head,
            head = this._head,
            tail = this._tail;

        while ( node.next !== tail ) {
            if ( node.val !== target ) {
                node = node.next;
            }

            if ( node === head ) {
                continue;
            }

            if ( node === tail ) {
                break;
            }

            if ( node === head.next ) {
                this.removeFirst();

            } else if ( node === tail.prev ) {
                this.removeLast();

            } else {
                node.next.prev = node.prev;
                node.prev.next = node.next;

                node.next = node.prev = null;
                this._size -= 1;
            }

            return true;
        }

        return false;
    }

    /**
     * @return {number}
     */
    size() {
        return this._size;
    }

    clear() {
        this._head.next = this._tail;
        this._tail.prev = this._head;
        this._size = 0;
    }

    iterator() {
        let mod,
            that = this,
            node = this._head,
            head = this._head,
            tail = this._tail;

        return new class extends Iterator {
            next() {
                if ( this.hasNext() ) {
                    mod = node = node.next;
                    return node.val;
                }

                return null;
            }

            hasNext() {
                return node.next !== tail;
            }

            remove() {
                if ( node === head || node === tail || node !== mod ) {
                    return;
                }

                node.next.prev = node.prev;
                node.prev.next = node.next;

                let tmp = node.prev;
                node.prev = node.next = null;
                that._size -= 1;
                node = tmp;
            }
        }
    }
}