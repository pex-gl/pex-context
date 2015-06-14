var MAX_CAPACITY = 100;

function Stack(){
    this._arr = [];
}

Stack.prototype.push = function(obj){
    if(this._arr.length >= MAX_CAPACITY){
        this._arr.shift();
    }
    this._arr.push(obj);
};

Stack.prototype.peek = function(){
    return this.isEmpty() ? undefined : this._arr[this._arr.length - 1];
};

Stack.prototype.pop = function(){
    return this._arr.pop();
};

Stack.prototype.indexOf = function(obj){
    return this._arr.indexOf(obj);
};

Stack.prototype.isEmpty = function(){
    return this._arr.length == 0;
};

Stack.prototype.copy = function(){
    var out = new Stack();
    out._arr = this._arr.slice(0);
    return out;
};

module.exports = Stack;