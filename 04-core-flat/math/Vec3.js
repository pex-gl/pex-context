module.exports = {
    add3 : function(a,b){
        a[0] += b[0];
        a[1] += b[1];
        a[2] += b[2];
        return a;
    },
    scale3 : function(a,n){
        a[0] *= n;
        a[1] *= n;
        a[2] *= n;
        return a;
    }
};