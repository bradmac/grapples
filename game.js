/* global PIXI */

const THRUST_VAL = 90000;



// asd



const MAX_THRUST_FUEL = 2000;
const THRUST_RECOVERY_PER_MILLI = 10;
const TURN_STEP_DEG = 0.12;
const G = 0.001;
const COLLISION_REGION_SCALE_FACTOR = 30; // small value means more fine grained regions
const MAX_ASTEROIDS = 50;
const BULLET_SPEED = 25;
const STRETCH_FACTOR = 1;
const NUM_PLANETS = 5;
const ASTEROID_G = 0.02;
const RANGE = 5000; // range over which to create asteroids and planets
const SUN_MASS = 40000000;
const MIN_PLANET_MASS = 4000000;
const GAME_LOOP_MS = 100;
const GAME_INTERVAL = 1 / GAME_LOOP_MS;
const RADIUS_MULT = 0.4;


// hello world     asdasdasd asdas das sd



var entities = [];
var lassos = [];
var massiveObjects = [];
var stars = [];
var player;
var app;
var container;
var rocyTexture;
var asteroidCounter = 0;
var bulletCounter = 0;
var collisionRegionsMap = {}; // map entries are a list of entities keyed on a hash of the position. Each entity will be in central region plus the surrounding regions

var sun1;
var stopped;


var gameWidth;
var gameHeight;


function initGame() {
    //alert("start?");
    flog("START GAME");

    var gameDiv = $("#game");
    gameWidth = gameDiv.width();
    gameHeight = $(document).height();
    app = new PIXI.Application({
        width: gameWidth,
        height: gameHeight,
        backgroundColor: 0x000000,
        resolution: window.devicePixelRatio || 1
    });
    $("#game")[0].appendChild(app.view);
    //document.body.appendChild(app.view);

    container = new PIXI.Container();
    container.scale.x = 0.7;
    container.scale.y = 0.7;

    app.stage.addChild(container);

    // Create a new texture
    rocyTexture = PIXI.Texture.from('/Booster.png');

    // Move container to the center
    container.x = 800;
    container.y = 400;


    //container.pivot.x = container.width / 2;
    //container.pivot.y = container.height / 2;


    player = new ShipEntity("player1", "blue", 1000, 80, 80);
    player.x = -2000;
    player.y = -2000;
    entities.push(player);
    
    
    sun1 = new PlanetEntity("sun1", 0xffff00, SUN_MASS);
    sun1.x = 0;
    sun1.y = 0;
    sun1.velocity = {
        x: 0,
        y: 0
    };
    massiveObjects.push(sun1);

    for (var n = 1; n < NUM_PLANETS + 1; n++) {
        var p = createPlanet(n, MIN_PLANET_MASS);
        massiveObjects.push(p);
    }


    $.each(massiveObjects, function (i, entity) {
        updateCollisionRegions(entity);
    });
    showCollisionRegions();

    for (var i = 0; i < 2000; i++) {
        var x = Math.floor((Math.random() * 10000)) - 5000 / 2;
        var y = Math.floor((Math.random() * 10000)) - 5000 / 2;
        var star = new PlanetEntity("star" + i, 0xFFFFFF, 0, MIN_PLANET_MASS/10);
        star.x = x;
        star.y = y;
        stars.push(star);
    }

    createAsteroids(5);
    createAsteroids(5);


    initControls(player);
    gameLoop();
    renderLoop();
    
    // Listen for animate update
    var tickerDelta = 0;
    var accumDelta = 0;
    app.ticker.add((delta) => {

        if (stopped) {
            return;
        }
        tickerDelta += delta;
        accumDelta += delta;
        if (accumDelta < 2) {
            return;
        }
        //flog("accumDelta",accumDelta);
        accumDelta = 0;
        //flog("delta",  tickerDelta);
        if (tickerDelta > 200) {
            tickerDelta = 0;
            createAsteroids(2);
        }

        // rotate the container!
        // use delta to create frame-independent transform
        container.pivot.x = player.x;
        container.pivot.y = player.y;

        //container.rotation = player.directionRads * -1 + Math.PI;

        player.doControls();
        $.each(entities, function (i, entity) {
            if (entity) {
                entity.move(delta);
            }
        });
        $.each(massiveObjects, function (i, entity) {
            entity.move(delta);
        });


        //container.x = app.screen.width / 2 - player.x;
        container.x = gameWidth / 2;
        container.y = gameHeight / 2; //app.screen.height / 2 - player.y;

        renderLoop();

        checkCollisions();
        applyLassos();
    });
    flog("GAME STARTED");
}



