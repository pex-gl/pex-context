var ObjectUtil = require('../util/ObjectUtil'),
    EventDispatcher = require('./EventDispatcher'),
    Event = require('./Event'),
    FileEvent = require('./FileEvent');

function File(path) {
    EventDispatcher.call(this);
    this.timeModifiedNew = -1;
    this.timeModifiedOld = -1;
    this.path = path;
}

File.prototype = Object.create(EventDispatcher.prototype);

var DEFAULT_WATCH_DELAY = 500;

/**
 * A basic file watcher.
 * @constructor
 */

function FileWatcher() {
    this._watches = [];
    this._watchesInvalid = [];
    this._watchesProcessed = -1;
    this._watchTimeStart = -1;
    this._watchDelay = DEFAULT_WATCH_DELAY;
    this._enabled = true;
}

/**
 * Sets the watchers file update rate.
 * @param {Number} milliseconds
 */

FileWatcher.prototype.setWatchDelay = function(milliseconds){
    this._watchDelay = milliseconds;
};

/**
 * Synchronously triggers all file watch requests and removes deleted files.
 * @private
 */

FileWatcher.prototype._watch = function(){
    var watches, invalid;

    watches = this._watches;
    invalid = this._watchesInvalid;

    for (;invalid.length > 0;) {
        watches.splice(watches.indexOf(invalid.pop()), 1);
    }

    if(!this._enabled){
        return;
    }

    this._watchTimeStart   = Date.now();
    this._watchesProcessed = 0;
    this._watchesInvalid   = [];

    for(var i = 0, watch, request; i < watches.length; ++i){
        watch   = watches[i];
        request = watch.request;

        request.open('GET',watch.file.path);
        request.send();
    }
};

/**
 * Adds a file to watch.
 * @param {String} path - The filepath
 * @param {Function} callbackModified - Callback if watched file is modified
 * @param {Function} [callbackAdded] - Callback
 * @param {Function} [callbackRemoved] - Callback if watched file has been removed
 * @param {Function} [callbackNotValid] - Callback if path isnt valid
 */

FileWatcher.prototype.addFile = function(path,callbackModified,
                                              callbackAdded,
                                              callbackRemoved,
                                              callbackNotValid){
    if(this.hasFile(path)){
        return;
    }
    var self = this;

    function onWatchProcessed(){
        if(++self._watchesProcessed < self._watches.length){
            return;
        }
        var timeDiff, delay;

        timeDiff = Date.now() - self._watchTimeStart;
        delay    = self._watchDelay;

        //Update took longer than default watch rate
        if(timeDiff >= delay){
            self._watch();
        //Wait
        } else {
            setTimeout(FileWatcher.prototype._watch.bind(self), delay - timeDiff);
        }
    }

    function watch(file){
        var request, watch;
        request = new XMLHttpRequest();
        request.addEventListener('readystatechange',function(){
            if(this.readyState != 4){
                return;
            }
            var status = this.status;
            if(status == 200){
                var time;
                time = new Date(request.getResponseHeader('Last-Modified'));
                //error
                if(time.toString() == 'Invalid Date'){
                    if(file.hasEventListener(FileEvent.FILE_NOT_VALID)){
                        file.dispatchEvent(new Event(file,FileEvent.FILE_NOT_VALID));
                    }
                    return;
                }
                //no change
                if(time == file.timeModifiedNew){
                    return;
                }
                //file touched
                if(time > file.timeModifiedNew){
                    file.dispatchEvent(new Event(file,FileEvent.FILE_MODIFIED,this.responseText));
                    file.timeModifiedOld = file.timeModifiedNew;
                    file.timeModifiedNew = time;
                }
                onWatchProcessed();
                //file removed
            } else if(status == 404){
                file.dispatchEvent(new Event(file,FileEvent.FILE_REMOVED));
                self._watchesInvalid.push(watch);
                onWatchProcessed();
            }
        });

        watch = {file:file,request:request};
        self._watches.push(watch);

        self._watch();
    }

    function addFile(file){
        var request;

        request = new XMLHttpRequest();
        request.open('GET',file.path);
        request.addEventListener('readystatechange',function(){
            if(this.readyState != 4){
                return;
            }
            var status = this.status;
            if(status == 200){
                file.dispatchEvent(new Event(file,FileEvent.FILE_ADDED,request.responseText));
                watch(file);
            } else if(status == 404){
                file.dispatchEvent(new Event(file,FileEvent.FILE_REMOVED));
            }
        });
        request.send();
    }

    var request;

    request = new XMLHttpRequest();
    request.open('HEAD',path);

    //Get initial file info
    request.addEventListener('readystatechange',function(){
        if(this.readyState != 4){
            return;
        }
        var status = this.status;
        if(status == 200){
            var file, time;

            file = new File(path);
            if(callbackNotValid){
                file.addEventListener(FileEvent.FILE_NOT_VALID,callbackNotValid);
            }
            time = new Date(request.getResponseHeader('Last-Modified'));
            //file not valid
            if(time.toString() == 'Invalid Date'){
                if(file.hasEventListener(FileEvent.FILE_NOT_VALID)){
                    file.dispatchEvent(new Event(file,FileEvent.FILE_NOT_VALID));
                }
            }
            //add initial time
            file.timeModifiedNew = time;

            //add listener
            if(callbackAdded){
                file.addEventListener(FileEvent.FILE_ADDED,callbackAdded);
            }
            if(callbackModified){
                file.addEventListener(FileEvent.FILE_MODIFIED,callbackModified);
            }
            if(callbackRemoved){
                file.addEventListener(FileEvent.FILE_REMOVED,callbackRemoved);
            }

            addFile(file);

        } else if(status == 404){
            if(callbackNotValid){
                callbackNotValid();
                return;
            }
            console.log('File does not exist. File: ' + path);
        }
    });
    request.send();
};

/**
 * Removes a file from the watcher.
 * @param {String} path - The file path
 */

FileWatcher.prototype.removeFile = function(path){
    if(!this.hasFile(path)){
        console.log('File not added to watcher. File: ' + path);
        return;
    }
    var watches = this._watches;
    for(var i = 0, len = watches.length; i < len; ++i){
        if(watches[i].file.path == path){
            watches.splice(i,1);
            return;
        }
    }
};

/**
 * Returns true if the watcher is currently watching the file path.
 * @param {String} path = The file path
 * @returns {Boolean}
 */

FileWatcher.prototype.hasFile = function(path){
    var watches = this._watches;
    for(var i = 0, len = watches.length; i < len; ++i){
        if(watches[i].file.path == path){
            return true;
        }
    }
    return false;
};

/**
 * Restarts the watcher if stopped.
 */

FileWatcher.prototype.restart = function(){
    if(this._watches.length == 0){
        return;
    }
    this._enabled = true;
    this._watch();
};

/**
 * Stops the watcher.
 */

FileWatcher.prototype.stop = function(){
    this._enabled = false;
};

module.exports = FileWatcher;