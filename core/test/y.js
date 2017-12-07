import { HashMap } from "../src/collection_framework/map";

let map = new HashMap( 4 );
map.put( "awe", 212 );
map.put( "asdf", 22 );
map.put( "asdsdsf", 4 );
map.put( "a12123sdf", 2322 );
let iterator = map.keySet().iterator();

let d = 1;
while( iterator.hasNext() ) {
    console.log(iterator.next())
}

console.log(map.containsKey("asdsdsf"));
console.log(map.toString());