function gameLoop() {
    //flog("gameLoop");
    if (!stopped) {
        applyGravity();

        //showCollisionRegions();
    }

    $("#mats").text(parseInt(player.mats));
    //$("#velx").text(parseInt(player.velocity.x));
    //$("#vely").text(parseInt(player.velocity.y));

    //$("#entities").text(entities.length);
    //$("#x1").text(parseInt(player.x));
    //$("#y1").text(parseInt(player.y));
    //$("#dirrads").text(toDecimal(player.directionRads));
    //$("#dirdegrees").text(parseInt(player.directionRads * 180 / Math.PI));

    //$("#dirx").text(toDecimal(player.direction.x));
    //$("#diry").text(toDecimal(player.direction.y));

    $("#x2").text(parseInt(container.x));
    $("#y2").text(parseInt(container.y));
    $("#x3").text(parseInt(container.width));
    $("#y3").text(parseInt(container.height));
    $("#x4").text(parseInt(app.screen.width));
    $("#y4").text(parseInt(app.screen.height));
    $("#thrust").text(parseInt(player.thrust));
    $("#fuel").text(parseInt(player.fuel));

    //requestAnimationFrame(renderLoop);
    window.setTimeout(gameLoop, GAME_LOOP_MS);
}


function renderLoop() {
    $.each(stars, function (i, entity) {
        entity.draw();
    });

    $.each(massiveObjects, function (i, sun) {
        //flog("draw massie object", sun.id, sun.x, sun.y);
        sun.draw();
    });

    $.each(entities, function (i, entity) {
        entity.draw();
    });
    $.each(lassos, function (i, n) {
        if (n) {
            n.draw();
        }
    });
}


/**
 * Calculate forces and accelerations from lassos
 * 
 */
function applyLassos() {
    $.each(lassos, function (i, n) {
        if (n) {
            // calculate actual length, stretch force is a multuple
            var vec = vector(n.entity1, n.entity2);
            var actualLength = scalarDist(vec);
            if (actualLength > n.length) {
                calcLassoAccel(n.entity1, n.entity2, n);
                calcLassoAccel(n.entity2, n.entity1, n);
                //var stretch = actualLength / n.length;
                // force is stretch x a constant
                //var force = stretch * 10;
                var forceVec = scaleVector(vec, STRETCH_FACTOR);
                var accelVec
            }
        }
    });
}


function calcLassoAccel(targetEntity, otherEntity, lasso) {
    var vec = vector(otherEntity, targetEntity);
    var forceVec = scaleVector(vec, STRETCH_FACTOR);
    var accelVector = scaleVector(forceVec, 1 / targetEntity.mass);
    //flog("calcLassoAccel",targetEntity, accelVector);
    targetEntity.velocity.x += (accelVector.x);
    targetEntity.velocity.y += (accelVector.y);
}




function applyGravity() {
    // update gravity for each entity (asteroid or space craft) for each planet and sun
    $.each(entities, function (i, entity) {
        $.each(massiveObjects, function (i, planetOrSun) {
            var accelVector = calcAccelDueToGravityVector(planetOrSun, entity);
            entity.velocity.x += accelVector.x;
            entity.velocity.y += accelVector.y;
        });
    });

    // update gravity for each planet orbiting the sun
    $.each(massiveObjects, function (i, planet) {
        if (planet.id !== "sun1" ) {
            var accelVector = calcAccelDueToGravityVector(sun1, planet);
            planet.velocity.x += accelVector.x;
            planet.velocity.y += accelVector.y;
        }
    });
}

function calcAccelDueToGravityVector(otherEntity, entity) {
    var distanceVec = vector(otherEntity, entity);
    var dist = scalarDist(distanceVec);
    var distSqared = Math.pow(dist, 2);
    var accelGrav = (G * otherEntity.mass) / distSqared;

    var deltaVelocity = accelGrav * GAME_INTERVAL;
    //flog("deltaVelocity.1: ", deltaVelocity);
    //accel = accel / 200;
    //flog("deltaVelocity.2: ", deltaVelocity);

    var accelVector = scaleVector(distanceVec, deltaVelocity);
    return accelVector;
}





