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
      this._super(me.Entity, 'init', [x, y, settings || {
        image : "gripe_run_right",
        width : 32,
        height : 32
    }]);

  
      // max walking & jumping speed
      this.body.setMaxVelocity(3, 15);
      this.body.setFriction(0.4, 0);
  
      // ensure the player is updated even when outside of the viewport
      this.alwaysUpdate = true;

      this.alive = true;
  
      // define a basic walking animation (using all frames)
      this.renderable.addAnimation("walk",  [0, 1, 2, 3, 4, 5, 6, 7]);
  
      // define a standing animation (using the first frame)
      this.renderable.addAnimation("stand",  [0]);
  
      // set the standing animation as default
      this.renderable.setCurrentAnimation("stand");
    },
    /**
     * update the entity
     */
    update : function (dt) {
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
        me.game.world.addChild(projectile);
    },
  
    /**
     * colision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
      // Make all other objects solid
      if (response.b.body.collisionType !== me.collision.types.PROJECTILE_OBJECT
        && response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
            return false;
      }
      return true;
    },
  });

game.Player.characters = ['Prince', 'Libra', 'Deva', 'Astra'];

/**
 * MainPlayer Entity
 */
game.MainPlayer = game.Player.extend({
    /**
     * constructor
     */
    init : function (x, y, settings) {
      // call the constructor
      this._super(game.Player, 'init', [x, y, settings]);

      this.character = game.Player.characters[Math.floor(Math.random()*game.Player.characters.length)];

      // set the display to follow our position on both axis
      me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);
    },
    /**
     * update the entity
     */
    update : function (dt) {
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
        return (this._super(game.Player, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },
    sendPosition: function() {
        const data = {
            player: {
                name: userName,
                character: this.character,
            },
            x: this.pos.x,
            y: this.pos.y
        };
        console.log("sending", data)
        socket.emit('positionEvent', data);
    },
    sendAttack: function() {
        const data = {
            player: {
                name: userName,
                character: this.character,
            },
            isUltimate: false,
        };
        console.log("sending", data)
        socket.emit('attackEvent', data);
    },
  });