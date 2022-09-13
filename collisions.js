



/* global collisionRegionsMap, entities, COLLISION_REGION_SCALE_FACTOR */

function checkCollisions() {
        // for each collision region, check the entities in that region for collisions with each other

        for (var region in collisionRegionsMap){
            regionEntities = collisionRegionsMap[region];
            if( Object.keys(regionEntities).length > 1 ) {
                //flog("checkCollisions", regionEntities);
                for( var entity1Id in regionEntities ) {
                    for( var entity2Id in regionEntities ) {
                        if( entity1Id !== entity2Id )  {
                            var entity1 = regionEntities[entity1Id];
                            if( entity1 ) {
                                var entity2 = regionEntities[entity2Id];
                                if( entity2 ) {
                                    checkCollision(entity1, entity2);
                                }
                            } else {
                                delete regionEntities[entity1Id];
                            }
                        }
                    }
                }
            }
            
        }         
        
//        $.each(entities, function (i, entity2) {
//            if( checkCollision(player, entity2) ) {
//                return false;
//            }
//        });    
}



function checkCollision(entity1, entity2) {
    if( entity1 == entity2 ) {
        return false;
    }
    if( entity1.isEliminated || entity2.isEliminated ) {
        return;
    }
    //flog("checkCollision", entity1.id, entity1.x, entity1.y);
    //flog("checkCollision", entity2.id, entity2.x, entity2.y);
    
    // not collide if entity1 right edge is left of entity2 left edge
    if( (entity1.x + entity1.radius) < (entity2.x - entity2.radius) ) {
        //flog("checkCollision.1", (entity1.x + entity1.radius), "<", (entity2.x - entity2.radius));
        return false;
    }
    
    if( (entity1.x - entity1.radius) > (entity2.x + entity2.radius) ) {
        //flog("checkCollision.2", (entity1.x - entity1.radius), ">" , (entity2.x + entity2.radius));
        return false;
    }    

    if( (entity1.y + entity1.radius) < (entity2.y - entity2.radius) ) {
        //flog("checkCollision.3", (entity1.y + entity1.radius), "<" , (entity2.y - entity2.radius));
        return false;
    }
    if( (entity1.y - entity1.radius) > (entity2.y + entity2.radius) ) {
        //flog("checkCollision.4", (entity1.y - entity1.radius), ">" , (entity2.y + entity2.radius));
        return false;
    }
    
    // should do a final check on geometry. ie calc distnace from centres, and compare with radiuses
    
    // We have a collision
    flog("COLLISION", entity1.id, entity2.id);
    flog("COLLISION", Math.floor(entity1.x), Math.floor(entity1.y), Math.floor(entity2.x), Math.floor(entity2.y));
    //return;
    
    //entity2.setColor(0xFF0000);
    var entityToRemove = null;
    if( entity1.mass > entity2.mass ) {
        entity1.collideWith(entity2);
        entityToRemove = entity2;
        flog("COLLISION - new mass=", entity2.mass);
    } else {
        entity2.collideWith(entity1);
        entityToRemove = entity1;
        flog("COLLISION - new mass=", entity1.mass);
    }
    eliminate(entityToRemove);
    return true;
}

function eliminate(entityToRemove) {
    flog("eliminate", entityToRemove.id);
    entityToRemove.isEliminated = true;
    entityToRemove.eliminated();
    
    var index = entities.indexOf(entityToRemove);
    if (index > -1) {
        entities.splice(index, 1);
    }    
    removeFromCollisionRegions(entityToRemove);
}



function updateCollisionRegions(entity) {
    var startRegionVec = entity.lastRegionVec;
    entity.lastRegionVec = _updateCollisionRegions(startRegionVec, entity, false);
}

function removeFromCollisionRegions(entity) {    
    for (var region in collisionRegionsMap){
        regionEntities = collisionRegionsMap[region];    
        delete regionEntities[entity.id]; 
    }
    
    //var regionVec = findCollisionRegionVec(entity);
    //var r = _updateCollisionRegions(regionVec, entity, true);
    //return r;
}

function _updateCollisionRegions(startRegionVec, entity, doRemoveAll) {
    if( entity.isEliminated ) {
        removeFromCollisionRegions(entity);
        return;
    }
    var newRegionVec = findCollisionRegionVec(entity);
    if( startRegionVec != null && vectorsEqual(startRegionVec, newRegionVec) && !doRemoveAll ) {
        // no change to centre collision region, so do nothing
        //flog("_updateCollisionRegions.1: no change", startRegionVec, newRegionVec);
    } else {
        //flog("_updateCollisionRegions.2: changed", startRegionVec, newRegionVec);
        var startRegions = entity.collisionRegions;
        if( startRegions === null ) {
            startRegions = [];
        }
        var newRegions;
        if( doRemoveAll ) {
            newRegions = [];    // removed, so not in any regions
        } else {
            newRegions = findCollisionRegions(newRegionVec);
        }
        // remove from start regions not in new regions
        for (var i = 0; i < startRegions.length; i++) {
            var startRegionKey = startRegions[i];
            if( !newRegions.includes(startRegionKey) ) {
                // no longer in this region, so remove from collisionRegionsMap[startRegionKey]
                removeFromCollisionRegion(entity, startRegionKey );
            }
        }

        for (var i = 0; i < newRegions.length; i++) {
            var newRegionKey = newRegions[i];
            if( !startRegions.includes(newRegionKey) ) {
                // is newly in this region, so add to collisionRegionsMap[newRegionKey]
                var list = findCollisionRegionList(newRegionKey);
                list[entity.id] = entity;
                //flog("add to collision region", startRegionKey, Object.keys(list).length);
            }            
        }
        entity.collisionRegions = newRegions;
        //flog("collisions", collisionRegionsMap);
    }    
    return newRegionVec;
}



function removeFromCollisionRegion(entity, regionKey) {
    var list = findCollisionRegionList(regionKey);
    //flog("remove from collision region", regionKey, Object.keys(list).length);
    delete list[entity.id]; 
    if( Object.keys(list).length === 0 ) {
        // no longer needed, so remove for performance
        delete collisionRegionsMap[regionKey];
    }
}


function findCollisionRegionList(regionKey) {
    var list = collisionRegionsMap[regionKey];
    if( list == null ) {
        list = {};  // map of entities, keyed on their id
        collisionRegionsMap[regionKey] = list;
    }
    return list;
}

function findCollisionRegionVec(entity) {
    var regionX = parseInt(entity.x / COLLISION_REGION_SCALE_FACTOR);
    var regionY = parseInt(entity.y / COLLISION_REGION_SCALE_FACTOR);
    return { x : regionX, y : regionY};
}

/**
 * Returns a list of region keys
 * 
 * @param {type} vec
 * @returns {Array|findCollisionRegions.list}
 */
function findCollisionRegions(vec) {
    var list = [];
    if( vec != null ) {
        var regionX = vec.x;
        var regionY = vec.y;
        list.push(regionX + "_" + regionY); // centre
        list.push((regionX-1) + "_" + (regionY-1)); // top left
        list.push((regionX-1) + "_" + (regionY)); // centre left
        list.push((regionX-1) + "_" + (regionY+1)); // bottom left
        
        list.push((regionX) + "_" + (regionY-1)); // top middle
        list.push((regionX) + "_" + (regionY)); // centre middle
        list.push((regionX) + "_" + (regionY+1)); // bottom middle
        
        list.push((regionX+1) + "_" + (regionY-1)); // top right
        list.push((regionX+1) + "_" + (regionY)); // centre right
        list.push((regionX+1) + "_" + (regionY+1)); // bottom right  
    }
    return list;
}