function doMove(entity, deltaMs) {
    // calc acceleration vector from thrust, direction and mass
    //var accelVec = toVector(entity.directionRads, entity.thrust / entity.mass);

    // consume fuel for thrust
    //flog("doMove: delta=", deltaMs);
    var fueldRequired = entity.thrust * deltaMs / 10;
    if ( fueldRequired > 0 && entity.fuel > fueldRequired) {
        console.log("fuel.2 " +entity.id, entity.fuel, THRUST_RECOVERY_PER_MILLI, deltaMs);
        entity.fuel -= fueldRequired;
        

        var accelVec = {
            x: entity.direction.x * entity.thrust / entity.mass,
            y: entity.direction.y * entity.thrust / entity.mass
        };
        //$("#accelx").text(toDecimal(accelVec.x));
        //$("#accely").text(toDecimal(accelVec.y));

        // update velocity from acceleration
        entity.velocity.x += (accelVec.x * deltaMs);
        entity.velocity.y += (accelVec.y * deltaMs);
    } else {
        console.log("fuel.1 " + entity.id, entity.fuel, THRUST_RECOVERY_PER_MILLI, deltaMs)
        if( entity.fuel < MAX_THRUST_FUEL ) {
            entity.fuel += THRUST_RECOVERY_PER_MILLI * deltaMs;
        }
    }
    


    // update position from velocity
    entity.x += entity.velocity.x;
    entity.y += entity.velocity.y;
    //flog("doMove", entity.x, entity.y);

    if (entity.turnRads) {
        if (entity.turnRads != 0) {
            entity.directionRads += entity.turnRads;
        }
        entity.direction = {
            x: Math.cos(entity.directionRads),
            y: Math.sin(entity.directionRads)
        };
        //flog("new dir", entity.direction.x, entity.direction.y, entity.directionRads);
    }

    // update collisionRegionsMap. Put the entity into the hashed collision regions for better colluision detection performance
    updateCollisionRegions(entity);

}




function initControls(player) {
    flog("initControls");
    var gameDiv = $('#game');

    var centerX = gameWidth / 2;
    var centerY = gameHeight / 2;

    //var centerX = 720;
    //var centerY = 360;

    gameDiv.mousedown(function (e) {
        player.isShooting = true;
    });
    gameDiv.mouseup(function (e) {
        player.isShooting = false;
    });


    gameDiv.mousemove(function (e) {
        var dir = {
            x: e.pageX - centerX,
            y: (e.pageY - centerY)
        };
        //flog("dir", dir, centerX, centerY);
        //flog("mouse",  e.pageX,  e.pageY);

        //var directionRads = radsFromVector(dir) + Math.PI/2;

        //flog(dir, parseInt(directionRads * 180/Math.PI), parseInt(player.directionRads * 180/Math.PI));
        //return;

        player.turnRads = null;
        player.directionRads = radsFromVector(dir) + Math.PI / 2;
        player.direction = {
            x: Math.cos(player.directionRads),
            y: Math.sin(player.directionRads)
        };
    });

    player.keyThrust = keyboard("w", function () {
        //flog("initControls: thrust");
        //player.thrust = KEY_ACCEL;
    });


    player.keyLeft = keyboard("a", function () {
        //flog("initControls: turn left");
        //player.turn(TURN_STEP_DEG;
        //player.velocity.x = player.velocity.x - KEY_ACCEL;
    });

    player.keyRight = keyboard("d", function () {
        //flog("initControls: turn right");
        //player.turn(TURN_STEP_DEG);
        //player.velocity.x = player.velocity.x + KEY_ACCEL;
    });

    player.space = keyboard(" ", function () {
        flog("initControls: shoot");
        mineLassos(player);
    });

    // this is to stop the game, just for debugging
    player.stop = keyboard("x", function () {
        if (stopped) {
            flog("initControls: GOOOO");
            stopped = false;
        } else {
            flog("initControls: STOOOPPPPPP");
            stopped = true;
        }
        //player.turn(TURN_STEP_DEG);
        //player.velocity.x = player.velocity.x + KEY_ACCEL;
    });
}

function keyboard(value, pressHandler) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = pressHandler;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            //flog("key down");
            if (key.isUp && key.press)
                key.press();
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            //flog("key up");
            if (key.isDown && key.release)
                key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
            "keydown", downListener, false
            );
    window.addEventListener(
            "keyup", upListener, false
            );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}
