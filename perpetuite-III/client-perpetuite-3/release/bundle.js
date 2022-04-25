'use strict';

const anyMap = new WeakMap();
const eventsMap = new WeakMap();
const producersMap = new WeakMap();
const anyProducer = Symbol('anyProducer');
const resolvedPromise = Promise.resolve();
const listenerAdded = Symbol('listenerAdded');
const listenerRemoved = Symbol('listenerRemoved');
let isGlobalDebugEnabled = false;

function assertEventName(eventName) {
  if (typeof eventName !== 'string' && typeof eventName !== 'symbol') {
    throw new TypeError('eventName must be a string or a symbol');
  }
}

function assertListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('listener must be a function');
  }
}

function getListeners(instance, eventName) {
  const events = eventsMap.get(instance);

  if (!events.has(eventName)) {
    events.set(eventName, new Set());
  }

  return events.get(eventName);
}

function getEventProducers(instance, eventName) {
  const key = typeof eventName === 'string' || typeof eventName === 'symbol' ? eventName : anyProducer;
  const producers = producersMap.get(instance);

  if (!producers.has(key)) {
    producers.set(key, new Set());
  }

  return producers.get(key);
}

function enqueueProducers(instance, eventName, eventData) {
  const producers = producersMap.get(instance);

  if (producers.has(eventName)) {
    for (const producer of producers.get(eventName)) {
      producer.enqueue(eventData);
    }
  }

  if (producers.has(anyProducer)) {
    const item = Promise.all([eventName, eventData]);

    for (const producer of producers.get(anyProducer)) {
      producer.enqueue(item);
    }
  }
}

function iterator(instance, eventNames) {
  eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
  let isFinished = false;

  let flush = () => {};

  let queue = [];
  const producer = {
    enqueue(item) {
      queue.push(item);
      flush();
    },

    finish() {
      isFinished = true;
      flush();
    }

  };

  for (const eventName of eventNames) {
    getEventProducers(instance, eventName).add(producer);
  }

  return {
    async next() {
      if (!queue) {
        return {
          done: true
        };
      }

      if (queue.length === 0) {
        if (isFinished) {
          queue = undefined;
          return this.next();
        }

        await new Promise(resolve => {
          flush = resolve;
        });
        return this.next();
      }

      return {
        done: false,
        value: await queue.shift()
      };
    },

    async return(value) {
      queue = undefined;

      for (const eventName of eventNames) {
        getEventProducers(instance, eventName).delete(producer);
      }

      flush();
      return arguments.length > 0 ? {
        done: true,
        value: await value
      } : {
        done: true
      };
    },

    [Symbol.asyncIterator]() {
      return this;
    }

  };
}

function defaultMethodNamesOrAssert(methodNames) {
  if (methodNames === undefined) {
    return allEmitteryMethods;
  }

  if (!Array.isArray(methodNames)) {
    throw new TypeError('`methodNames` must be an array of strings');
  }

  for (const methodName of methodNames) {
    if (!allEmitteryMethods.includes(methodName)) {
      if (typeof methodName !== 'string') {
        throw new TypeError('`methodNames` element must be a string');
      }

      throw new Error(`${methodName} is not Emittery method`);
    }
  }

  return methodNames;
}

const isListenerSymbol = symbol => symbol === listenerAdded || symbol === listenerRemoved;

class Emittery {
  static mixin(emitteryPropertyName, methodNames) {
    methodNames = defaultMethodNamesOrAssert(methodNames);
    return target => {
      if (typeof target !== 'function') {
        throw new TypeError('`target` must be function');
      }

      for (const methodName of methodNames) {
        if (target.prototype[methodName] !== undefined) {
          throw new Error(`The property \`${methodName}\` already exists on \`target\``);
        }
      }

      function getEmitteryProperty() {
        Object.defineProperty(this, emitteryPropertyName, {
          enumerable: false,
          value: new Emittery()
        });
        return this[emitteryPropertyName];
      }

      Object.defineProperty(target.prototype, emitteryPropertyName, {
        enumerable: false,
        get: getEmitteryProperty
      });

      const emitteryMethodCaller = methodName => function (...args) {
        return this[emitteryPropertyName][methodName](...args);
      };

      for (const methodName of methodNames) {
        Object.defineProperty(target.prototype, methodName, {
          enumerable: false,
          value: emitteryMethodCaller(methodName)
        });
      }

      return target;
    };
  }

  static get isDebugEnabled() {
    if (typeof process !== 'object') {
      return isGlobalDebugEnabled;
    }

    const {
      env
    } = process || {
      env: {}
    };
    return env.DEBUG === 'emittery' || env.DEBUG === '*' || isGlobalDebugEnabled;
  }

  static set isDebugEnabled(newValue) {
    isGlobalDebugEnabled = newValue;
  }

