var socket = io.connect('http://localhost:3000');

socket.on('connect', function (data) {
    socket.emit('routeMe', $.cookie('game_session'));
});

socket.on('setGameSessionCookie', function (data) {
    $.cookie('game_session', data, { expires: 7});
});

socket.on('clearGameSessionCookie', function (data) {
    $.removeCookie('game_session');
});

var server_new_game = function (name, playerCount) {
    socket.emit('newGame', {
        'name': name,
        'player_count': playerCount
    });
};


// Position game board elements based on count of players and current window size
// Called whenever the window is resized
var layout = function (playerCount) {
    YUI().use('node', function (Y) {
        var width = $(window).width();
        var height = $(window).height();

        var gameboard = Y.one('#gameboard');

        var player1 = gameboard.one('#player1');
        var player2 = gameboard.one('#player2');
        var player3 = gameboard.one('#player3');
        var player4 = gameboard.one('#player4');
        var player5 = gameboard.one('#player5');
        var fireworks = gameboard.one('#fireworks');
        var clues = gameboard.one('#clues');
        var lives = gameboard.one('#lives');
        var draw = gameboard.one('#draw');
        var discard = gameboard.one('#discard');
        var board = gameboard.one('#board');

        // Set size of cards/slots relative to screen size
        var tileSize = Math.min(width/10, height/8);

        var position_bottomMiddle = function (pane) {
            pane.setStyle('display', 'block');
            pane.addClass('horizontal');
            pane.setY(height / 8 * 7 - parseInt(pane.getComputedStyle('height'), 10) / 2);
            pane.setX(width / 2 - parseInt(pane.getComputedStyle('width'), 10) / 2);
        };

        var position_topLeft = function (pane) {
            pane.setStyle('display', 'block');
            pane.addClass('horizontal');
            pane.setY(height / 8 - parseInt(pane.getComputedStyle('height'), 10) / 2);
            pane.setX(width / 4 - parseInt(pane.getComputedStyle('width'), 10) / 2);
        };

        var position_topRight = function (pane) {
            pane.setStyle('display', 'block');
            pane.addClass('horizontal');
            pane.setY(height / 8 - parseInt(pane.getComputedStyle('height'), 10) / 2);
            pane.setX(width / 4 * 3 - parseInt(pane.getComputedStyle('width'), 10) / 2);
        };

        var position_topMiddle = function (pane) {
            pane.setStyle('display', 'block');
            pane.addClass('horizontal');
            pane.setY(height / 8 - parseInt(pane.getComputedStyle('height'), 10) / 2);
            pane.setX(width / 2 - parseInt(pane.getComputedStyle('width'), 10) / 2);
        };

        var position_left = function (pane) {
            pane.setStyle('display', 'block');
            pane.addClass('vertical');
            pane.setY(height / 8 * 5 - parseInt(pane.getComputedStyle('height'), 10) / 2);
            pane.setX(width / 8 - parseInt(pane.getComputedStyle('width'), 10) / 2);
        };

        var position_right = function (pane) {
            pane.setStyle('display', 'block');
            pane.addClass('vertical');
            pane.setY(height / 8 * 5 - parseInt(pane.getComputedStyle('height'), 10) / 2);
            pane.setX(width / 8 * 7 - parseInt(pane.getComputedStyle('width'), 10) / 2);
        };

        var hide_pane = function (pane) {
            pane.setStyle('display', 'none');
        };

        gameboard.all('div.slot, div.card').setStyles({'width': tileSize + 'px', 'height': tileSize + 'px'});
        gameboard.all('div.token').setStyles({'width': tileSize / 4 + 'px', 'height': tileSize / 4 + 'px'});

        // Set position of elements (this depends on the slot size having been set already)

        // Position game element containers
        board.setX(width / 2 - parseInt(board.getComputedStyle('width'), 10) / 2);
        board.setY(height / 2 - parseInt(board.getComputedStyle('height'), 10) / 2);

        // Player 1 always visible at bottom center of screen
        position_bottomMiddle(player1);

        // 2 player game, only Player 2 visible, top center of screen
        if (playerCount === 2) {
            position_topMiddle(player2);
            player3.setStyle('display', 'none');
            player4.setStyle('display', 'none');
            player5.setStyle('display', 'none');
        }

        // 3 player game, only Player 2 and 3 visible, top left and right of screen
        if (playerCount === 3) {
            position_topLeft(player2);
            position_topRight(player3);
            hide_pane(player4);
            hide_pane(player5);
        }

        // 4 player game, only Player 2, 3 and 4 visible, top center, left and right
        if (playerCount === 4) {
            position_left(player2);
            position_topMiddle(player3);
            position_right(player4);
            hide_pane(player5);
        }

        // 5 player game, all Players visible, all positions
        if (playerCount === 5) {
            position_left(player2);
            position_topLeft(player3);
            position_topRight(player4);
            position_right(player5);
        }
        
    });
};

