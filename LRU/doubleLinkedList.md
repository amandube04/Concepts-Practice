# Doubly Linked List — Mental Models

---

## 1. What Changes from Singly to Doubly

A singly linked list has one arrow per node — `next`. You can only walk forward.

A doubly linked list adds a second arrow — `prev`. Now every node knows both its neighbors.

```
null ← [10] ⇄ [20] ⇄ [30] → null
        ↑              ↑
       head           tail
```

Two consequences:

- You can walk in **both directions**.
- Every connection between two nodes is now **two arrows**, not one. Updating only one of them silently breaks the structure.

---

## 2. The New Node Shape

```javascript
class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}
```

Every new node starts with both pointers as `null`. That's important — it means "I'm not connected to anything yet."

---

## 3. The LinkedList Now Holds Two References

```javascript
constructor() {
  this.head = null;
  this.tail = null;
  this.size = 0;
}
```

**Why keep `tail`?** Without it, `insertAtEnd` would have to traverse from head — O(n). With it, the operation becomes O(1). The tail pointer is half the reason DLLs exist.

Both labels (`head` and `tail`) start `null` for an empty list. When the list has exactly one node, both labels point at that same node.

---

## 4. The Big New Idea: Every Connection Is Two Arrows

When you connect node A to node B, you must update **both directions**:

- `A.next = B`
- `B.prev = A`

If you only do one, the list looks correct from one direction and broken from the other. This is why `printFromBack` matters — it's your **wiring detector**. If forward print works but backward print is missing nodes, you forgot a `prev` update somewhere.

---

## 5. Chain Ops vs Label Ops

Every method does two kinds of work. Naming them separately makes everything clearer:

- **Chain ops** = wiring `next` and `prev` between actual nodes. Changes the structure.
- **Label ops** = updating `this.head`, `this.tail`, `this.size`. Updates the manager's bookkeeping.

For any operation, ask:

1. Which arrows between nodes need to change? (chain)
2. Which references on the LinkedList need to update? (labels)
3. What's the order that avoids losing access mid-update?

---

## 6. The Golden Rule of Insertion

> **Wire the new node's connections FIRST. Move your `head` or `tail` label LAST.**

If you reassign your anchor too early, you've lost your handle on the old end of the list, and you can't wire correctly anymore.

Example for `insertAtEnd`:

```javascript
newNode.prev = this.tail; // chain: new ⇄ old tail
this.tail.next = newNode; // chain: old tail ⇄ new
this.tail = newNode; // label: move LAST
```

Same pattern, mirrored, for `insertAtHead`.

---

## 7. The Mirror Symmetry

`insertAtHead` and `insertAtEnd` are mirror images. If you know one, you know the other by swapping:

| insertAtHead               | insertAtEnd                |
| -------------------------- | -------------------------- |
| `newNode.next = this.head` | `newNode.prev = this.tail` |
| `this.head.prev = newNode` | `this.tail.next = newNode` |
| `this.head = newNode`      | `this.tail = newNode`      |
| `newNode.prev` stays null  | `newNode.next` stays null  |

Same shape, every `head` becomes `tail`, every `next` becomes `prev`. Use this symmetry — don't memorize both, derive one from the other.

---

## 8. "Sometimes the Correct Code Is No Code"

The new head's `prev` should be null. The new tail's `next` should be null.

These are **already null** from the Node constructor. You don't write a line to set them — the absence of code IS the code. Don't write `newNode.next = null` for an insertAtEnd; it's redundant noise.

---

## 9. The Four States of Deletion

Every delete must consider four scenarios:

1. **Empty list** — nothing to do, exit early.
2. **Head is the target** — move `head` label forward, set new head's `prev = null`.
3. **Tail is the target** — move `tail` label backward, set new tail's `next = null`.
4. **Middle node** — bypass it from both sides using its own `prev` and `next`.

