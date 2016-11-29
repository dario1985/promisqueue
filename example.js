'use strict';

const PromisQueue = require('./');

// Test
const q = new PromisQueue({ limit: 5, softLimit: 10 });

q
  .on('start', () => {
    const st = q._state;
    console.info(
      'start: {"pending": %d, "processing": %d, "maxproc": %d}',
      st.pending.length, st.processing, q.currentConcurrency
    );
  })
  .on('done', () => {
    const st = q._state;
    console.info('next: {"pending": %d, "processing": %d}', st.pending.length, st.processing);
  });

setInterval(() => {
  const num = Math.floor(Math.random() * (50 - 1)) + 1;
  for (let i = 0; i < num; i++)
    setTimeout(() =>
      q.push(() => new Promise(ok => setTimeout(() => ok(), num * 10))), num);
  console.log('Stats: ', q.stats());
}, 2000);
