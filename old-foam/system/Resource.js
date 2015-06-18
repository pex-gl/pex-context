var ObjectUtil   = require('../util/ObjectUtil'),
    ResourceType = require('./ResourceType'),
    Resources    = require('./Resources');

var OBJLoader = require('./OBJLoader');

function strLogResourceLoadFail(path,type,index){
    return 'Warning: Failed to load Resource ' + "'" + path + "' of type '" + type + "'" + (index != null ? (' at index ' + index + ' .') : '.') ;
}

function strLogResourceUnsupported(path, type, index) {
    return 'Warning: Resource ' + "'" + path + "' of type '" + type + "'" + (index != null ? (' at index ' + index + ' ') : ' ') + 'is not supported.';
}

function strLogResourceNoPath(type,index) {
    return 'Warning: Resource ' + (type ? ('of type "' + type + '" ') : '') + (index != null ? ( ' at index ' + index )  : '"') + ' has no path.';
}

function request__(path,type,callbackSuccess,callbackError){
    var request = new XMLHttpRequest();
    request.open('GET', path);
    request.responseType = type;
    request.addEventListener('readystatechange', function(){
        if(request.readyState == 4){
            if(request.status == 200){
                callbackSuccess(request.response);
            } else if(request.status == 404){
                callbackError();
            }
        }
    });
    request.send();
}

function Load(resource,index,callbackSuccess,callbackError,strict){
    var path = resource.path;
    if(!path){
        console.log(strLogResourceNoPath(resource.type,index));
        if(callbackError){
            callbackError();
        }
        return;
    }
    var type = resource.type || 'text',
        options = resource.options;

    if(type != ResourceType.IMAGE &&
       type != ResourceType.ARRAY_BUFFER &&
       type != ResourceType.BLOB &&
       type != ResourceType.DOCUMENT &&
       type != ResourceType.JSON &&
       type != ResourceType.TEXT &&
       type != ResourceType.OBJ){
        console.log(strLogResourceUnsupported(path,type,index));
        if(callbackError && strict){
            callbackError(path);
        }
        return;
    }

    function callbackSuccess_(response){
        if (callbackSuccess) {
            callbackSuccess(response, index);
        }
    }

    function callbackError_(){
        console.log(strLogResourceLoadFail(path, type, index));
        if (callbackError && strict) {
            callbackError(path);
        }
    }

    switch (type){
        case ResourceType.IMAGE:
            var image = new Image();
            image.addEventListener('load', function () {
                if (callbackSuccess) {
                    callbackSuccess(image, index);
                }
            });
            image.addEventListener('error', callbackError_);
            image.src = path;
            break;

        case ResourceType.OBJ:
            request__(path, 'text',
                function (response) {
                    OBJLoader.Load(response,callbackSuccess_,options);
                },callbackError_);
            break;

        default :
            request__(path, type, callbackSuccess_,callbackError_);
            break;
    }
}



var Resource = {

    /**
     * Load a resource.
     * @param {Object|Object[]} resource - The resource / resource-bundle {path, type} to be loaded
     * @param {Function} callbackSuccess - Callback if succesfully loaded (function(resource))
     * @param {Function} [callbackError] - Callback if an error occured
     * @param {Function} [callbackProcess] - Callback on load
     * @param {bool} [strict=true] - Abort if at least one resource could not be loaded
     */

    load : function(resource, callbackSuccess, callbackError, callbackProcess, strict){
        strict = ObjectUtil.isUndefined(strict) ? true : strict;
        var keys = ObjectUtil.getKeys(resource),
            numKeys = keys.length;

        if(numKeys == 0){
            console.log('Warning: Invalid Resource.');
            if(callbackError){
                callbackError();
            }
            return;
        }

        if(numKeys <= 2 && (keys[0] == 'path' || keys[0] == 'type')){
            Load(resource,null,callbackSuccess, callbackError,strict);
            return;
        } else if(numKeys == 1){
            resource = resource[keys[0]];
            Load(resource,null,function(resource){
                Resources[keys[0]] = resource;
                callbackSuccess(Resources);
            }, callbackError, strict);
            return;
        }

        var numFiles = numKeys,
            numFilesLoaded = 0;

        var error = false;

        function onFileProcessed(){
            if(numFilesLoaded == numFiles){
                if(callbackSuccess){
                    callbackSuccess(Resources);
                }
                return;
            }
            if(callbackProcess){
                callbackProcess(numFilesLoaded,numFiles);
            }
        }

        function onError(){
            if(!strict){
                numFiles--;
                onFileProcessed();
                return;
            }
            if(callbackError){
                callbackError();
            }
            error = true;
        }

        var index = 0;
        for(var key in resource){
            Load(resource[key],index++,
                 function(resource,index){
                     Resources[keys[index]] = resource;
                     numFilesLoaded++;
                     onFileProcessed();
                 },onError.bind(this));
            if(error){
                return;
            }
        }
    }
};

module.exports = Resource;