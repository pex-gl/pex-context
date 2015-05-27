
###Cache loop properties

http://jsperf.com/loop-cache-vs-query

###Prevent obj arguments 

http://jsperf.com/obj-arg-vs-args

    //fixed args
    func(0,1);
    
    //prevent variable arg list in performance critical functions
    func(0,1);
    func(0,1,2,3);
    
    //slow
    func({a:0,b:1});


###Be cautious with arg lists

http://jsperf.com/args-list-vs-args-fixed
    
###Fixed vs dynamic obj properties

http://jsperf.com/fixed-properties-vs-dynamic-properties



    var CONSTANT = 1;
    
    var Enum = {
      STATE_A : 'enumStateA',
      STATE_B : 'enumStateB',
      STATE_C : 'enumStateC'
    };
    
    var option = {
      optionA : 'optionA',
      optionB : 'optionB',
      optionC : 'optionC'
    }
    
    function Class(){
      //private
      this._memberA = 1;
      this._memberB = 2;
      this._memberC = 3;
     
      this._boolA = false; 
      this._boolB = true;
      
      //public
      this.memberD = 4;
    }
    
    //accessibel private members must! have explicit getters or setters.
    Class.property.getMemberA = function(){
      return this._memberA;
    };
    
    Class.property.setMemberA = function(a){
      this._memberA = a;
    };
    
    //state
    Class.property.isBoolA = function(){
      return this._boolA;
    };
    
    //property
    Class.property.hasBoolB = function(){
      return this._boolB;
    };
    
    Class.property.enableBoolA = function(enable){
      this._boolA = enable;
    }
    
    Class.staticMethod = function(a){
    };
    
    Class.FactoryMethod = function(){
      return new Class();
    };
    
    
###Inheritance    
    
    function BaseClass(){
      this._memberA = 0;
    }
    
    //force implementation
    BaseClass.prototype.funcA = function(){
      throw new Error('BaseClass funcA not implemented.);
    }
    
    //indicate shared optional overrides in baseclass
    
    //override
    BaseClass.prototpype.funcB = function(){};
    
    function SubClass(){
      BaseClass.call(this);
    }
    
    SubClass.prototype = Object.create(SubClass.prototype);
    SubClass.prototype.constructor = BaseClass;
    
    subClassInstance.funcA(); //throws
    
    
###Constructor arguments
    
    function Class(a,b,c){
    }
    
    //indicate obj arguments with naming
    function Class(a,b,options){
    
      //default options
      options   = options   !== undefined ? options   : {};
      options.a = options.a !== undefined ? options.a : 1;
      options.b = options.b !== undefined ? options.b : 2;
    }
    
###Merge

    var objA = {a : 0, b : 1};
    var objB = {c : 2, d : 3};
    
    for(var m in objA){
      objB[m] = objA[m];
    }