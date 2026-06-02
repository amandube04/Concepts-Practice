class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
}

class LRU {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
    this.head = new Node(0, 0);
    this.tail = new Node(0, 0);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
  removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  moveToFront(node) {
    this.removeNode(node);
    this.addToFront(node);
  }

  get(key) {
    if (!this.map.get(key)) return -1;
    let getNode = this.map.get(key);
    this.moveToFront(getNode);

    return getNode.value;
  }
  put(key, value) {
    //Key already exist
    if (this.map.has(key)) {
      let keyExist = this.map.get(key);
      keyExist.value = value;
      this.moveToFront(keyExist);
      return;
    }

    // Key is new

    if (this.map.size >= this.capacity) {
      let getLeast = this.tail.prev;
      this.removeNode(getLeast);
      this.map.delete(getLeast.key);
    }
    let newNode = new Node(key, value);
    this.addToFront(newNode);
    this.map.set(key, newNode);
  }
}

const cache = new LRU(2);
cache.put(1, "A");
cache.put(2, "B");
console.log(cache.get(1)); // "A" — 1 is now most recent
cache.put(3, "C"); // should evict 2 (LRU)
console.log(cache.get(2)); // -1 — evicted
cache.put(1, "Z"); // update existing key
console.log(cache.get(1)); // "Z" — updated value
cache.put(4, "D"); // should evict 3 (LRU now)
console.log(cache.get(3)); // -1
console.log(cache.get(1)); // "Z"
console.log(cache.get(4)); // "D"
