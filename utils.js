/* global collisionRegionsMap, parseFloat */

function toDecimal(val){
    return parseFloat(val).toFixed(2);
} 



function removeValueFromList(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;    
}



function showCollisionRegions() {
    var regsHtml = "";
    var cnt = 0;
    for (var region in collisionRegionsMap){
        regionEntities = collisionRegionsMap[region];
        if( Object.keys(regionEntities).length > 1 ) {
            //flog("checkCollisions", regionEntities);
            regsHtml += (cnt++) + " : " + region + "=" + Object.keys(regionEntities) + "</br>";
        }
    }    
    $("#regs").html(regsHtml);    
}


function radsFromVector(dir) {
     var rads = Math.atan(dir.y/dir.x ) + Math.PI/2;
     if( dir.x >= 0 ) {
         var rads2 = rads + Math.PI;
         //flog(dir, parseInt(rads * 180/Math.PI), parseInt(rads2 * 180/Math.PI));
         return rads2;
     } else {
         //flog(dir, parseInt(rads * 180/Math.PI));
         return rads;
     }    
}

function radsToDegrees(x) {
    return x * 180 / Math.PI;
}