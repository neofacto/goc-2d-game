/**
 * Player Entity
 */
game.Player = me.Entity.extend({
    /**
     * constructor
     */
    init : function (x, y, settings) {
      // call the constructor
    //   this._super(me.Entity, 'init', [x, y, settings]);
    if (settings.character) {
        this.character = settings.character;
        settings.image = game.Player.characters[settings.character];
        settings.width = 64;
        settings.height = 64;
    }

    this._super(me.Entity, 'init', [x, y, settings]);
  
      // max walking & jumping speed
      this.body.setMaxVelocity(4, 15);
      this.body.setFriction(0.4, 0);
  
      // ensure the player is updated even when outside of the viewport
      this.alwaysUpdate = true;

      this.alive = true;
  
      // define a basic walking animation (using all frames)
      this.renderable.addAnimation("walk",  [1, 2, 3, 4, 5, 6]);
  
      // define a standing animation (using the first frame)
      this.renderable.addAnimation("stand",  [0]);
  
      // set the standing animation as default
      this.renderable.setCurrentAnimation("stand");
    },
    /**
     * update the entity
     */
    update : function (dt) {
        if (this.pos.y >= me.levelDirector.getCurrentLevel().height) {
            me.game.world.removeChild(this);
            // send the state
        }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);
  
        // handle collisions against other shapes
        me.collision.check(this);
  
        // return true if we moved or if the renderable was updated
        return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    attack: function() {
        const posX = this.pos.x + (!this.renderable._flip.x ? this.width : 0 - this.width);
        const posY = this.pos.y + this.height/2;
        const projectile = me.pool.pull("projectile", posX, posY, {
            flipped: this.renderable._flip.x
        });
        projectile.attack = {
            player: {
                name: userName,
                character: this.character,
                team: 'team1',
            },
            isUltimate: false,
        };
        me.game.world.addChild(projectile);
    },
  
    /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
      // Make all other objects solid
      if (response.b.body.collisionType === me.collision.types.PROJECTILE_OBJECT && other.attack.player.name !== userName) {
        // send that the player has been touched
        me.game.world.removeChild(other);
      }
      if (response.b.body.collisionType === me.collision.types.WORLD_SHAPE) {
        return true;
      }
      return false;
    },
  });

game.Player.characters = {
    'Prince': 'Personna1',
    'Libra': 'Personna2',
    'Deva': 'Personna3',
    'Astra': 'Personna4'
};

/**
 * MainPlayer Entity
 */
game.MainPlayer = game.Player.extend({
    /**
     * constructor
     */
    init : function (x, y, settings) {
        // const character = character || Object.keys(game.Player.characters)[Math.floor(Math.random() * Object.keys(game.Player.characters).length)];
        // let settingsOverrided = Object.assign({}, settings, {
        //     character: character,
        // });
      // call the constructor
      this._super(game.Player, 'init', [x, y, settings]);

      // set the display to follow our position on both axis
      me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);
    },
    /**
     * update the entity
     */
    update : function (dt) {
        if (!this.alive) false;
        if (me.input.isKeyPressed('left') || leftJoystick.left()) {
            // flip the sprite on horizontal axis
            this.renderable.flipX(true);
            // update the default force
            this.body.force.x = -this.body.maxVel.x;
            // change to the walking animation
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
            this.sendPosition();
        } else if (me.input.isKeyPressed('right') || leftJoystick.right()) {
            // unflip the sprite
            this.renderable.flipX(false);
            // update the entity velocity
            this.body.force.x = this.body.maxVel.x;
            // change to the walking animation
            if (!this.renderable.isCurrentAnimation("walk")) {
                this.renderable.setCurrentAnimation("walk");
            }
            this.sendPosition();
        } else {
            this.body.force.x = 0;
            // change to the standing animation
            this.renderable.setCurrentAnimation("stand");
        }
  
        if (me.input.isKeyPressed('jump')) {
            if (!this.body.jumping && !this.body.falling)
            {
                // set current vel to the maximum defined value
                // gravity will then do the rest
                this.body.force.y = -this.body.maxVel.y
                this.sendPosition();
            }
        } else {
            this.body.force.y = 0;
        }

        if (me.input.isKeyPressed("shoot") && this.character != 'Prince') {
            this.attack();
            this.sendAttack();
        }
  
        // return true if we moved or if the renderable was updated
        return this._super(game.Player, 'update', [dt]);
    },
    onCollision : function (response, other) {
        const result = this._super(game.Player, 'onCollision', [response, other]);
        if (response.b.body.collisionType === me.collision.types.PROJECTILE_OBJECT && other.attack.player.name !== userName) {
            this.sendDamaged(other.attack);
            return false;
        }
        return true;
    },
    sendPosition: function() {
        const data = {
            player: {
                name: userName,
                character: this.character,
                team: 'team1',
            },
            x: this.pos.x,
            y: this.pos.y,
            flippedX: this.renderable._flip.x,
        };
        console.log("sending position", data)
        socket.emit('positionEvent', data);
    },
    sendAttack: function() {
        const data = {
            player: {
                name: userName,
                character: this.character,
                team: 'team1',
            },
            isUltimate: false,
        };
        console.log("sending attack", data)
        socket.emit('attackEvent', data);
    },
    sendDamaged: function(attack) {
        const data = {
            player: {
                name: userName,
                character: this.character,
                team: 'team1',
            },
            attack: attack,
        };
        console.log("sending damaged", data)
        socket.emit('damagedEvent', data);
    },
  });