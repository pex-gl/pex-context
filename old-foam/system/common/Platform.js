var Platform = {WEB:'WEB',NODE_WEBKIT:'NODE_WEBKIT'};
    Platform.__target = null;

Platform.getTarget  = function(){
    if(!this.__target){
        var bWindow     = typeof window !== 'undefined',
            bDocument   = typeof document !== 'undefined',
            bRequireF   = typeof require == 'function',
            bRequire    = !!require,
            bNodeWebkit = false;

        //TODO fix
        //hm this needs to be fixed -> browserify require vs node-webkit require
        //for now this does the job
        if(bDocument){
            bNodeWebkit = document.createElement('IFRAME').hasOwnProperty('nwdisable');
        }

        this.__target = (bWindow && bDocument && !bNodeWebkit) ? this.WEB :
                        (bWindow && bDocument &&  bNodeWebkit) ? this.NODE_WEBKIT :
                        null;

    }

    return this.__target;
};

module.exports = Platform;