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

var hostname = 'http://' + document.location.hostname + ':3000';
console.log('socket.io connecting to: ' + hostname);
var socket = io.connect(hostname);

socket.on('connect', function (data) {
    console.log('connect - sending routeClient');
    //socket.emit('routeClient', {id: LocalStorage.get_clientId()});
    // For testing purposes just get a new ID each time, avoids needing to delete cookies
    socket.emit('routeClient', {id: null});
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
    },
    playCard: function (playerIndex, cardIndex, callback) {
        console.log('playCard call to server');
        socket.emit('playCard', {playerIndex: playerIndex, cardIndex: cardIndex}, callback);
    },
    discardCard: function (playerIndex, cardIndex, callback) {
        console.log('discardCard call to server');
        socket.emit('discardCard', {playerIndex: playerIndex, cardIndex: cardIndex}, callback);
    },
    giveClue: function (toPlayerIndex, clue, callback) {
        console.log('giveClue call to server');
        socket.emit('giveClue', {toPlayerIndex: toPlayerIndex, clue: clue}, callback);
    }
}

var Card = function (div, data, index) {
    this.div = div;
    this.data = data;
    this.index = index;
};

var Game = {
    id: null,
    clues: 9,
    lives: 3,
    cards: {
        players: [[], [], [], [], []],
        fireworks: {
            red: [],
            blue: [],
            green: [],
            yellow: [],
            white: []
        },
        discard: []
    },
    playerCount: 5,
    yourTurn: false
};


// Position game board elements based on count of players and current window size
// Called whenever the window is resized
var layout = function () {
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
        var tileSize = Math.floor(Math.min(width/10, height/8));

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

        gameboard.all('div.slot, div.card').setStyles(
            {'width': tileSize + 'px', 'height': tileSize + 'px',
            'lineHeight': tileSize + 'px', 'fontSize': Math.floor(tileSize * 0.6) + 'px'});
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
        if (Game.playerCount === 2) {
            show_fifth_cards();
            position_topMiddle(player2);
            player3.setStyle('display', 'none');
            player4.setStyle('display', 'none');
            player5.setStyle('display', 'none');
        }

        // 3 player game, only Player 2 and 3 visible, top left and right of screen
        if (Game.playerCount === 3) {
            show_fifth_cards();
            position_topLeft(player2);
            position_topRight(player3);
            hide_pane(player4);
            hide_pane(player5);
        }

        // 4 player game, only Player 2, 3 and 4 visible, top center, left and right
        if (Game.playerCount === 4) {
            hide_fifth_cards();
            position_left(player2);
            position_topMiddle(player3);
            position_right(player4);
            hide_pane(player5);
        }

        // 5 player game, all Players visible, all positions
        if (Game.playerCount === 5) {
            hide_fifth_cards();
            position_left(player2);
            position_topLeft(player3);
            position_topRight(player4);
            position_right(player5);
        }
        
        // Player 1 always visible at bottom center of screen
        position_bottomMiddle(player1);

        // Now set position of all the cards using computed position of slots

        var slot, card;
        for (var p = 0; p < Game.playerCount; p++) {
            for (var i = 0; i < Game.cards.players[0].length; i++) {
                card = Game.cards.players[p][i];
                if (card !== undefined) {
                    var slotId = ('#player' + (p + 1) + '_slot' + (i + 1));
                    slot = Y.one(slotId);
                    if (slot !== null) {
                        card.div.setY(slot.getY());
                        card.div.setX(slot.getX());
                        card.div.setStyle('zIndex', '10');
                    }
                }
            }
        }
        for (var i = 0; i < Game.cards.discard.length; i++) {
            card = Game.cards.discard[i];
            if (card !== undefined) {
                slot = Y.one('#discard');
                if (slot !== null) {
                    card.div.setY(slot.getY());
                    card.div.setX(slot.getX());
                    card.div.setStyle('zIndex', '' + (i + 10));
                }
            }
        }
        var colours = ['red', 'blue', 'green', 'yellow', 'white'], colour;
        for (var c = 0; c < colours.length; c++) {
            colour = colours[c];
            for (var i = 0; i < Game.cards.fireworks[colour].length; i++) {
                card = Game.cards.fireworks[colour][i];
                if (card !== undefined) {
                    slot = Y.one('#firework_' + colour);
                    if (slot !== null) {
                        card.div.setY(slot.getY());
                        card.div.setX(slot.getX());
                        card.div.setStyle('zIndex', '' + (i + 10));
                    }
                }
            }
        }

        // Render clue/life tokens
        for (var i = 9; i > Game.clues; i--) {
            clues.one('#clue_token_' + i).addClass('flipped');
        }
        for (var i = 3; i > Game.lives; i--) {
            lives.one('#life_token_' + i).addClass('flipped');
        }
    });
};

