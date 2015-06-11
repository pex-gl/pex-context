window.addEventListener('load',function(){
    var tick0RequestId = -1;
    var tick1RequestId = -1;

    function tick0(dt){
        console.time('tick0');
        var arr = new Array(Math.floor(Math.random() * 1000000));
        for(var i = 0, l = arr.length; i < l; ++i){
            arr[i] = Math.random() * dt;
        }
        console.timeEnd('tick0');
        tick0RequestId = requestAnimationFrame(tick0);
    }

    function tick1(dt){
        console.time('tick1');
        var arr = new Array(Math.floor(Math.random() * 1000000));
        for(var i = 0, l = arr.length; i < l; ++i){
            arr[i] = Math.random() * dt;
        }
        console.timeEnd('tick1');
        tick1RequestId = requestAnimationFrame(tick1);
    }

    tick0();
    tick1();
});