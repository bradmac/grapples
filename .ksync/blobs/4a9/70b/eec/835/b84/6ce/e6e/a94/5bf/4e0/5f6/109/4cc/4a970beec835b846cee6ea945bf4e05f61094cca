function vectorsEqual(vec1, vec2) {
    if( vec1.x != vec2.x ) return false;
    if( vec1.y != vec2.y ) return false;
    return true;
}


function vector(entity1, entity2) {
    var x = entity1.x - entity2.x;
    var y = entity1.y - entity2.y;
    return {
        x: x,
        y: y
    };
}

function scalarDist(vec) {
    //    flog("scalar dist", vec.x, vec.y);
    //flog("scalar dist", Math.pow(vec.x,2), Math.pow(vec.y,2));
    var dist = Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y, 2));
    return dist;
}

function toVector(rads, length) {
    return {
        x : Math.sin(rads) * length,
        y : Math.cos(rads) * length
    };
}

function scaleVector(vec, factor) {
    return {
        x: vec.x * factor,
        y: vec.y * factor
    };
}
