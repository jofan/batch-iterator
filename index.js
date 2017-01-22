"use strict";


function getIterator(iterations) {
    var iterator = [];
    for(var i=iterations;i>0;i--) {
        iterator.push(i);
    }
    return iterator;
}

function batchJob(batch, nr, accumulator, cb) {
    return new Promise(function(resolve, reject) {
        var ln = batch.length;
        var count = 0;
        // console.log('Beginning batch nr ', nr);
        batch.forEach(function(item) {
            cb(item)
              .then(function(data) {
                  count += 1;
                  if (data) accumulator.push(data);
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
module.exports = function iterate(arr, batchSize, cb) {
    var list = arr.slice(0, arr.length);
    // Will collect everything resolved
    var result = [];
    return new Promise(function(resolve, reject) {
      if (!arr.length) {
        reject('batch-iterator: Nothing to iterate');
      }
      else {
        var iterations = getIterator(Math.ceil(list.length/batchSize));
        // console.log(iterations);
        // Start off with a promise that always resolves
        var sequence = Promise.resolve();
        // Loop through batches
        iterations.forEach(function(item, index) {
            var batch = list.splice(0, batchSize);
            // Add these actions to the end of the sequence
            sequence = sequence
              .then(function() {
                  return batchJob(batch, index, result, cb)
                    .then(function(accumulator) {
                        if (index === iterations.length - 1) {
                            resolve(accumulator); // All batches are done
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
