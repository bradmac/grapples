/* global NUM_PLANETS, RANGE, entities, ASTEROID_G, sun1, asteroidCounter, MAX_ASTEROIDS, PLANET_G, G, BULLET_SPEED, PIXI, container, rocyTexture, THRUST_VAL, TURN_STEP_DEG, bulletCounter, lassos, RADIUS_MULT */


/// asdasd

var ShipEntity = function (id, col, mass, width, height) {
    this.id = id;
    this.lassos = []; // when a bullet hits an entity creates a lasso
    this.isShooting = false;
    this.radius = width / 3;
    this.isEliminated = false;
    this.lastRegionVec = null; // for collisions
    this.collisionRegions = null; // for collisions
    this.bodyDamage = mass;
    this.fuel = MAX_THRUST_FUEL;    // thrust fuel, consumed when using thrusters and auto-restores
    this.mats = 0;  // materials, gained from mining asteroids
    this.sprite = new PIXI.Sprite(rocyTexture);
    this.sprite.x = 0;
    this.sprite.y = 0;
    this.sprite.width = width;
    this.sprite.height = height;
    this.sprite.anchor.set(0.5);
    this.x = 0;
    this.y = 0;
    container.addChild(this.sprite);
    this.circle = new PIXI.Graphics();
    this.circle.beginFill(0xFFFFFF);
    this.circle.drawCircle(0, 0, 2);
    this.circle.endFill();
    this.circle.beginFill(0xFFFFFF);
    this.circle.drawRect(0, 0, 5, 5);
    this.circle.endFill();
    container.addChild(this.circle);
    this.direction = {
        x: 0,
        y: 1
    };
    this.directionRads = Math.atan(this.direction.x / this.direction.y);
    this.width = width;
    this.height = height;
    this.mass = mass;
    this.thrust = 0;
    this.color = col;
    this.velocity = {
        x: 0,
        y: 1
    };
    this.shootTimer = 0;
    this.eliminated = function () {
        container.removeChild(this.sprite);
        stopped = true;
    };
    this.draw = function () {
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.circle.x = this.x;
        this.circle.y = this.y;
        this.sprite.rotation = this.directionRads - Math.PI / 2;
        if (this.lasso) {

        }
        //flog("draw", this.sprite.x, this.sprite.y);
    };
    this.move = function (delta) {
        doMove(this, delta);
    };
    this.doControls = function () {
        //flog("doControls", this.keyLeft.isDown, this.keyRight.isDown);
        if (this.keyThrust) {
            if (this.keyThrust.isDown) {
                this.thrust = THRUST_VAL;
            } else {
                this.thrust = 0;
            }
            //flog("doControls", this.keyLeft.isDown, this.keyRight.isDown);
            if (this.keyLeft.isDown) {
                this.turn(TURN_STEP_DEG * -1);
            } else if (this.keyRight.isDown) {
                this.turn(TURN_STEP_DEG);
            } else {
                this.turn(0);
            }
            if (this.isShooting) {
                if (this.shootTimer === 0) {
                    this.shoot();
                }
                if (this.shootTimer++ > 3) {
                    this.shootTimer = 0;
                }
            } else {
                this.shootTimer = 0;
            }
        }

    };
    this.takeDamage = function (entity) {
        this.damage += entity.bodyDamage;
        if (this.damage > this.mass) {
            if (entity.sourceEntity && !entity.sourceEntity.isEliminated) {
                flog(this.id, " destroyed by damage from", entity.sourceEntity.id);
                entity.sourceEntity.fuel += entity.mass;
            } else {
                flog(this.id, " destroyed by damage");
            }
            eliminate(this);

        } else {
            flog(this.id, " taken damage, damage=", this.damage, "mass=", this.mass);
        }
    };
    this.shoot = function () {
        var bullet = new PlanetEntity("bullet-" + bulletCounter++, 0xFF0000, 10, 10);
        bullet.lifeTime = 50;
        //flog("shoot", bullet);
        var relativeVelocity = {
            x: this.direction.x * BULLET_SPEED,
            y: this.direction.y * BULLET_SPEED
        };
        bullet.velocity = {
            x: this.velocity.x + relativeVelocity.x,
            y: this.velocity.y + relativeVelocity.y
        };
        bullet.x = this.x + relativeVelocity.x * 4;
        bullet.y = this.y + relativeVelocity.y * 4;
        bullet.sourceEntity = this;
        bullet.bodyDamage = 400;
        this.fuel -= bullet.bodyDamage / 5;
        entities.push(bullet);
    };
    this.stop = function () {
        this.velocity = {
            x: 0,
            y: 0
        };
    };
    this.turn = function (rads) {
        this.turnRads = rads;
        //this.directionRads += rads;
    };
    this.collideWith = function (entity) {
        this.fuel += entity.mass;
        this.damage += entity.mass;
        flog("new fuel=", this.fuel);
    };
};


