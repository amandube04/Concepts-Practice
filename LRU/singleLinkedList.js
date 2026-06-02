class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class singleLinkedList {
  constructor(capacity) {
    this.head = null;
    this.size = 0;
    this.capacity = capacity;
  }

  isFull() {
    return this.size >= this.capacity;
  }

  insertAtHead(data) {
    if (this.isFull()) {
      console.log("List is full");
      return false;
    }
    const newNode = new Node(data);
    newNode.next = this.head;
    this.head = newNode;
    this.size++;
  }

  insertAtTail(data) {
    if (this.isFull()) {
      console.log("List is full");
      return false;
    }
    const newNode = new Node(data);

    if (this.head === null) {
      this.head = newNode;
      this.size++;
      return;
    }

    // Traverse till end

    let currentNode = this.head;
    while (currentNode.next !== null) {
      currentNode = currentNode.next;
    }

    currentNode.next = newNode;
    this.size++;
  }

  print() {
    let current = this.head;
    const value = [];
    while (current !== null) {
      value.push(current.data);
      current = current.next;
    }
    console.log(value.join(" -> "));
  }

  delete(value) {
    if (this.head === null) {
      return;
    }
    if (this.head.data === value) {
      this.head = this.head.next;
      this.size--;
      return;
    }
    let current = this.head;
    while (current.next !== null && current.next.data !== value) {
      current = current.next;
    }

    if (current.next !== null) {
      current.next = current.next.next;
      this.size--;
    }
  }

  get(value) {
    let current = this.head;
    while (current !== null) {
      if (current.data === value) return true;
      current = current.next;
    }
    return false;
  }
}

const list = new singleLinkedList(3);

list.insertAtHead(10);
list.insertAtTail(50);
list.insertAtTail(20);
list.print();
list.delete(10);
list.print();
console.log(list.get(50));
