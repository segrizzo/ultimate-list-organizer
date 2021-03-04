const a = [
  [1, 1],
  [2, 2],
  [2, 3],
  [2, 4],
];
for (let i of a) {
  console.log(i);
}
// Filter: filtrer des valeurs d'un array - n => n - x
const c = (i) => i > 1;
console.log(a.filter(c));
// Map: Modifier chaque element d'un array - n => n
const double = (a) => a * 2;
const b = a.map(double);
console.log(a);
console.log(b);
console.log(a.map(double));
console.log(a.map((i) => i * 2));
// Reduce: Reduire les dimensions d'un array - n^2 => n
const lists = [
  {
    title: "Coucou",
    category: "todo",
  },
  {
    title: "Coucou 2",
    category: "todo",
  },
  {
    title: "Coucou 3",
    category: "basic",
  },
];
const sortByCategory = (map, currentValue) => {
  console.log(currentValue);
  if (map.has(currentValue.category)) {
    const currentDefinition = map.get(currentValue.category);
    currentDefinition.push(currentValue);
  } else {
    map.set(currentValue.category, [currentValue]);
  }
  // map.set(currentValue.category, map.has(currentValue.category) ? [...map.get(currentValue.category), currentValue] : [currentValue])
  return map;
};
console.log((m = lists.reduce(sortByCategory, new Map())));
for (let [key, value] of m) {
  const section = createSection(key);
  lists = createList(value);
  section.append(list);
  console.log(value);
}
// const b = { q: [1, 2], w: 2 }
// for (let i in b) {
//     if(1+1 ===2) {
//         console.log("if");
//     }
//     console.log("Done");
// }
