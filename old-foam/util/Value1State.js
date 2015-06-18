function Value1State(){
    this._a = null;
    this._b = null;
}

Value1State.prototype.push = function(a){
    this._b=this._a;
    this._a=a;
};

Value1State.prototype.peek = function(){
    return this._a;
};

Value1State.prototype.isEqual = function(){
    return this._a == this._b;
};

Value1State.EMPTY = null;

module.exports = Value1State;