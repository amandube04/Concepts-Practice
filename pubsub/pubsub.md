# Pub/Sub Pattern — Mental Models

> Notes to lock the _concepts_ in your brain. Pure mental models, no big code dumps. The implementation file lives separately — this is for revising the ideas.

---

## 1. The Problem Pub/Sub Solves

Without Pub/Sub, when something happens (e.g., a message arrives), the handler must directly call every function that cares:

```
onMessageReceived → showInWindow, playSound, updateBadge, sendNotif, saveHistory
```

The handler ends up knowing about every feature in the app. Add a feature → edit the handler. Remove one → edit again. This is **tight coupling**.

Pub/Sub breaks this by inserting a middleman. The handler just **announces** what happened. Anyone interested can listen, independently.

---

## 2. The Three Roles

```
Publisher  ──→  Event Bus  ──→  Subscribers
 (sender)    (the middleman)    (listeners)
```

- **Publisher** — emits an event with data. Doesn't know who's listening.
- **Subscriber** — registers a callback for a named event. Doesn't know who's publishing.
- **Event Bus** — the middleman that stores subscriber callbacks and routes events to them.

Each role knows nothing about the others. They communicate only through the bus.

---

## 3. The Most Common Confusion to Clear Up

> **The publisher does NOT call the subscribers' callbacks. The middleware does.**

Publisher's job: emit `(eventName, data)` to the bus and walk away.
Bus's job: look up who subscribed to that event, loop, invoke each callback.
Subscriber's job: define a callback and register it with the bus once at setup.

If you only remember one thing about Pub/Sub: **the bus invokes the callbacks, not the publisher.**

---

## 4. The Postal Analogy

- You (publisher) drop a letter in a mailbox addressed to "Salary Dept."
- The post office (bus) has a directory of who works in Salary Dept.
- It delivers copies to each address (subscribers).

You never iterate over recipients. You never know who they are. The post office handles fan-out.

---

## 5. The Three Core Operations

A complete Pub/Sub system needs just three methods:

1. **`subscribe(eventName, callback)`** — "Call this function when this event happens."
2. **`publish(eventName, data)`** — "Tell every subscriber that this event happened."
3. **`unsubscribe(eventName, callback)`** — "Stop calling me."

Tiny API, huge architectural payoff.

---

## 6. The Data Structure Under the Hood

The event bus is just a **Map of arrays**:

```
{
  "salary":   [callback1, callback2],
  "bill":     [callback3],
  "donation": [callback4]
}
```

- **Key** = event name (a string)
- **Value** = array of callback function references

Your HashMap knowledge applies directly. The bus is a HashMap where each slot holds a list of subscribers.

---

## 7. What `subscribe` Actually Does

Two-step recipe:

1. If this is the first subscriber for this event, create an empty array in the map.
2. Push the callback into the array for this event.

After multiple subscribes, you accumulate a per-event list of callbacks. No copies — just function references stored alongside their event name.

---

## 8. What `publish` Actually Does

Three-step recipe:

1. **Guard:** if no one subscribed to this event, exit silently.
2. **Look up:** get the array of callbacks for this event.
3. **Fan out:** loop through the array, calling each callback with the data.

The loop is the entire point — one publish call becomes N subscriber invocations.

---

## 9. Why the Guard Clause Matters

```javascript
if (!this.subscribers.has(eventName)) return;
```

If nobody has subscribed to an event, that key doesn't exist in the map. Without the guard:

```javascript
const callbacks = this.subscribers.get("unknownEvent");  // undefined
for (const cb of undefined) { ... }                       // 💥 crash
```

The guard turns "no one's listening" into a silent no-op — exactly what Pub/Sub requires. Publishers must never crash because nobody subscribed.

---

## 10. Why the Loop Matters

Multiple subscribers can register for the same event. The whole point is fan-out:

```
                       ┌─→ subscriberA(data)
publish("event", data) ├─→ subscriberB(data)
                       └─→ subscriberC(data)
```

One emit → many reactions. Without the loop, only the first subscriber would ever hear the event. The loop is what makes "many things react to one event" possible.

---

## 11. References, Not Copies

When you do `bus.subscribe("salary", logSalary)`, you're not copying the function. You're storing a **reference** to it. The function still lives wherever it was defined; the bus just knows how to reach it.

Same idea as linked list nodes — many things can point to the same object. The bus's array holds arrows pointing out to functions defined elsewhere.

```
bus.subscribers
   └─ "salary" → [●, ●]
                  │  │
                  │  └─→ sendPayslipEmail   (defined in payroll.js)
                  └────→ logSalaryToBooks    (defined in accounting.js)
```

