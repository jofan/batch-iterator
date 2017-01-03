"use strict";

function getIterator(iterations) {
    var iterator = [];
    for(var i=iterations;i>0;i--) {
        iterator.push(i);
    }
    return iterator;
}

function batchJob(batch, nr, cb) {
    return new Promise(function(resolve, reject) {
        var ln = batch.length;
        var count = 0;
        // console.log('Beginning batch nr ', nr);
        batch.forEach(function(item) {
            cb(item).then(function() {
                count += 1;
                // console.log(count, ln);
                if (count === ln) {
                    // console.log('Batch ' + nr + ' done');
                    resolve(); // Next batch will begin
                }
            });
        });
    });
}

// Iterate an array in batches
module.exports = function iterate(arr, batchSize, cb) {
    return new Promise(function(resolve, reject) {
        var iterations = getIterator(Math.ceil(arr.length/batchSize));
        // console.log(iterations);
        // Start off with a promise that always resolves
        var sequence = Promise.resolve();
        // Loop through batches
        iterations.forEach(function(item, index) {
            var batch = arr.splice(0, batchSize);
            // Add these actions to the end of the sequence
            sequence = sequence.then(function() {
                return batchJob(batch, index, cb).then(function() {
                    if (index === iterations.length - 1) {
                        resolve(); // All batches are done
                    }
                });
            });
        });
    });
};
