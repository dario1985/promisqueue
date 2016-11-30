# PromisQueue [![NPM Version](https://badge.fury.io/js/promisqueue.png)](https://npmjs.org/package/promisqueue) [![Build Status](https://travis-ci.org/dario1985/promisqueue.png?branch=master)](https://travis-ci.org/dario1985/promisqueue)

Simple ES6 Promises based queue, with optional (and flexible) concurrency.

## Installation

`promisqueue` can be installed using `npm`:

```
npm install promisqueue
```

## Interface

 - `new PromisQueue(Object options): PromisQueue`
 
 

### Methods:

 - `PromisQueue#add(Function factory): Number` - adds function argument that generates a promise to the queue (FIFO)
 - `PromisQueue#prepend(Function factory): Number` - adds function argument that generates a promise to the queue (LIFO)
 
### Properties:
 - `PromisQueue#length: Number` - returns current length of buffer(added but not started promise generators)
 - `PromisQueue#currentConcurrency: Number` - returns number of current concurrency limit
