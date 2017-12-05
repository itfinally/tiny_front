import { ArrayDeque, ArrayList, LinkedList } from "./src/collection_framwork/collection";

let list = new ArrayDeque(4);
list.push(1);
list.push(2);
list.push(3);
list.push(4);
list.push(5);

console.log(list.pop());
console.log(list.pop());
console.log(list.pop());
console.log(list.size());
window.t = list;

// let seed = 2;
// let p = 29;
// while ( p >= 0 ) {
//     p -= 1;
//     seed *= 2;
// }
//
// console.log( seed );
// console.log( -1 & (seed - 1) );
//
// let arr = [];
// while ( seed >= 1 ) {
//     console.log( seed % 2 );
//     seed /= 2;
// }