var PlanetEntity = function (id, col, mass) {
    this.id = id;
    this.lassos = []; // when a bullet hits an entity creates a lasso
    this.lifeTime = null;
    this.lastRegionVec = null; // for collisions
    this.collisionRegions = null; // for collisions
    this.damage = 0;
    this.bodyDamage = 0; // this is how much damange the entity does when hiting something else
    this.sourceEntity = null; // if this is a bullet, will be a reference to who fired it
    this.isEliminated = false;
    this.x = 0;
    this.y = 0;
    var radius = calcRadiusFromMass(mass);
    this.radius = radius;
    this.width = radius;
    this.height = radius;
    this.mass = mass;
    this.color = col;
    this.circle = new PIXI.Graphics();
    this.circle.beginFill(col);
    this.circle.drawCircle(0, 0, radius);
    //  flog("Draw planet", this.id, this.radius);
    this.circle.endFill();
    container.addChild(this.circle);
    this.velocity = {
        x: 0,
        y: 0
    };
    this.eliminated = function () {
        this.circle.clear();
        container.removeChild(this.circle);
    };
    this.draw = function () {
        this.circle.x = this.x;
        this.circle.y = this.y;
    };
    this.move = function (delta) {
        if (this.lifeTime !== null) {
            this.lifeTime--;
            //flog("bullet", this.id, this.lifeTime);
            if (this.lifeTime <= 0) {
                eliminate(this);
            }
        }
        doMove(this, delta);
    };
    this.setColor = function (newColor) {
        this.color = newColor;
        this.circle.color = newColor;
        this.circle.beginFill(newColor);
        this.circle.drawCircle(this.xx, this.yy, this.radius);
        this.circle.endFill();
    };
    this.takeDamage = function (entity) {
        if (this.id.startsWith("asteroid")) {
            this.damage += entity.bodyDamage;
            if (this.damage >= this.mass) {
                if (entity.sourceEntity && !entity.sourceEntity.isEliminated) {
                    flog(this.id, " destroyed by damage from", entity.sourceEntity.id);
                    entity.sourceEntity.fuel += entity.mass;
                } else {
                    flog(this.id, " destroyed by damage");
                }
                eliminate(this);

            } else {
                flog(this.id, " taken damage, damage=", this.damage, "mass=", this.mass);
            }
        }
    };
    this.collideWith = function (entity) {
        //flog("asteroid collision, id=", this.id, " initial mass=", this.mass);
        //flog("asteroid collided with, id=", entity.id, " initial mass=", entity.mass);
        flog("collideWith: check lasso");
        if (entity.sourceEntity) { // entity is a bullet
            flog("collideWith: make lasso.1");
            makeLasso(entity.sourceEntity, this);
            entity.takeDamage(this);
        } else if (this.sourceEntity) { // this is a bullet, make a lasso 
            flog("collideWith: make lasso.2");
            makeLasso(this.sourceEntity, entity);
            this.takeDamage(entity);
        } else if (entity.bodyDamage > 0) {
            flog("collideWith: entity has body damanger", entity);
            this.takeDamage(entity);
            entity.takeDamage(this);
        } else {
            this.mass = this.mass + entity.mass;
            flog("collideWith: asteroid collision, id=", this.id, " new asteroid mass=", this.mass);
            //this.radius = this.mass / 40;
            this.radius = calcRadiusFromMass(mass);
            this.width = radius;
            this.height = radius;
            if (this.radius > 50) {
                //this.radius = 50; // lets not get too crazy
            }
            flog("asteroid collision, new radius=", this.radius);
            this.circle.clear();
            this.circle.radius = this.radius;
            this.circle.beginFill(this.color);
            this.circle.drawCircle(0, 0, this.radius);
            this.circle.endFill();

        }
    };
};