  constructor(options = {}) {
    anyMap.set(this, new Set());
    eventsMap.set(this, new Map());
    producersMap.set(this, new Map());
    this.debug = options.debug || {};

    if (this.debug.enabled === undefined) {
      this.debug.enabled = false;
    }

    if (!this.debug.logger) {
      this.debug.logger = (type, debugName, eventName, eventData) => {
        try {
          // TODO: Use https://github.com/sindresorhus/safe-stringify when the package is more mature. Just copy-paste the code.
          eventData = JSON.stringify(eventData);
        } catch {
          eventData = `Object with the following keys failed to stringify: ${Object.keys(eventData).join(',')}`;
        }

        if (typeof eventName === 'symbol') {
          eventName = eventName.toString();
        }

        const currentTime = new Date();
        const logTime = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}.${currentTime.getMilliseconds()}`;
        console.log(`[${logTime}][emittery:${type}][${debugName}] Event Name: ${eventName}\n\tdata: ${eventData}`);
      };
    }
  }

  logIfDebugEnabled(type, eventName, eventData) {
    if (Emittery.isDebugEnabled || this.debug.enabled) {
      this.debug.logger(type, this.debug.name, eventName, eventData);
    }
  }

  on(eventNames, listener) {
    assertListener(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];

    for (const eventName of eventNames) {
      assertEventName(eventName);
      getListeners(this, eventName).add(listener);
      this.logIfDebugEnabled('subscribe', eventName, undefined);

      if (!isListenerSymbol(eventName)) {
        this.emit(listenerAdded, {
          eventName,
          listener
        });
      }
    }

    return this.off.bind(this, eventNames, listener);
  }

  off(eventNames, listener) {
    assertListener(listener);
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];

    for (const eventName of eventNames) {
      assertEventName(eventName);
      getListeners(this, eventName).delete(listener);
      this.logIfDebugEnabled('unsubscribe', eventName, undefined);

      if (!isListenerSymbol(eventName)) {
        this.emit(listenerRemoved, {
          eventName,
          listener
        });
      }
    }
  }

  once(eventNames) {
    return new Promise(resolve => {
      const off = this.on(eventNames, data => {
        off();
        resolve(data);
      });
    });
  }

  events(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];

    for (const eventName of eventNames) {
      assertEventName(eventName);
    }

    return iterator(this, eventNames);
  }

  async emit(eventName, eventData) {
    assertEventName(eventName);
    this.logIfDebugEnabled('emit', eventName, eventData);
    enqueueProducers(this, eventName, eventData);
    const listeners = getListeners(this, eventName);
    const anyListeners = anyMap.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = isListenerSymbol(eventName) ? [] : [...anyListeners];
    await resolvedPromise;
    await Promise.all([...staticListeners.map(async listener => {
      if (listeners.has(listener)) {
        return listener(eventData);
      }
    }), ...staticAnyListeners.map(async listener => {
      if (anyListeners.has(listener)) {
        return listener(eventName, eventData);
      }
    })]);
  }

  async emitSerial(eventName, eventData) {
    assertEventName(eventName);
    this.logIfDebugEnabled('emitSerial', eventName, eventData);
    const listeners = getListeners(this, eventName);
    const anyListeners = anyMap.get(this);
    const staticListeners = [...listeners];
    const staticAnyListeners = [...anyListeners];
    await resolvedPromise;
    /* eslint-disable no-await-in-loop */

    for (const listener of staticListeners) {
      if (listeners.has(listener)) {
        await listener(eventData);
      }
    }

    for (const listener of staticAnyListeners) {
      if (anyListeners.has(listener)) {
        await listener(eventName, eventData);
      }
    }
    /* eslint-enable no-await-in-loop */

  }

  onAny(listener) {
    assertListener(listener);
    this.logIfDebugEnabled('subscribeAny', undefined, undefined);
    anyMap.get(this).add(listener);
    this.emit(listenerAdded, {
      listener
    });
    return this.offAny.bind(this, listener);
  }

  anyEvent() {
    return iterator(this);
  }

  offAny(listener) {
    assertListener(listener);
    this.logIfDebugEnabled('unsubscribeAny', undefined, undefined);
    this.emit(listenerRemoved, {
      listener
    });
    anyMap.get(this).delete(listener);
  }

  clearListeners(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];

    for (const eventName of eventNames) {
      this.logIfDebugEnabled('clear', eventName, undefined);

      if (typeof eventName === 'string' || typeof eventName === 'symbol') {
        getListeners(this, eventName).clear();
        const producers = getEventProducers(this, eventName);

        for (const producer of producers) {
          producer.finish();
        }

        producers.clear();
      } else {
        anyMap.get(this).clear();

        for (const listeners of eventsMap.get(this).values()) {
          listeners.clear();
        }

        for (const producers of producersMap.get(this).values()) {
          for (const producer of producers) {
            producer.finish();
          }

          producers.clear();
        }
      }
    }
  }

  listenerCount(eventNames) {
    eventNames = Array.isArray(eventNames) ? eventNames : [eventNames];
    let count = 0;

    for (const eventName of eventNames) {
      if (typeof eventName === 'string') {
        count += anyMap.get(this).size + getListeners(this, eventName).size + getEventProducers(this, eventName).size + getEventProducers(this).size;
        continue;
      }

      if (typeof eventName !== 'undefined') {
        assertEventName(eventName);
      }

      count += anyMap.get(this).size;

      for (const value of eventsMap.get(this).values()) {
        count += value.size;
      }

      for (const value of producersMap.get(this).values()) {
        count += value.size;
      }
    }

    return count;
  }

  bindMethods(target, methodNames) {
    if (typeof target !== 'object' || target === null) {
      throw new TypeError('`target` must be an object');
    }

    methodNames = defaultMethodNamesOrAssert(methodNames);

    for (const methodName of methodNames) {
      if (target[methodName] !== undefined) {
        throw new Error(`The property \`${methodName}\` already exists on \`target\``);
      }

