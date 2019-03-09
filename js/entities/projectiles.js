game.Projectile = me.Entity.extend({
  init : function (x, y, settings) {
      this.isFlipped = settings.flipped;
      this._super(me.Entity, "init", [x, y, { width: game.Projectile.width, height: game.Projectile.height }]);
      this.z = 5;
      this.body.setVelocity(50, 0);
      this.body.collisionType = me.collision.types.PROJECTILE_OBJECT;
      this.renderable = new (me.Renderable.extend({
          init : function () {
              this._super(me.Renderable, "init", [0, 0, game.Projectile.width, game.Projectile.height]);
          },
          destroy : function () {},
          draw : function (renderer) {
              var color = renderer.getColor();
              renderer.setColor('#5EFF7E');
              renderer.fillRect(0, 0, this.width, this.height);
              renderer.setColor(color);
          }
      }));
      this.alwaysUpdate = true;
  },

  update : function (time) {
      if (this.isFlipped) {
        this.body.vel.x -= this.body.accel.x * time / 1000;
      } else {
        this.body.vel.x += this.body.accel.x * time / 1000;
      }
      if (this.pos.x + this.width <= 0 && this.pos.x + this.width >= me.levelDirector.getCurrentLevel().width) {
          me.game.world.removeChild(this);
      }

      this.body.update();
      me.collision.check(this);

      return true;
  }
});

game.Projectile.width = 28;
game.Projectile.height = 5;