function calcRadiusFromMass(mass) {
    var r = RADIUS_MULT * Math.cbrt(mass);
    if( r < 10 ) {
        r = 10;
    }
    return r;
}

function makeLasso(entity1, entity2) {
    flog("makeLasso", entity1, entity2);
    var line = new PIXI.Graphics();

    var lasso = {
        isLost: false, // set to true when replaced by another
        entity1: entity1,
        entity2: entity2,
        length: 200, // at this length the lasso has no force. todo, should be length of initial distance
        draw: function () {
            line.clear();
            if (this.isLost || entity1.isEliminated || entity2.isEliminated) {
                flog("lasso entity has been eliminated", entity1, entity2);
                var index = lassos.indexOf(this);
                if (index > -1) {
                    lassos.splice(index, 1);
                } else {
                    flog("couldnt find lasso to remove", this);
                }
            } else {
                line.position.set(entity1.x, entity1.y);
                var relX = entity2.x - entity1.x;
                var relY = entity2.y - entity1.y;
                line.lineStyle(1, 0xffffff)
                        .moveTo(0, 0)
                        .lineTo(relX, relY);
            }
        },
        line: line
    };
    if (entity1.lasso) {
        entity1.lasso.isLost = true;
    }
    entity1.lassos.push(lasso);
    entity2.lassos.push(lasso);

    lassos.push(lasso);
    container.addChild(lasso.line);

    var relX = entity2.x - entity1.x;
    var relY = entity2.y - entity1.y;
    lasso.line.position.set(entity1.x, entity1.y);

    lasso.line.lineStyle(1, 0xffffff)
            .moveTo(0, 0)
            .lineTo(relX, relY);
    flog("makeLasso: done", entity1, entity2);
}



/**
 * Called when the player hits space bar, all current lassos are removed, and any attached entities
 * that can be mined are mined (ie added to materials)
 * 
 * @returns {undefined}
 */
function mineLassos(player) {
    $.each(lassos, function (i, lasso) {
        if (lasso) {
            if (lasso.entity1 == player) {
                flog("mineLassos: mining lasso ");
                lasso.isLost = true;
                if (lasso.entity2.id.startsWith("asteroid")) {
                    lasso.entity1.mats += lasso.entity2.mass;
                    lasso.entity2.eliminated();
                    flog("mineLassos: mining asteroid ", lasso.entity2.id, lasso.entity1.mats);
                } else {
                    flog("Not an asteroid: ", lasso.entity2.id);
                }
            }
        }
    });
}


function createAsteroids(num) {
    if (entities.length > MAX_ASTEROIDS) {
        return;
    }

    for (var i = 0; i < num; i++) {
        var x = (Math.floor((Math.random() * RANGE)) - RANGE / 2);
        var y = (Math.floor((Math.random() * RANGE)) - RANGE / 2);

        var asteroid = new PlanetEntity("asteroid-" + asteroidCounter++, 0xC70039, 200);
        asteroid.x = x;
        asteroid.y = y;
        var distance = scalarDist({
            x: x,
            y: y
        });
        var directionRads = Math.atan(asteroid.x / asteroid.y) + Math.PI / 2;
        var speed = Math.sqrt(G * sun1.mass / distance) * 1.2;
        asteroid.velocity = toVector(directionRads + Math.PI / 2, speed);
        //flog("asteroid: dir=", directionRads, " speed=", speed, " ==> ", asteroid.velocity);
        entities.push(asteroid);
    }
}

function createPlanet(n) {
    var orbitSize = RANGE / NUM_PLANETS;
    var x = orbitSize * n + (Math.random() * orbitSize);
    var y = 0;
    var p = new PlanetEntity("planet-" + n, 0x52ff33, 4000000);
    p.x = x;
    p.y = y;
    var distance = scalarDist({
        x: x,
        y: y
    });
    var directionRads = Math.atan(p.x / p.y) + Math.PI / 2; // need to add 90deg
    var speed = Math.sqrt(G * sun1.mass / distance) * 1.2;
    p.velocity = toVector(directionRads, speed);
    return p;
}