      Object.defineProperty(target, methodName, {
        enumerable: false,
        value: this[methodName].bind(this)
      });
    }
  }

}

const allEmitteryMethods = Object.getOwnPropertyNames(Emittery.prototype).filter(v => v !== 'constructor');
Object.defineProperty(Emittery, 'listenerAdded', {
  value: listenerAdded,
  writable: false,
  enumerable: true,
  configurable: false
});
Object.defineProperty(Emittery, 'listenerRemoved', {
  value: listenerRemoved,
  writable: false,
  enumerable: true,
  configurable: false
});
var emittery = Emittery;
/*----------------------------------------*\
  easyPlayer - Tools.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:52:19
  @Last Modified time: 2022-04-05 12:24:12
\*----------------------------------------*/

const isFnc = fnc => fnc instanceof Function;

const uniqId = () => Math.floor(Math.random() * Date.now()).toString(16);
/*----------------------------------------*\
  easyPlayer - WebsocketWrapper.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:14:24
  @Last Modified time: 2022-04-05 13:50:54
\*----------------------------------------*/


const eventTypes = ["open", "message", "close", "error"];

class WebsocketWrapper extends WebSocket {
  constructor(wssURL) {
    super(wssURL);
    this.emitter = new emittery();

    this.onopen = event => this.emitter.emit("open", event);

    this.onmessage = event => this.emitter.emit("message", event);

    this.onclose = event => this.emitter.emit("close", event);

    this.onerror = event => this.emitter.emit("error", event);
  }

  on(eventName, handler) {
    if (!eventTypes.includes(eventName)) throw new Error("Unknown provided event name : " + eventName + "\nAccepted : " + eventTypes.join(" - "));
    if (!isFnc(handler)) throw new Error("Second parameter need to be a function");
    this.emitter.on(eventName, handler);
    return this;
  }

  once(eventName, handler) {
    if (!eventTypes.includes(eventName)) throw new Error("Unknown provided event name : " + eventName + "\nAccepted : " + eventTypes.join(" - "));
    if (!isFnc(handler)) throw new Error("Second parameter need to be a function");
    this.emitter.once(eventName, handler);
    return this;
  }

  off(eventName, handler) {
    if (!eventTypes.includes(eventName)) throw new Error("Unknown provided event name : " + eventName + "\nAccepted : " + eventTypes.join(" - "));
    if (!isFnc(handler)) throw new Error("Second parameter need to be a function");
    this.emitter.off(eventName, handler);
    return this;
  }

  send(message) {
    message = {
      id: uniqId(),
      message: message
    };
    const result = new Promise((resolve, reject) => {
      const callback = event => {
        console.log("callback", event);
        const reply = JSON.parse(event.data);

        if (reply.id == message.id) {
          this.off("message", callback);
          resolve(reply.message);
          return true;
        }

        return false;
      };

      this.on("message", callback);
    });
    super.send(JSON.stringify(message));
    return result;
  }

}
/*----------------------------------------*\
  easyPlayer - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2022-04-04 22:12:19
  @Last Modified time: 2022-04-05 14:06:35
\*----------------------------------------*/


let server;

const connect = event => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const serverAddress = `${formData.get("address")}:${formData.get("port")}`;
  server = new WebsocketWrapper(serverAddress);
  server.on("open", async evt => {
    steps[stepCursor].classList.toggle("show");
    stepCursor++;
    steps[stepCursor].classList.toggle("show");
    statusLabel.innerText = `Connected to ${serverAddress}`; //const data = await server.send("hello World")
    //console.log(data);
  }).on("message", evt => {
    console.log("message", event);
  }).on("close", evt => {// console.log(event);
  }).on("error", evt => {// console.log(event);
  });
  return false;
};

const connectForm = document.querySelector("#connection");
const statusLabel = document.querySelector("#status");
const steps = document.querySelectorAll(".step");
let stepCursor = 0;
steps[stepCursor].classList.toggle("show");
statusLabel.innerText = "Disconnected";
connectForm.addEventListener("submit", connect);