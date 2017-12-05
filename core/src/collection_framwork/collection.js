import {
    UnsupportedOperationException,
    IndexOutOfBoundException,
    NoSuchElementException,
    IllegalStateException,
    NullPointException,

} from "../javascript/exception";

export class Collection {
    static _isCollection( target ) {
        if ( !( target instanceof Array || target instanceof Collection ) ) {
            throw new TypeError( `Expect array or collection, bot got ${typeof target}` );
        }
    }

    add( element ) {
        throw new UnsupportedOperationException();
    }

    addAll( collection ) {
        Collection._isCollection( collection );

        for ( let elem of collection ) {
            this.add( elem );
        }
    }

    contains( target ) {
        throw new UnsupportedOperationException();
    }

    containsAll( collection ) {
        Collection._isCollection( collection );

        let all = true;

        for ( let elem of collection ) {
            if ( !this.contains( elem ) ) {
                all = false;
                break;
            }
        }

        return all;
    }

    iterator() {
        throw new UnsupportedOperationException();
    }

    [Symbol.iterator]() {
        throw new UnsupportedOperationException();
    }

    isEmpty() {
        throw new UnsupportedOperationException();
    }

    remove( target ) {
        throw new UnsupportedOperationException();
    }

    removeAll( collection ) {
        Collection._isCollection( collection );

        let all = true;
        for ( let elem of collection ) {
            all &= this.remove( elem );
        }

        return all;
    }

    size() {
        throw new UnsupportedOperationException();
    }

    toArray() {
        throw new UnsupportedOperationException();
    }

    // Can be iteration
    iterator() {
        let index = 0,
            elements = this.toArray();

        return (function* () {
            while ( index < elements.length ) {
                yield elements[ index++ ];
            }
        })();
    }

    [Symbol.iterator]() {
        let index = 0,
            elements = this.toArray();

        return {
            next: () => {
                let done = (index >= elements.length);

                return {
                    done,
                    value: done ? undefined : elements[ index++ ]
                };
            },
        };
    }
}


// 0x7FFFFFFF === (2147483648 - 1), that is max unsigned number in memory of javascript( 32 bit ).
// The highest bit is a flag bit, so capacity cannot more than MAX_CAPACITY(either equal) otherwise
// the operation will be overflow or getting an negative number.
Collection.MAX_CACPCITY = 2147483648;


export class List extends Collection {
    addAll( collection, index ) {
        throw new UnsupportedOperationException();
    }

    get( index ) {
        throw new UnsupportedOperationException();
    }

    indexOf( target ) {
        throw new UnsupportedOperationException();
    }

    lastIndexOf( target ) {
        throw new UnsupportedOperationException();
    }

    set( index, element ) {
        throw new UnsupportedOperationException();
    }

    subList( fromIndex, toIndex ) {
        throw new UnsupportedOperationException();
    }
}

export class ArrayList extends List {
    constructor( canBeIteration ) {
        super();
        this._elements = [];

        if ( canBeIteration ) {
            this.addAll( canBeIteration );
        }
    }

    _isOutOfBound( index ) {
        if ( index >= this._elements.length || index < 0 ) {
            throw new IndexOutOfBoundException();
        }
    }

    add( element ) {
        this._elements.push( element );
        return true;
    }

    contains( target ) {
        return this._elements.indexOf( target ) >= 0;
    }

    isEmpty() {
        return this._elements.length <= 0;
    }

    remove( target ) {
        let index = this.indexOf( target );

        if ( index < 0 ) {
            return false;
        }

        this._elements.splice( index, 1 );
        return true;
    }

    toArray() {
        return this._elements.slice();
    }

    size() {
        return this._elements.length;
    }

    addAll( collection, index ) {
        Collection._isCollection( collection );

        let targets = [];
        for ( let elem of collection ) {
            targets.push( elem );
        }

        if ( !index ) {
            this._elements = this._elements.concat( targets );

        } else {
            this._isOutOfBound( index );
            this._elements.splice( index, 1, ...targets );
        }
    }

    get( index ) {
        this._isOutOfBound( index );
        return this._elements[ index ];
    }

    indexOf( target ) {
        return this._elements.indexOf( target );
    }

    lastIndexOf( target ) {
        let elements = this._elements;

        for ( let index = elements.length - 1; index >= 0; index -= 1 ) {
            if ( target === elements[ index ] ) {
                return index;
            }
        }
    }

    set( index, element ) {
        let oldVal = this.get( index );
        this._elements.splice( index, 1, element );
        return oldVal;
    }

    subList( from = 0, to = this._elements.length - 1 ) {
        return this._elements.slice( from, to );
    }

    clear() {
        return this._elements = [];
    }

    toString() {
        return JSON.stringify( this._elements );
    }
}

export class LinkedList extends List {
    constructor( canBeIteration ) {
        super();
        this._head = new LinkedList.Node( null, null, null );
        this._tail = new LinkedList.Node( null, null, null );

        this.clear();

        if ( canBeIteration ) {
            this.addAll( canBeIteration );
        }
    }

    _isOutOfBound( index ) {
        if ( index >= this._size || index < 0 ) {
            throw new IndexOutOfBoundException();
        }
    }

    _addNode( begin, node ) {
        if ( !(begin instanceof LinkedList.Node && node instanceof LinkedList.Node) ) {
            return;
        }

        node.next = begin.next;
        node.prev = begin;

        begin.next.prev = node;
        begin.next = node;

        this._size += 1;
    }

