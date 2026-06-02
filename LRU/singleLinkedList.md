# Singly Linked List — Mental Models

## 1. What a Linked List Actually Is

An **array** stores elements next to each other in memory. You can jump directly to position 7 because you know where it is.

A **linked list** scatters elements all over memory. Each element holds the **address** of the next one. To reach position 7, you start at the first and walk through, one by one, following addresses.

That "address of the next one" is a **pointer** (called `next` in code).

```
head → [10 | •] → [20 | •] → [30 | null]
```

- `head` is your only entry point. Lose it, and the whole list is unreachable.
- Each `•` is a pointer to the next node.
- The last node points to `null` — that's how you know you've reached the end.

---

## 2. The Two Classes — and Why They're Separate

A linked list is built from **two independent classes**:

- **Node** — a tiny box holding a value and a pointer to the next node.
- **LinkedList** — the manager class. Holds `head`, creates Nodes, links them, walks them.

They are NOT related by inheritance. The LinkedList class **uses** the Node class internally. This is called **composition** — a "has-a" relationship.

> A LinkedList **has** nodes. ✅
> A LinkedList **is** a node. ❌

This same pattern shows up everywhere — Trees have TreeNodes, Graphs have Vertices, the DOM has Elements. Always one small "data unit" class plus one bigger "container" class that creates and links instances of it.

---

## 3. How `this` Works (No Magic)

When you write:

```javascript
class LinkedList {
  constructor() {
    this.head = null;
  }
}
```

…and then `const list = new LinkedList()`, JavaScript creates a plain object `{ head: null }` and stores it in `list`.

When you later call `list.insertAtHead(5)`, JavaScript silently sets `this` inside the method to point at that same object. So `this.head` inside a method is literally `list.head`.

**No inheritance, no hidden lookup, no magic.** `this` is just "the object before the dot."

---

## 4. The Most Important Idea: References, Not Copies

This is the concept that unlocks everything.

### Primitives are copied by value

```javascript
let a = 5;
let b = a;
b = 10;
// a is still 5
```

### Objects are copied by reference

```javascript
let a = { name: "Alice" };
let b = a;
b.name = "Bob";
// a.name is now 'Bob' too — same object!
```

When a variable holds an object, it doesn't hold the object itself. It holds a **reference** — an arrow pointing to where the object lives in memory. Assignment copies the arrow, not the box it points to.

```
a ──┐
    ├──→ { name: 'Alice' }
b ──┘
```

### Why this matters for linked lists

Every `next` pointer is just a reference. When you write:

```javascript
newNode.next = this.head;
```

…you're copying the arrow stored in `this.head` into `newNode.next`. Now both point to the same node. You haven't duplicated the node, you've added a second arrow pointing to it.

The entire linked list is just a chain of arrows in memory, with `head` being the first arrow you hold.

---

## 5. The Survival Rule

> **As long as something references a node, that node stays alive. The moment nothing references it, it's gone.**

This is JavaScript's garbage collector at work. Two consequences:

- **Losing `head` is catastrophic.** If you reassign `head` without first saving the old reference somewhere, the entire list becomes unreachable and gets garbage-collected. Everything is lost in one wrong line.
- **You don't "delete" nodes manually.** You just unlink them (rewire `next` to skip over them). Once nothing points to a node, the GC sweeps it away. No `free()`, no `delete`.

---

## 6. The Traversal Pattern (Burn This In)

You will write this loop hundreds of times:

```javascript
let current = this.head;
while (current !== null) {
  // do something with current
  current = current.next;
}
```

Read it aloud every time until it's reflex:

> "Start at head. While there's a node to look at, do something. Then move to the next. Stop when I fall off the end."

Two pieces that must always be present:

1. **A starting point** — `current = this.head`
2. **An advancement step** — `current = current.next` inside the loop

Forget the advancement and the loop runs forever. That's the #1 source of crashes.

---

## 7. The Insertion Mental Model

To insert a node, you connect it to its neighbors. Always set the new node's pointers **before** changing the existing list's pointers. Otherwise you lose your reference to the rest of the list.

For insert-at-head:

```javascript
newNode.next = this.head; // first: new node knows where to go
this.head = newNode; // then: list points to new node
```

If you swapped these two lines, `this.head` would be overwritten and you'd never be able to set `newNode.next` to the old chain — it's gone.

---

## 8. The Deletion Mental Model

To remove a node from the middle, you need a reference to the node **before** it. Why? Because the previous node's `next` is what currently points to the target. You need to redirect that arrow to skip over the target.

```
Before:  [A] → [B] → [C]      (want to remove B)
After:   [A] ──────→ [C]      (A's next now points to C)
```

The magic line: `prev.next = prev.next.next`

This is why most traversal loops in delete operations look at `current.next` instead of `current` — you need to stop **at the node before** the target.

---

## 9. Always Handle These Three States

Almost every method needs to consider:

1. **Empty list** — `head === null`. Most operations are no-ops or special.
2. **Operation on the head itself** — head has no "previous" node, so it's a special case.
3. **Normal case** — somewhere in the middle.

If your method handles all three, it's correct. If it skips one, you have a bug waiting.

---

## 10. The "Where Do I Start Coding?" Pattern

When you sit down to implement something and freeze, follow this order:

1. **What objects exist?** → write empty classes
2. **What does each object hold?** → fill in the constructor
3. **What small operations repeat?** → write helper methods first
4. **What does the user actually call?** → write public methods using the helpers

You almost never write the "main" logic first. You build the toolkit, then the logic becomes short.

---

## 11. The One-Line Summary of Everything

> **A linked list is a chain of objects connected by reference arrows, with one entry point (`head`), where every operation is just careful pointer rewiring while a counter tracks how many nodes you have.**

If that sentence makes complete sense to you, you understand singly linked lists.

---

## Quick Self-Check Before Moving On

Ask yourself these out loud. If any feel shaky, re-read the relevant section.

- Why is losing `head` catastrophic?
- What's the difference between copying a primitive and copying an object reference?
- Why do Node and LinkedList exist as separate classes?
- What's the difference between "has-a" and "is-a"?
- What two lines must every traversal loop contain?
- Why must `newNode.next = this.head` come before `this.head = newNode`?
- To delete a middle node, what reference do you need first?

When all seven feel obvious, you're ready to implement with confidence — and ready to think about doubly linked lists and LRU next.

---

_Revise this. Code from memory. Then revise again._
