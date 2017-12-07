import { HashMap, HashSet } from "../src/collection_framework/map";

let set = new HashSet();
set.add("afadsf");
set.add("asdfwefwe");
set.add("vr23fw23");
set.add("fd34df3f2d");
set.forEach((a,b)=>{
    console.log([a,b]);
});

for(let item of set) {
    console.log(item);
}

console.log(set.toString());