YUI().use('event-base', 'event-resize', 'node', function (Y) {
    Y.on('domready', function () {

        var splash = Y.one('#splash');
        var newgame = Y.one('#new_game');
        var gamelist = Y.one('#game_list');
        var quit = Y.one('#menu_quit');
        var rules = Y.one('#menu_rules');
        var about = Y.one('#menu_about');

        splash.setStyle('display', 'block');

        var show_pane = function (pane) {
            var width = $(window).width();
            var height = $(window).height();
            pane.setStyle('display', 'block');
            pane.setY(height / 2 - parseInt(pane.getComputedStyle('height'), 10) / 2);
            pane.setX(width / 2 - parseInt(pane.getComputedStyle('width'), 10) / 2);
        };

        var hide_pane = function (pane) {
            pane.setStyle('display', 'none');
        };

        splash.one('#splash_new_game').on('click', function(e) {
            hide_pane(splash);
            show_pane(newgame);
            e.preventDefault();
            e.stopPropagation();
        });

        splash.one('#splash_join_game').on('click', function(e) {
            hide_pane(splash);
            show_pane(gamelist);
            // TODO Subscribe to game list events
            e.preventDefault();
            e.stopPropagation();
        });

        newgame.one('#new_game_cancel').on('click', function(e) {
            hide_pane(newgame);
            show_pane(splash);
            e.preventDefault();
            e.stopPropagation();
        });
        newgame.one('#new_game_create').on('click', function(e) {
            // TODO trigger game creation (after field check)
            // Then jump to game in progress
            hide_pane(newgame);
            e.preventDefault();
            e.stopPropagation();
        });

        gamelist.one('#game_list_cancel').on('click', function(e) {
            hide_pane(gamelist);
            show_pane(splash);
            e.preventDefault();
            e.stopPropagation();
        });
        gamelist.one('#game_list_join').on('click', function(e) {
            // TODO attempt to join game in question
            // Then jump to game in progress
            // Unsubscribe from game list events
            hide_pane(gamelist);
            e.preventDefault();
            e.stopPropagation();
        });

        quit.on('click', function(e) {
            // TODO - end game in progress (leave if necessary)
            show_pane(splash);
            e.preventDefault();
            e.stopPropagation();
        });

        about.on('click', function(e) {
            var pane = Y.one('#panel_about');
            show_pane(pane);
            pane.one('#panel_about_close').on('click', function(e) {
                hide_pane(pane);
                e.preventDefault();
                e.stopPropagation();
            });
            e.preventDefault();
            e.stopPropagation();
        });

        rules.on('click', function(e) {
            var pane = Y.one('#panel_rules');
            show_pane(pane);
            pane.one('#panel_rules_close').on('click', function(e) {
                hide_pane(pane);
                e.preventDefault();
                e.stopPropagation();
            });
            e.preventDefault();
            e.stopPropagation();
        });

        Y.on('windowresize', function () {
            layout(3);
        });

        show_pane(splash);
        layout(5);
    });
});

