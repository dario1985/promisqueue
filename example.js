'use strict';

const PromisQueue = require('./');

// Test
const q = new PromisQueue({ limit: 10, softLimit: 20 });

q
  .on('start', () => {
    const st = q._state;
    console.info(
      'start: {"pending": %d, "processing": %d, "maxproc": %d}',
      st.pending.length, st.processing, q.currentConcurrency
    );
  })
  .on('next', () => {
    const st = q._state;
    console.info('next: {"pending": %d, "processing": %d}', st.pending.length, st.processing);
  })
  .on('drained', () => {
    console.log('Stats: ', q.stats());
  });

setInterval(() => {
  const num = Math.floor(Math.random() * (50 - 10)) + 1;
  for (let i = 0; i < num; i++)
    setTimeout(() =>
      q.add(() => new Promise(ok => setTimeout(() => ok(), num * 10))), num);
}, 2000);