Plus one sub-case hiding inside state 2: **the only node** (list has size 1, deleting it). When you do `this.head = this.head.next`, head becomes null. You must also set `this.tail = null` so the labels stay consistent.

---

## 10. Why Deletion Is Easier in a DLL

In a singly linked list, to delete a middle node B, you needed a reference to the node **before** B (so you could rewire its `next`). That meant looping with `current.next.data !== value` — looking one ahead.

In a doubly linked list, you don't need that trick. Once you land **on** B, it already knows both neighbors:

```javascript
B.prev.next = B.next; // previous node bypasses B
B.next.prev = B.prev; // next node bypasses B
```

So your search loop just checks `current.data` directly, and you can stop ON the target. Simpler and uses the DLL's superpower.

---

## 11. The "Not Found" Case

After the search loop:

```javascript
while (current !== null && current.data !== data) {
  current = current.next;
}
```

`current` is either the target node OR `null` (we walked off the end). **Always check for null before using `current.prev` or `current.next`**, or you'll crash:

```javascript
if (current === null) return; // not found, exit cleanly
```

This is the #1 source of crashes in delete methods.

---

## 12. The Traversal Pattern Is Unchanged

Forward:

```javascript
let current = this.head;
while (current !== null) {
  // ...
  current = current.next;
}
```

Backward (the new ability):

```javascript
let current = this.tail;
while (current !== null) {
  // ...
  current = current.prev;
}
```

Same shape, mirrored. The stop condition is always `!== null` — never compare against `head` or `tail`, because those are valid nodes you still want to process.

---

## 13. The Size Counter: Easy to Forget

Every operation that changes the list must update `size`:

- Successful insert → `size++`
- Successful delete → `size--`

Easy mistake: handle two branches in an insert (empty vs non-empty), update size in one but forget the other. The list works, but `size` lies. Always grep your own code for branches and confirm each one updates size.

---

## 14. The "Only One Node" Edge Case

When a DLL has exactly one node:

- `head === tail` (both labels point at the same node)
- That node's `prev` and `next` are both `null`

Deleting it must clear **both** labels (`head = null` AND `tail = null`).
Inserting the first node must set **both** labels.

Anytime you write code that updates head OR tail, ask: _"What if this is the only node? Do I need to update the other label too?"_

---

## 15. The Return Contract

Decide once: do your methods return `true`/`false` to signal success, or do they return nothing? Then be consistent. Mixed return types (sometimes `undefined`, sometimes `true`, never `false`) is a smell.

A `boolean` return is usually most useful — the caller can tell whether the operation actually happened.

---

## 16. The One-Line Summary of DLL

> **A doubly linked list is a singly linked list with a `prev` pointer added to every node and a `tail` reference added to the manager, doubling both the walk-ability and the rewiring discipline required.**

If that sentence makes complete sense to you, you understand doubly linked lists.

---

## Quick Self-Check Before Moving On

Ask yourself these out loud. If any feel shaky, re-read the relevant section.

- Why is every connection between two nodes two arrows instead of one?
- What's the mirror relationship between `insertAtHead` and `insertAtEnd`?
- Why must label updates (moving head/tail) happen AFTER chain updates?
- What are the four states `delete` must handle?
- Why does DLL deletion not need the "look one ahead" trick from SLL?
- What edge case must you check after a search loop in delete?
- When the list has one node, what's special about it?
- What's the difference between a chain op and a label op?

When all eight feel obvious, your DLL foundation is solid — and you're ready for LRU when you choose.

---

## What Carries Forward

The mental moves you used here apply directly to:

- **Trees** — TreeNode has `left` and `right` instead of `prev` and `next`. Same composition pattern.
- **LRU Cache** — DLL + HashMap. The DLL gives you O(1) move-to-front and remove-from-tail; the HashMap gives you O(1) lookup. Combined: every operation is O(1).
- **Any pointer-based structure** — chain ops vs label ops, the mirror symmetry, the edge-case discipline. All the same.

---

_Revise this. Code from memory. Then revise again._
