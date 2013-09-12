if (console === undefined) {
    var console = {
        log: function () {}
    }
}

var LocalStorage = {
    client_id: undefined,
//    $.removeCookie('game_session');
    get_clientId: function () {
        if (this.client_id === undefined) {
            this.client_id = $.cookie('client_id');
        }
        return this.client_id;
    },

    set_clientId: function (id) {
        this.client_id = id;
        $.cookie('client_id', id, { expires: 7 });
    }
};

var socket = io.connect('http://localhost:3000');

socket.on('connect', function (data) {
    console.log('connect - sending routeClient');
    socket.emit('routeClient', {id: LocalStorage.get_clientId()});
});

socket.on('setClientId', function (data) {
    console.log('setClientId received from server - new id: ' + data);
    LocalStorage.set_clientId(data);
});


// Methods to communicate with the server
var Server = {
    setClientName: function (name, callback) {
        console.log('setClientName call to server');
        socket.emit('setClientName', {
            id: LocalStorage.get_clientId(),
            name: name
        }, callback);
    },
    newGame: function (name, playerCount, callback) {
        console.log('newGame call to server');
        socket.emit('newGame', {
            'name': name,
            'playerCount': playerCount
        }, callback);
    },
    subscribeGameList: function (callback) {
        console.log('subscribeGameList call to server');
        socket.emit('subscribeGameList', null, callback);
    },
    unsubscribeGameList: function (callback) {
        console.log('unsubscribeGameList call to server');
        socket.emit('unsubscribeGameList', null, callback);
    },
    listGames: function (callback) {
        console.log('listGames call to server');
        socket.emit('listGames', null, callback);
    },
    joinGame: function (game, callback) {
        console.log('joinGame call to server');
        socket.emit('joinGame', game, callback);
    }
}


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

        var show_fifth_cards = function () {
            player1.one('#player1_slot5').setStyle('display', 'block');
            player2.one('#player2_slot5').setStyle('display', 'block');
            player3.one('#player3_slot5').setStyle('display', 'block');
        };
        var hide_fifth_cards = function () {
            player1.one('#player1_slot5').setStyle('display', 'none');
            player2.one('#player2_slot5').setStyle('display', 'none');
            player3.one('#player3_slot5').setStyle('display', 'none');
        };

        // 2 player game, only Player 2 visible, top center of screen
        if (playerCount === 2) {
            show_fifth_cards();
            position_topMiddle(player2);
            player3.setStyle('display', 'none');
            player4.setStyle('display', 'none');
            player5.setStyle('display', 'none');
        }

        // 3 player game, only Player 2 and 3 visible, top left and right of screen
        if (playerCount === 3) {
            show_fifth_cards();
            position_topLeft(player2);
            position_topRight(player3);
            hide_pane(player4);
            hide_pane(player5);
        }

        // 4 player game, only Player 2, 3 and 4 visible, top center, left and right
        if (playerCount === 4) {
            hide_fifth_cards();
            position_left(player2);
            position_topMiddle(player3);
            position_right(player4);
            hide_pane(player5);
        }

        // 5 player game, all Players visible, all positions
        if (playerCount === 5) {
            hide_fifth_cards();
            position_left(player2);
            position_topLeft(player3);
            position_topRight(player4);
            position_right(player5);
        }
        
        // Player 1 always visible at bottom center of screen
        position_bottomMiddle(player1);
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
        var hide_all_panes = function () {
            Y.all('.panel').setStyle('display', 'none');
        };

        // Events from server
        socket.on('gotoSplash', function (data) {
            hide_all_panes();
            show_pane(splash);
        });

        socket.on('gotoGame', function (data) {
            hide_all_panes();
        });

        splash.one('#splash_new_game').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            hide_pane(splash);
            show_pane(newgame);
        });

        // Game events from server
        socket.on('gameReady', function (data) {
        });
        socket.on('takeTurn', function (data) {
        });
        socket.on('cardDrawn', function (data) {
        });
        socket.on('cardPlayed', function (data) {
        });
        socket.on('clueGiven', function (data) {
        });
        socket.on('cardDiscarded', function (data) {
        });
        socket.on('clueUsed', function (data) {
        });
        socket.on('clueRestored', function (data) {
        });
        socket.on('lifeLost', function (data) {
        });
        socket.on('enterEndgame', function (data) {
        });
        socket.on('deckExhausted', function (data) {
        });

        // Updates the game list display
        socket.on('gameCreated', function (data) {
        });
        socket.on('gameStarted', function (data) {
        });
        socket.on('gameEnded', function (data) {
        });
        splash.one('#splash_join_game').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            hide_pane(splash);
            Server.listGames(function (list) {
                console.log('retrieved list of games from server:');
                console.log(JSON.stringify(list));
                var table = gamelist.one('table');
                var gameIdField = gamelist.one('#game_list_id');
                for (var i = 0; i < list.length; i++) {
                    (function () {
                        var item = list[i];
                        var id = Y.Node.create('<td>' + item.id + '</td>');
                        var name = Y.Node.create('<td>' + item.name + '</td>');
                        var count = Y.Node.create('<td>' + item.playerCount + '</td>');
                        var state = Y.Node.create('<td>' + item.state + '</td>');
                        var newnode = Y.Node.create('<tr />');
                        newnode.appendChild(id);
                        newnode.appendChild(name);
                        newnode.appendChild(count);
                        newnode.appendChild(state);
                        newnode.on('click', function (e) {
                            table.all('tr').removeClass('highlighted');
                            newnode.addClass('highlighted');
                            gameIdField.set('value', item.id);
                        });
                        table.appendChild(newnode);
                    })();
                }
            });
            // Subscribe to list events to see changes
            Server.subscribeGameList();
            show_pane(gamelist);
        });

        newgame.one('#new_game_cancel').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            hide_pane(newgame);
            show_pane(splash);
        });
        newgame.one('#new_game_create').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            // TODO trigger game creation (after field check)
            // Then jump to game in progress
            var name = Y.one('#new_game_name').get('value');
            var players = Y.one("#new_game_players").get('selectedIndex') + 2;
            console.log('name: ' + name + ', players: ' + players);
            Server.newGame(name, players, function (result) {
                console.log('newGame result: ' + JSON.stringify(result));
                if (typeof result === 'object') {
                    Server.joinGame(result, function (result) {
                        // TODO implement joinGame
                        console.log('joinGame result: ' + JSON.stringify(result));
                        if (result === undefined) {
                            hide_pane(newgame);
                        } else {
                            console.log('Error: joinGame call failed with: ' + JSON.stringify(result));
                            // Error + back to splash
                        }
                    });
                } else {
                    console.log('Error: newGame call failed with: ' + JSON.stringify(result));
                    // Error + back to new game
                }
            });
        });

        gamelist.one('#game_list_cancel').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            Server.unsubscribeGameList();
            hide_pane(gamelist);
            show_pane(splash);
        });
        gamelist.one('#game_list_join').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            // TODO attempt to join game in question
            // Then jump to game in progress
            // TODO select game from list (GameListing object)
            var selectedGame = gamelist.one('#game_list_id').get('value');
            Server.joinGame({id: selectedGame}, function (result) {
                console.log('joinGame result: ' + JSON.stringify(result));
                if (result === undefined) {
                    Server.unsubscribeGameList();
                    hide_pane(gamelist);
                } else {
                    // Error + back to game listing
                    console.log('Error: joinGame call failed with: ' + JSON.stringify(result));
                }
            });
        });

        quit.on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            // TODO - end game in progress (leave if necessary)
            show_pane(splash);
        });

        about.on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            var pane = Y.one('#panel_about');
            show_pane(pane);
            pane.one('#panel_about_close').on('click', function(e) {
                hide_pane(pane);
                e.preventDefault();
                e.stopPropagation();
            });
        });

        rules.on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            var pane = Y.one('#panel_rules');
            show_pane(pane);
            pane.one('#panel_rules_close').on('click', function(e) {
                hide_pane(pane);
            });
        });

        Y.on('windowresize', function () {
            layout(3);
        });

        show_pane(splash);
        layout(5);
    });
});