---

## 12. Data Doesn't "Travel" — It's Shared

In an in-memory event bus, the `data` object isn't copied or serialized. The publisher creates it; passes it to publish; publish passes it to each callback. Every subscriber sees the **same object reference**.

It's all just function calls with shared references. The bus is a **router**, not a container.

(Distributed Pub/Sub like Kafka is different — data gets serialized and sent over a network. But for in-memory: pure function calls.)

---

## 13. Fire-and-Forget

Basic Pub/Sub is **fire-and-forget**:

- If no one's subscribed at the moment of publish, the event is gone. Not queued.
- If you subscribe later, you won't get events that already fired.

To queue events for late subscribers, you need a **message queue** (Kafka, Redis Streams). That's a more advanced pattern. Plain Pub/Sub is "shout into the room — whoever's there hears it."

---

## 14. The Try/Catch Around Each Callback

A robust bus wraps each callback invocation in try/catch:

```javascript
for (const cb of callbacks) {
  try { cb(data); }
  catch (err) { console.error(...); }
}
```

Why? If one subscriber's callback throws, you don't want the others to be skipped. Each subscriber should be independent — one bad listener shouldn't break the chain.

---

## 15. Unsubscribe — Why It's Tricky

To unsubscribe, you must find a specific callback in the array and remove it. This means you need the **exact same function reference** you originally subscribed with:

```javascript
bus.subscribe("salary", sendPayslipEmail); // store this reference
// ...later...
bus.unsubscribe("salary", sendPayslipEmail); // must be SAME reference
```

If you subscribed with an inline arrow function:

```javascript
bus.subscribe("salary", (data) => console.log(data));
// ^ no way to unsubscribe this — you don't have a handle on it
```

…you can never unsubscribe it. Save the reference if you'll need to remove it.

---

## 16. Where You've Already Used Pub/Sub

The pattern is everywhere once you recognize it:

- **DOM events** — `addEventListener("click", handler)` is subscribe
- **Node.js EventEmitter** — same pattern explicitly named
- **Redux / state stores** — subscribe to state changes
- **WebSockets, Kafka, RabbitMQ** — distributed Pub/Sub across processes
- **React `useEffect` cleanup** — often unsubscribing from something

Knowing the underlying pattern makes all of these click as the same idea.

---

## 17. Pub/Sub vs Observer Pattern

Subtle distinction:

- **Observer** — subjects directly maintain their observer list. Observers know which subject.
- **Pub/Sub** — publishers and subscribers don't know each other. The bus abstracts them.

Pub/Sub is "Observer with a middleman." For most purposes, treat them as the same idea.

---

## 18. Synchronous vs Asynchronous

- **Synchronous** — `publish` returns only after all subscribers have run. Subscribers run in subscribe order. Simple.
- **Asynchronous** — events are queued, subscribers run later (different tick, different process, different machine). What Kafka and message queues do.

Mental model is the same. The difference is _when_ subscribers actually execute.

---

## 19. The One-Line Summary

> **Pub/Sub is a pattern where publishers emit named events to a middleman bus, and any number of subscribers can register callbacks for those names — letting unrelated parts of code communicate without knowing about each other.**

---

## Quick Self-Check Before Moving On

- What problem does Pub/Sub solve, in one sentence?
- What are the three roles? What does each know about the others?
- Who actually invokes the subscribers' callbacks — publisher or middleware?
- Under the hood, what data structure does the event bus use?
- What does `subscribe` add to the bus's internal map?
- Why does `publish` need a guard clause checking `has(eventName)`?
- Why does `publish` need a loop?
- What's the difference between the data the publisher creates and what each subscriber receives? (Hint: references, not copies.)
- Why must you save your callback reference if you'll want to unsubscribe later?
- Name three places you've already used this pattern without realizing it.

When all ten feel obvious, you understand Pub/Sub deeply enough to use it well, recognize it in other libraries, and build your own when needed.

---

## What Carries Forward

The mental moves you used here apply directly to:

- **DOM events / EventEmitter** — same pattern with different APIs
- **State management (Redux, Zustand, etc.)** — store subscribers + state changes as events
- **WebSocket message routing** — events arriving from a server, fanned out to handlers
- **Microservices messaging (Kafka, RabbitMQ)** — same pattern, distributed across machines
- **Any "decoupled communication" problem** — Pub/Sub is the go-to architectural answer

---

_Revise this. Trace the flow with paper. Then read the implementation file again._
