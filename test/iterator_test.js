"use strict";

const test = require('tape');
const iterator = require('../index');

// Create a long list
var list = [];
for(var t=10;t>0;t--) {
  list.push('Item ' + t);
}

var counter = 0;

// Promise to run
// Simulate async by activating timeout
function countIterations(item) {
  return new Promise(function(resolve, reject) {
    // setTimeout(function() {
      // process.stdout.write('.');
      counter += 1;
      resolve(counter);
    // }, Math.floor(Math.random() * (1000 - 100)) + 100);
  });
}

function countIterations2(item) {
  return new Promise(function(resolve, reject) {
      counter += 1;
      if (counter === 4) {
        reject("Failed iteration");
      }
      else {
        resolve();
      }
  });
}

test('batch run', function(t) {
  t.plan(1);
  iterator(list, 2, countIterations)
  .then(function() {
    // console.log('Batch done!');
    t.equal(counter, 10);
    // t.end();
  });
});

test('batch fail', function(t) {
  t.plan(1);
  counter = 0;
  iterator(list, 2, countIterations2)
  .catch(function(err) {
    // console.log(err);
    t.equal(err, "Failed iteration");
    // t.end();
  });
});

test('empty list', function(t) {
  t.plan(1);
  counter = 0;
  iterator([], 2, countIterations)
  .catch(function(err) {
    t.equal(err, "batch-iterator: Nothing to iterate");
  });
});

test('resolved data', function(t) {
    t.plan(1);
    counter = 0;
    iterator(list, 2, countIterations)
        .then(function(data) {
            t.deepEqual(data, [1,2,3,4,5,6,7,8,9,10]);
        })
        .catch(function(err) {
            console.log(err);
            t.error(err);
        });
});
