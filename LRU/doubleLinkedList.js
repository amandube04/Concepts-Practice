class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class DoubleLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  insertAtHead(data) {
    const newNode = new Node(data);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
      this.size++;
      return;
    }
    newNode.next = this.head;
    this.head.prev = newNode;
    this.head = newNode;
    this.size++;
  }
  insertAtEnd(data) {
    const newNode = new Node(data);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
      this.size++;
      return;
    }
    newNode.prev = this.tail;
    this.tail.next = newNode;
    this.tail = newNode;
    this.size++;
  }

  printFromBack() {
    let currentTail = this.tail;
    const values = [];

    while (currentTail !== null) {
      values.push(currentTail.data);
      currentTail = currentTail.prev;
    }
    console.log(values.join(" -> "));
  }
  printFromStart() {
    let current = this.head;
    const values = [];

    while (current !== null) {
      values.push(current.data);
      current = current.next;
    }
    console.log(values.join(" -> "));
  }
  contains(data) {
    let searchFromHead = this.head;
    while (searchFromHead !== null) {
      if (searchFromHead.data === data) return true;
      searchFromHead = searchFromHead.next;
    }
    return false;
  }

  delete(data) {
    // see if it is empty
    if (this.head === null) return;

    if (this.head.data === data) {
      this.head = this.head.next;

      if (this.head === null) {
        this.tail = null;
      } else {
        this.head.prev = null;
      }

      this.size--;
      return;
    }
    let current = this.head;

    while (current !== null && current.data !== data) {
      current = current.next;
    }

    if (current === null) return;

    if (current === this.tail) {
      this.tail = current.prev;
      this.tail.next = null;
      this.size--;
      return;
    }

    current.prev.next = current.next;
    current.next.prev = current.prev;
    this.size--;
    return true;
  }
}

const list = new DoubleLinkedList();

// empty list operations
list.printFromStart(); // (empty)
console.log(list.delete(5)); // false
console.log(list.contains(5)); // false

// build it up
list.insertAtHead(10);
list.insertAtEnd(20);
list.insertAtEnd(30);
list.insertAtHead(5);
console.log(list.size); // 4  ← catches the missing size++ bug
list.printFromStart(); // 5 -> 10 -> 20 -> 30
list.printFromBack(); // 30 -> 20 -> 10 -> 5

// delete various positions
list.delete(20); // middle
list.printFromStart(); // 5 -> 10 -> 30
list.printFromBack(); // 30 -> 10 -> 5  ← prev still works?

list.delete(5); // head
list.printFromStart(); // 10 -> 30

list.delete(30); // tail
list.printFromStart(); // 10

list.delete(999); // not found — should NOT crash  ← catches bug 2

list.delete(10); // last node
console.log(list.head, list.tail, list.size); // null null 0
