# batch-iterator
JavaScript batch iterator using promises.

Useful when you need to throttle how many concurrent processes are running simultaneously, while being notified when they're all done (or something fails).

## Installation

```
npm install batch-iterator --save
```

## Usage

```
var iterator = require('batch-iterator');

iterator(list, batchSize, extraData, promise)
  .then(function(accumulator) {
    console.log('List of result from promise', accumulator);
  })
  .catch(function(err) {
    console.log("A promise failed", err);
  });
```

The **list** will be iterated, and each item in the list will be passed on to
the **promise** callback.

**batchSize** is how many items in the list should be started simultaneously.
Default size is 10.

The **accumulator** is a list of the data resolved in each promise.

The **extraData** will be passed to each function.

## Example
In the example below we use the [Pageres module](https://github.com/sindresorhus/pageres)
to capture 100 screenshots in batches of 10.

```
const Pageres = require('pageres');
const iterator = require('batch-iterator');
const urls = ["https://github.io", ..., ]; // imagine 100 urls

const startTime = Date.now();

iterator(urls, 10, function(url) {
       var pageres = new Pageres();
       // Return the pageres promise
       return pageres
           .src(url, ['1024x768'])
           .dest(process.cwd() + '/screenshots')
           .run();
   })
   .then(function() {
     const endTime = Date.now();
     const diffTime = (endTime - startTime) / 1000;
     console.log("Screenshots captured in " + diffTime + " seconds.");
   })
   .catch(function(err) {
     console.log(err);
   });
```
