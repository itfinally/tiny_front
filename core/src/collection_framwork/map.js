import { UnsupportedOperationException } from "../javascript/exception";

class HashUtils {
    static dekHash( target ) {
        let hashCode = 0;

        for ( let i = 0; i < target.length; i += 1 ) {
            hashCode = ( ( hashCode << 5 ) ^ ( hashCode >> 27 ) ) ^ target.charCodeAt( i );
        }

        return hashCode;
    }

    static fnvHash( target ) {
        let fnvPrime = 0x811C9DC5,
            hashCode = 0;

        for ( let i = 0; i < target.length; i += 1 ) {
            hashCode *= fnvPrime;
            hashCode ^= target.charCodeAt( i );
        }

        return hashCode;
    }

    static pjwHash( target ) {
        let bitsInUnsignedInt = 4 * 8,
            threeQuarters = ( bitsInUnsignedInt * 3 ) / 4,
            oneEighth = bitsInUnsignedInt / 8,
            highBits = 0xffffffff << ( bitsInUnsignedInt - oneEighth ),
            hashCode = 0,
            tmp = 0;

        for ( let i = 0; i < target.length; i += 1 ) {
            hashCode = ( hashCode << oneEighth ) + target.charCodeAt( i );

            if ( ( tmp = hashCode & highBits ) !== 0 ) {
                hashCode = ( ( hashCode ^ ( tmp >> threeQuarters ) ) & ( ~highBits ) );
            }
        }

        return hashCode;
    }
}

class HashMap {
    getValue( key ) {
        throw new UnsupportedOperationException();
    }

    setValue( key, value ) {
        throw new UnsupportedOperationException();
    }

    containsKey( key ) {
        throw new UnsupportedOperationException();
    }

    containsValue( value ) {
        throw new UnsupportedOperationException();
    }

    keys() {
        throw new UnsupportedOperationException();
    }

    values() {
        throw new UnsupportedOperationException();
    }

    entries() {
        throw new UnsupportedOperationException();
    }

    put( key, value ) {
        throw new UnsupportedOperationException();
    }

    putAll( key, value ) {
        throw new UnsupportedOperationException();
    }

    clear() {
        throw new UnsupportedOperationException();
    }

    size() {
        throw new UnsupportedOperationException();
    }

    isEmpty() {
        throw new UnsupportedOperationException();
    }
}