    _removeNode( node ) {
        if ( !(node instanceof LinkedList.Node && node !== this._head && node !== this._tail) ) {
            return;
        }

        node.prev.next = node.next;
        node.next.prev = node.prev;

        this._size -= 1;
    }

    add( element ) {
        this._addNode( this._tail.prev, new LinkedList.Node( null, null, element ) );
        return true;
    }

    addAll( collection, index ) {
        Collection._isCollection( collection );

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

    remove( val ) {
        let begin = this._head.next;

        while ( begin !== this._tail ) {
            if ( begin.val === val ) {
                this._removeNode( begin );
                return true;
            }

            begin = begin.next;
        }

        return false;
    }

    clear() {
        this._head.next = this._tail;
        this._tail.prev = this._head;
        this._size = 0;
    }

    isEmpty() {
        return this._size <= 0;
    }

    size() {
        return this._size;
    }

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

    set( index, val ) {
        let node = this.get( index ),
            oldVal = node.val;

        node.val = val;
        return oldVal;
    }

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

    toArray() {
        let elements = [],
            cursor = this._head.next;

        while ( cursor !== this._tail ) {
            elements.push( cursor.val );
            cursor = cursor.next;
        }

        return elements;
    }

    toString() {
        return JSON.stringify( this.toArray() );
    }
}

LinkedList.Node = class {
    constructor( prev, next, val ) {
        this.prev = prev;
        this.next = next;
        this.val = val;
    }
};

export class Queue extends Collection {
    element() {
        throw new UnsupportedOperationException();
    }

    offer( element ) {
        throw new UnsupportedOperationException();
    }

    peek() {
        throw new UnsupportedOperationException();
    }

    poll() {
        throw new UnsupportedOperationException();
    }
}

export class Deque extends Queue {
    addFirst( element ) {
        throw new UnsupportedOperationException();
    }

    addLast( element ) {
        throw new UnsupportedOperationException();
    }

    getFirst() {
        throw new UnsupportedOperationException();
    }

    getLast() {
        throw new UnsupportedOperationException();
    }

    offerFirst( element ) {
        throw new UnsupportedOperationException();
    }

    offerLast( element ) {
        throw new UnsupportedOperationException();
    }

    peekFirst() {
        throw new UnsupportedOperationException();
    }

    peekLast() {
        throw new UnsupportedOperationException();
    }

    pollFirst() {
        throw new UnsupportedOperationException();
    }

    pollLast() {
        throw new UnsupportedOperationException();
    }

    pop() {
        throw new UnsupportedOperationException();
    }

    push() {
        throw new UnsupportedOperationException();
    }

    removeFirst() {
        throw new UnsupportedOperationException();
    }

    removeLast() {
        throw new UnsupportedOperationException();
    }
}

export class ArrayDeque extends Deque {
    constructor( initCapacity = 8, border ) {
        super();

        this._full = false;
        this._elements = [];
        this._head = this._tail = 0;
        this._capacity = initCapacity;

        if ( !isFinite( border ) ) {
            this._border = null;

        } else {
            // border must be an even
            this._border = border > Collection.MAX_CACPCITY
                ? Collection.MAX_CACPCITY
                : parseInt( (border & 0b1) === 0 ? border : border + 1 );
        }
    }

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

    add( element ) {
        this.addLast( element );
        return true;
    }

    contains( target ) {
        return this._elements.indexOf( target ) >= 0;
    }

    isEmpty() {
        return this._head === this._tail;
    }

    addFirst( element ) {
        if ( null === element || undefined === element ) {
            throw new NullPointException( "Element must not be null." );
        }

        if ( this._full ) {
            return;
        }

        this._elements[ this._head = (this._head - 1) & (this._capacity - 1) ] = element;

        if ( this._head === this._tail ) {
            this._border ? this._full = true : this._doubleCapacity();
        }
    }

    addLast( element ) {
        if ( null === element || undefined === element ) {
            throw new NullPointException( "Element must not be null." );
        }

        if ( this._full ) {
            return;
        }

        let tail = this._tail;

        this._elements[ tail ] = element;
        this._tail = (tail + 1) & (this._capacity - 1);

        if ( this._head === this._tail ) {
            this._border ? this._full = true : this._doubleCapacity();
        }
    }

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

    offerFirst( element ) {
        this.addFirst( element );
        return true;
    }

    offerLast( element ) {
        this.addLast( element );
        return true;
    }

    remove() {
        return this.removeFirst();
    }

    removeFirst() {
        let val = this.pollFirst();
        if ( null === val || undefined === val ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    removeLast() {
        let val = this.pollLast();
        if ( null === val || undefined === val ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    peekFirst() {
        return this._elements[ this._head ];
    }

    peekLast() {
        return this._elements[ (this._tail - 1) & (this._capacity - 1) ];
    }

    getFirst() {
        let val = this._elements[ this._head ];
        if ( null === val || undefined === val ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    getLast() {
        let val = this._elements[ (this._tail - 1) & (this._capacity - 1) ];
        if ( null === val || undefined === val ) {
            throw new NoSuchElementException();
        }

        return val;
    }

    pop() {
        return this.removeFirst();
    }

    push( target ) {
        return this.addFirst( target );
    }

    element() {
        return this.getFirst();
    }

    offer( element ) {
        return this.offerLast( element );
    }

    peek() {
        return this.peekFirst();
    }

    poll() {
        return this.pollFirst();
    }

    size() {
        return (this._tail - this._head) & (this._capacity - 1);
    }

    toArray() {
        return this._elements.filter( elem => elem !== null && elem !== undefined );
    }

    toString() {
        return JSON.stringify( this.toArray() );
    }
}