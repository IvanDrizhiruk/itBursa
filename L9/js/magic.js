function sequence(fns, cb) {
    (function chain(i) {
        if (i >= fns.length) {
            cb();
        }

        fns[i](function (data) {
            chain(i + 1);
        });
    })(0);
}

function parallel(fns, cb) {
    var nCals=0;
    for(index in fns) {
        var func = fns[index];

        func(function (data) {
            nCals++;

            if(nCals === fns.length) {
                cb();
            }
        });
    }
}