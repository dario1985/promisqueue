'use strict';

const EventEmitter = require('events')
  , measured = require('measured');

class PromisQueue extends EventEmitter {
  constructor(options) {
    super();

    this._state = new QueueState(options || {});

    const st = this._state, _this = this;

    st.next = function () {
      st.processed.mark();
      st.processing--;
      if (!st.resuming) {
        st.resuming = true;
        process.nextTick(() => {
          st.resuming = false;
          _this.emit('next');
          _this._start();
        });
      }
    };
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
    if (st.pending.length) {
      for (let p; st.pending.length > 0 && st.processing < maxproc; st.processing++) {
        try {
          p = st.pending.shift()();
        } catch (e) {
          p = Promise.reject(e);
        }
        p.then(st.next).catch(st.next);
        this.emit('start', p);
      }
      if (!st.pending.length) this.emit('drained');
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
