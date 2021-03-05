"use strict";

function getIterator(iterations) {
  var iterator = [];
  for (var i = iterations; i > 0; i--) {
    iterator.push(i);
  }
  return iterator;
}

function batchJob(batchSize, batch, nr, accumulator, data, cb) {
  return new Promise(function(resolve, reject) {
    var ln = batch.length;
    var count = 0;
    // console.log('Beginning batch nr ', nr);
    batch.forEach(function(item, index) {
      cb(item, data)
        .then(function(res = null) {
          count += 1;
          const resIndex = (batchSize * nr) + index;
          accumulator.push({
            res,
            resIndex,
          })
          // console.log(count, ln);
          if (count === ln) {
            // console.log('Batch ' + nr + ' done');
            resolve(accumulator); // Next batch will begin
          }
        })
        .catch(function(err) {
          reject(err, accumulator);
        });
    });
  });
}

// Iterate an array in batches
module.exports = function iterate(arr, batchSize, cb, data) {
  const arrayLength = arr.length;
  var list = arr.slice(0, arrayLength);
  if (batchSize === 0) batchSize = arrayLength;
  // Will collect everything resolved
  var result = [];
  return new Promise(function(resolve, reject) {
    if (typeof batchSize === 'string') {
      batchSize = parseInt(batchSize);
    }

    if (!batchSize || batchSize < 0) {
      reject('batch-iterator: Invalid batchSize');
    } else if (!arrayLength) {
      reject('batch-iterator: Nothing to iterate');
    } else {
      var iterations = getIterator(Math.ceil(list.length / batchSize));
      // console.log(iterations);
      // Start off with a promise that always resolves
      var sequence = Promise.resolve();
      // Loop through batches
      iterations.forEach(function(item, index) {
        var batch = list.splice(0, batchSize);
        // Add these actions to the end of the sequence
        sequence = sequence
          .then(function() {
            return batchJob(batchSize, batch, index, result, data, cb)
              .then(function(accumulator) {
                if (index === iterations.length - 1) {
                  // order by the original order
                  const resArray = new Array(arrayLength);
                  accumulator.forEach(function(i) {
                    resArray[i.resIndex] = i.res;
                  });
                  resolve(resArray); // All batches are done
                }
              })
              .catch(function(err, accumulator) {
                reject(err, accumulator);
              });
          })
          .catch(function(err) {
            reject(err);
          });
      });
    }
  });
};