YUI().use('event-base', 'event-resize', 'node', function (Y) {
    Y.on('domready', function () {

        var splash = Y.one('#splash');
        var newgame = Y.one('#new_game');
        var gamelist = Y.one('#game_list');
        var waiting = Y.one('#waiting_for_players');
        var quit = Y.one('#menu_quit');
        var rules = Y.one('#menu_rules');
        var about = Y.one('#menu_about');
        var playordiscard = Y.one('#playordiscard');
        var giveclue = Y.one('#giveclue');

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
        var set_waiting = function () {
            waiting.one('h1').set('text', 'Waiting for players...');
        };
        var set_joining = function () {
            waiting.one('h1').set('text', 'Joining game...');
        };
        var set_creating = function () {
            waiting.one('h1').set('text', 'Creating game...');
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
            // Hide waiting for players panel
            // TODO - gameReady should send number of players to update game board layout
            Game.playerCount = data.playerCount;
            Game.lives = data.lifetokens.lives;
            Game.clues = data.cluetokens.clues;
            Y.one('#draw').removeClass('empty');
            console.log('gameReady received from server');
            hide_pane(waiting);
        });
        socket.on('takeTurn', function (data) {
            console.log('takeTurn received from server');
            // Display message indicating turn
            // TODO do this for all players, add playerIndex to takeTurn event
            Y.one('#player1').addClass('highlighted');
            Game.yourTurn = true;
        });

        var addCard = function (playerIndex, cardIndex, cardData) {
            var cardsContainer = Y.one('#cards');
            var cardDiv = Y.Node.create('<div>?</div>');
            cardDiv.addClass('card');
            if (cardData.colour !== null) cardDiv.addClass(cardData.colour);
            if (cardData.value !== null) cardDiv.set('text', '' + cardData.value);
            cardsContainer.appendChild(cardDiv);
            var card = new Card(cardDiv, cardData, cardIndex);
            // Wire up events on this card
            cardDiv.on('click', function (e) {
                hide_pane(playordiscard);
                hide_pane(giveclue);
                e.preventDefault();
                playordiscard.one('#playordiscard_play').detachAll();
                playordiscard.one('#playordiscard_discard').detachAll();
                giveclue.one('#giveclue_value').detachAll();
                giveclue.one('#giveclue_colour').detachAll();
                if (!Game.yourTurn) {
                    return;
                }
                if (playerIndex === 0) {
                    // Your card, options are discard or play
                    playordiscard.one('#playordiscard_play').on('click', function (e) {
                        e.preventDefault();
                        hide_pane(playordiscard);
                        Server.playCard(playerIndex, card.index, function (result) {
                            console.log('playCard result: ' + JSON.stringify(result));
                        });
                    });
                    playordiscard.one('#playordiscard_discard').on('click', function (e) {
                        e.preventDefault();
                        hide_pane(playordiscard);
                        Server.discardCard(playerIndex, card.index, function (result) {
                            console.log('discardCard result: ' + JSON.stringify(result));
                        });
                    });
                    playordiscard.one('#playordiscard_cancel').on('click', function (e) {
                        e.preventDefault();
                        hide_pane(playordiscard);
                    });
                    show_pane(playordiscard);
                } else {
                    // Another player's card, option is give clue
                    giveclue.one('#giveclue_value').on('click', function (e) {
                        e.preventDefault();
                        hide_pane(giveclue);
                        Server.giveClue(playerIndex, card.data.value, function (result) {
                            console.log('giveClue result: ' + JSON.stringify(result));
                        });
                    });
                    giveclue.one('#giveclue_colour').on('click', function (e) {
                        e.preventDefault();
                        hide_pane(giveclue);
                        Server.giveClue(playerIndex, card.data.colour, function (result) {
                            console.log('giveClue result: ' + JSON.stringify(result));
                        });
                    });
                    giveclue.one('#giveclue_cancel').on('click', function (e) {
                        e.preventDefault();
                        hide_pane(giveclue);
                    });
                    show_pane(giveclue);
                }
            });

            Game.cards.players[playerIndex].push(card);
            return card;
        };

        socket.on('cardDrawn', function (data) {
            console.log('cardDrawn received from server, data: ' + JSON.stringify(data));
            addCard(data.playerIndex, data.cardIndex, data.card);
            layout();
        });
        var reIndex = function (array) {
            for (var i = 0; i < array.length; i++) {
                array[i].index = i;
            }
        };
        socket.on('cardPlayed', function (data) {
            console.log('cardPlayed received from server, data: ' + JSON.stringify(data));
            Y.one('#player1').removeClass('highlighted');
            Game.yourTurn = false;
            // Pop card from specified hand
            // Firework updated event/card discarded event updates those pile
            var card = Game.cards.players[data.playerIndex].splice(data.cardIndex, 1)[0];
            reIndex(Game.cards.players[data.playerIndex]);
            card.div.addClass(data.card.colour);
            card.div.set('text', '' + data.card.value);
            card.div.detachAll();
            if (data.result === 'ok') {
                Game.cards.fireworks[data.card.colour].push(card);
            } else {
                Game.cards.discard.push(card);
            }
            layout();
        });
        socket.on('cardDiscarded', function (data) {
            console.log('cardDiscarded received from server, data: ' + JSON.stringify(data));
            Y.one('#player1').removeClass('highlighted');
            Game.yourTurn = false;
            // Pop card from specified hand
            // Add it to discard pile at top
            var card = Game.cards.players[data.playerIndex].splice(data.cardIndex, 1)[0];
            reIndex(Game.cards.players[data.playerIndex]);
            // Reset card info since it may be hidden
            card.div.addClass(data.card.colour);
            card.div.set('text', '' + data.card.value);
            card.div.detachAll();
            Game.cards.discard.push(card);
            layout();
        });

        var clueHighlight = function (div, clue, index) {
            if (clue.value !== null) {
                if (index === 0) {
                    // Clue for us
                    div.set('text', '' + clue.value);
                    div.addClass('highlightValue');
                    setTimeout(function () {
                        div.set('text', '?');
                        div.removeClass('highlightValue');
                    }, 5000);
                } else {
                    div.addClass('highlightValue');
                    setTimeout(function () {
                        div.removeClass('highlightValue');
                    }, 5000);
                }
            }
            if (clue.colour !== null) {
                div.addClass('highlightColour' + clue.colour);
                setTimeout(function () {
                    div.removeClass('highlightColour' + clue.colour);
                }, 5000);
            }
        };

        socket.on('clueGiven', function (data) {
            console.log('clueGiven received from server, data: ' + JSON.stringify(data));
            Y.one('#player1').removeClass('highlighted');
            Game.yourTurn = false;
            // Highlight cards based on indexes and clue mask
            // Set 10 second timeout to hide the clue
            for (var i = 0; i < data.clueMask.length; i++) {
                clueHighlight(Game.cards.players[data.toPlayerIndex][i].div, data.clueMask[i], data.toPlayerIndex);
            }
        });
        socket.on('clueUsed', function (data) {
            console.log('clueUsed received from server');
            // Decrement number of clues (change CSS on next token)
            Game.clues -= 1;
            layout();
        });
        socket.on('clueRestored', function (data) {
            console.log('clueRestored received from server');
            // Increment number of clues (change CSS on next token)
            Game.clues += 1;
            layout();
        });
        socket.on('lifeLost', function (data) {
            console.log('lifeLost received from server');
            // Decrement number of lives (change CSS on next token)
            Game.lives -= 1;
            layout();
        });
        socket.on('enterEndgame', function (data) {
            console.log('enterEndgame received from server');
            // Show a notification on screen and change background colour
        });
        socket.on('deckExhausted', function (data) {
            console.log('deckExhausted received from server');
            // Change deck to look empty
            Y.one('#draw').addClass('empty');
        });

        // Updates the game list display
        socket.on('gameCreated', function (data) {
            console.log('gameCreated received from server');
        });
        socket.on('gameStarted', function (data) {
            console.log('gameStarted received from server');
        });
        socket.on('gameEnded', function (data) {
            console.log('gameEnded received from server');
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
                            Game.id = item.id;
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
            hide_pane(newgame);
            set_creating();
            show_pane(waiting);
            Server.newGame(name, players, function (result) {
                console.log('newGame result: ' + JSON.stringify(result));
                if (typeof result === 'object') {
                    set_joining();
                    Server.joinGame(result, function (result) {
                        // TODO implement joinGame
                        console.log('joinGame result: ' + JSON.stringify(result));
                        if (result === undefined) {
                            set_waiting();
                        } else {
                            // TODO show error + route back to splash
                            console.log('Error: joinGame call failed with: ' + JSON.stringify(result));
                        }
                    });
                } else {
                    // TODO show error + route back to splash
                    console.log('Error: newGame call failed with: ' + JSON.stringify(result));
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
            Server.unsubscribeGameList();
            hide_pane(gamelist);
            set_joining();
            show_pane(waiting);
            Server.joinGame({id: Game.id}, function (result) {
                console.log('joinGame result: ' + JSON.stringify(result));
                if (result === undefined) {
                    set_waiting();
                } else {
                    // Error + back to game listing
                    console.log('Error: joinGame call failed with: ' + JSON.stringify(result));
                }
            });
        });

        /*quit.on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            // TODO - end game in progress (leave if necessary)
            show_pane(splash);
        });*/

        /*about.on('click', function(e) {
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
        });*/

        Y.on('windowresize', function () {
            layout();
        });

        show_pane(splash);
        layout();
    });
});

