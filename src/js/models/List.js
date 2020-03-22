import uniqid from "uniqid";

export default class List {
  constructor() {
    this.items = [];
  }
  addItem(count, unit, ingredient) {
    const item = {
      id: uniqid(),
      count,
      unit,
      ingredient
    };
    this.items.push(item);
    return item;
  }

  deleteItem(id) {
   const  index = this.items.findIndex(el => el.id === id);
    //[2,4,8,10].splice(1, 2) (start, pick 2 item) return 4,8 and mutate the original array => [2, 10];
    //[2,4,8,10].slice(1, 2)(start, end) return 4 and not mutate the original array => [2,4,8,10]
    this.items.splice(index, 1);
  }

  updateCount(id, newCount) {
      
    this.items.find(el => el.id === id).count = newCount;
  }
}
