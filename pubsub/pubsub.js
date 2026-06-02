class EventMessanger {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    this.subscribers.get(event).push(callback);
  }

  publish(event, data) {
    if (!this.subscribers.has(event)) {
      return;
    }

    let callbacks = this.subscribers.get(event);

    for (const callback of callbacks) {
      callback(data);
    }
  }

  unsubscribe(event, callback) {
    if (!this.subscribers.has(event)) return;

    const callbacks = this.subscribers.get(event);
    const index = callbacks.indexOf(callback);

    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
}

function logSalaryToBooks(data) {
  console.log(`📚 Booking salary: ${data.employee} received $${data.amount}`);
}

function sendPayslipEmail(data) {
  console.log(`📧 Sending payslip email to ${data.employee}`);
}

function trackExpense(data) {
  console.log(`💸 Tracking expense: ${data.provider} - $${data.amount}`);
}

function recordDonation(data) {
  console.log(`🎁 Donation received from ${data.from}: $${data.amount}`);
}

function publisher(bus) {
  console.log("\n--- Publisher emits a salary event ---");
  bus.publish("salary", { employee: "Bob", amount: 5000 });

  console.log("\n--- Publisher emits a bill event ---");
  bus.publish("bill", { provider: "Electric Co", amount: 120 });

  console.log("\n--- Publisher emits a donation event ---");
  bus.publish("donation", { from: "Alice", amount: 50 });

  console.log("\n--- Publisher emits an unknown event (nobody subscribed) ---");
  bus.publish("mystery", { foo: "bar" });
  console.log("(silently ignored — no crash)");
}

const bus = new EventMessanger();

bus.subscribe("salary", logSalaryToBooks);
bus.subscribe("salary", sendPayslipEmail);
bus.subscribe("bill", trackExpense);
bus.subscribe("donation", recordDonation);

publisher(bus);

console.log("\n\n=== Unsubscribing payslip emails ===");
bus.unsubscribe("salary", sendPayslipEmail);

console.log("\n--- Publishing another salary event ---");
bus.publish("salary", { employee: "Carol", amount: 6000 });
