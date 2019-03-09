
/* Game namespace */
var game = {

    // an object where to store game information
    data : {
        // score
        score : 0
    },


    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init(window.screen.availWidth, window.screen.availHeight, {wrapper : "screen", scale : "auto"})) {
        // if (!me.video.init(1890, 1080, {wrapper : "screen", scale : "auto"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("mp3,ogg");

        // set and load all resources.
        // (this will also automatically switch to the loading screen)
        me.loader.preload(game.resources, this.loaded.bind(this));
    },

    // Run on game resources loaded.
    "loaded" : function () {
        // set the "Play/Ingame" Screen Object
        me.state.set(me.state.PLAY, new game.PlayScreen());

        // register our player entity in the object pool
        me.pool.register("mainPlayer", game.MainPlayer);
        me.pool.register("player", game.Player);
        me.pool.register("projectile", game.Projectile);

        // enable the keyboard
        me.input.bindKey(me.input.KEY.LEFT,  "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        // map X, Up Arrow and Space for jump
        // me.input.bindKey(me.input.KEY.X,      "jump", true);
        me.input.bindKey(me.input.KEY.UP,     "jump", true);
        me.input.bindKey(me.input.KEY.SPACE, "shoot", true);

        // start the game
        me.state.change(me.state.PLAY);

        // if (me.device.hasFullscreenSupport) {
        //     me.device.requestFullscreen();
        // }
    }
};