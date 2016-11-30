'use strict';

const EventEmitter = require('events')
  , measured = require('measured');

class PromisQueue extends EventEmitter {
  constructor(options) {
    super();

    this._state = new QueueState(options || {});

    const st = this._state;

    st.next = function () {
      st.processed.mark();
      st.processing--;
      this.emit('done');
      this._start();
    }.bind(this);
  }

  get length() {
    return this._state.pending.length;
  }

  get currentConcurrency() {
    const st = this._state;
    return st.pending.length > st.highWatermark ? st.softLimit : st.limit;
  }

  add(p) {
    checkGenerator(p);
    this._state.pending.push(p);
    this._start();
    return this.length;
  }

  prepend(p) {
    checkGenerator(p);
    this._state.pending.unshift(p);
    this._start();
    return this.length;
  }

  stats() {
    return this._state.processed.toJSON();
  }

  _start() {
    const st = this._state, maxproc = this.currentConcurrency;
    this.emit('start');
    for (let p; st.pending.length > 0 && st.processing < maxproc; st.processing++) {
      p = st.pending.shift();
      p().then(st.next).catch(st.next);
    }
  }
}

module.exports = PromisQueue;

class QueueState {
  constructor(options) {
    this.limit = options.limit || 10;
    this.softLimit = options.softLimit || this.limit * 2;
    this.highWatermark = options.highWatermark || this.softLimit * 5;
    this.pending = [];
    this.processing = 0;
    this.processed = new measured.Meter();
  }
}

function checkGenerator(fn) {
  if (typeof fn !== 'function' || fn.length > 0)
    throw new TypeError('Promise factory function expected.');
}
