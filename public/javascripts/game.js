/*
	the capitals quizz
	Original Design and Code by Boudjema Abdennour
	facebook.com/nouri.karita.dz
	*/

/*
multiplayers version
by Laurent Muller
gitHub : https://github.com/loranm/multiplayerGame
Code is open-source, free to modify and redistribute
*/

"use strict";
document.addEventListener('DOMContentLoaded', function() {

    $("#game").hide();
    $("#end").hide();
    $("#home").show();
    var socket = io();
    var capitalSize;
    var myAnswer = '';
    var myCounter = 0;
    var nextAppend;
    var corrections = [];

    var changeCountry = function(country, flag) {
        $(".theCountry").text(country);
        $("img").attr("src", flag);
    };

    var genButtons = function(nb) {
            for (var k = 0; k < nb; k++) {
                $("#butttholder").append("<div class='" + k + " button'></div>");
            }
        } //generate buttons

    function genPs(nb) {
        for (var i = 0; i < nb; i++) {
            $("#ppholder").append("<div id='" + i + "' class='p'></div>");
        }
    } //generate paragraphs that'll hold the letters

    $("#butttholder").on("click", ".button", function() {
        var slots = document.getElementsByClassName('p');
        if (corrections.length > 0) {
            var temp = corrections[corrections.length - 1];
            $(slots[temp]).text($(this).text());
            myAnswer = myAnswer.split(''),
                myAnswer[temp] = $(this).text();
            myAnswer = myAnswer.join('');
            corrections.pop();
        } else {
            $(slots[myCounter]).text($(this).text());
            myAnswer += $(this).text();
            myCounter++;
            $(this).remove();
            if (myCounter >= capitalSize) {
                checkIfWin(myAnswer);
                corrections = [];
                myCounter = 0;
                myAnswer = '';
            };
        }
    });

    function checkIfWin(answer) {
        socket.emit('check if i win', {
            answer: answer
        });
    } //check if win

    $("#pass").click(function() {
        socket.emit('i pass')
    });

    $("#ppholder").on("click", ".p", function() {
        var textOfP = $(this).text();
        var letterRank = $(this)[0].id;
        if (textOfP) {
            corrections.push(letterRank);
            $("#butttholder").append("<div class='button'>" + $(this).text() + "</div>");
        }
        $(this).text("");
    }); //on click p


    $(".start").click(function() {
        createPlayer();
    }); //start the game


    var createPlayer = function() {
        var newUser = document.getElementById('userName').value;
        socket.emit('new player', newUser);
    }

    //créer le tableau des participants pour le nouveau connecté
    socket.on('createMyNewScoreBoard', function(data) {
        $("#home").hide();
        $('#instructions').fadeOut();
        $("#game").show();
        $("#end").hide();
        corrections = [];
        myCounter = 0;
        myAnswer = '';
        timer(10);
        addToPlayersBoard(data.players);
        socket.emit('Send me a new flag', {
            data
        })
    });


    socket.on('leaderBoard data', function(data) {
        createLeaderBoard(data);
    })

    //Ajoute l'input pour entrer un mot de passe si l'id est reconnu
    socket.on('ask pwd', function(data) {
        $("#userName").hide();
        $(".start").off('click');
        showPwdinput(data.user);
    })

    //Ajouter le text si erreur de mot de passe
    socket.on('no credential', function() {
        var password = document.getElementById('pwd');
        password.value = '';
        showCredentialMsg()
    });

    //ajouter le nouveau participants au tableau des connecté
    socket.on('addNewPlayerToBoard', function(data) {
        addToPlayersBoard(data);
    });

    //un joueur vient de partir
    socket.on('leftTheGame', function(data) {
        deletePlayerFromBoard(data.user.user);
    });

    socket.on('update score', function(data) {
        updateScore(data.user, data.score);
    })

    socket.on('next round', function(data) {
        socket.emit('Send me a new flag');
    })

    socket.on('newFlag', function(data) {
        game(data.country, data.flag, data.capitalsize, data.letters)
    });

    socket.on('update time', function(data) {
        var timer = document.getElementById('time');
        var timeLeft = document.createTextNode(' Time Left : ' + data.timeLeft);
        timer.appendChild(timeLeft)
    })

    socket.on('please register', function(data) {
        var myButton = document.getElementById('send')
        $('#end').fadeIn()
        $("#correct").text(data.user + ' Your score is : ' + data.score + '. Your rank is ' + data.rank + ' you may save this score and come back later to improve it');
        var registerName = document.getElementsByName('login');
        registerName[0].value = data.user;
        registerName[0].readOnly = true;
        myButton.addEventListener('click', function() {
            var mail = document.getElementsByName('mail');
            var passInitial = document.getElementsByName('pass_initial');
            var pass_check = document.getElementsByName('pass_check');
            socket.emit('register my account', {
                user: registerName[0].value,
                mail: mail[0].value,
                passInitial: passInitial[0].value,
                pass_check: pass_check[0].value
            })
        })
    })

    socket.on('form invalid', function(data) {
        var allInputs = document.getElementsByClassName('form-control');
        for (var k of allInputs) {
            if (k.children[1]) {
                k.removeChild(k.children[1]);
            };
        };

        for (var i of allInputs) {
            for (var j in data.errors) {
                if (j == i.id) {
                    var errorMessageDiv = document.createElement('div')
                    var errorMsg = document.createTextNode(data.errors[j]);
                    errorMessageDiv.appendChild(errorMsg);
                    errorMessageDiv.className = 'errorMsg'
                    var inputToComment = document.getElementById(i.id)
                    inputToComment.appendChild(errorMessageDiv);
                };
            };
        };
    });

    socket.on('show results', function(data) {
        $('#register').hide();
        var resultsDiv = document.getElementById('correct');
        var displayScore = document.createElement('div');
        var displayScoreText = document.createTextNode(data.user + ' vous avez réalisé un score de ' + data.score + '.')
        var displayRank = document.createElement('div');
        var displayRankText = document.createTextNode('Ce score vous place au rang ' + data.rank + ' du classement, pour rejouer cliquez sur \"Start Again\"')
        displayRank.appendChild(displayRankText)
        displayScore.appendChild(displayScoreText);
        resultsDiv.appendChild(displayScore);
        resultsDiv.appendChild(displayRank);
    });

    var updateScore = function(playerID, score) {
        var connectedPlayers = document.getElementById('scoreBoard');
        var rowCount = connectedPlayers.rows.length;
        var tds = connectedPlayers.getElementsByTagName('td')
        for (var i = 0; i < tds.length; i++) {
            if (tds[i].innerHTML == playerID) {
                tds[i + 1].innerHTML = score;
            };
        };
    };

    var addToPlayersBoard = function(data) {
        var connectedPlayers = document.getElementById('scoreBoard');
        for (var i in data) {
            var newRowPlayer = connectedPlayers.insertRow(connectedPlayers.rows.length);
            var newCellUser = newRowPlayer.insertCell(0);
            var newCellScore = newRowPlayer.insertCell(1);
            var newCellBestScore = newRowPlayer.insertCell(2);
            var newTextPlayer = document.createTextNode(data[i].user);
            var newTextScore = document.createTextNode(data[i].score);
            var newTextBestScore = document.createTextNode(data[i].bestScore);
            newCellUser.appendChild(newTextPlayer);
            newCellScore.appendChild(newTextScore);
            newCellBestScore.appendChild(newTextBestScore);
        };
    };

    var createLeaderBoard = function(data) {
        var leaderBoard = document.getElementById('leaderBoard');
        for (var i in data) {
            var newRowPlayer = leaderBoard.insertRow(leaderBoard.rows.length);
            var newCellRank = newRowPlayer.insertCell(0);
            var newCellUser = newRowPlayer.insertCell(1);
            var newCellBestScore = newRowPlayer.insertCell(2);
            var newTextRank = document.createTextNode(parseInt(i) + 1);
            var newTextUser = document.createTextNode(data[i].user);
            var newTextBestScore = document.createTextNode(data[i].bestScore);
            newCellRank.appendChild(newTextRank);
            newCellUser.appendChild(newTextUser);
            newCellBestScore.appendChild(newTextBestScore);
        };
    };

    var deletePlayerFromBoard = function(playerId) {
        var connectedPlayers = document.getElementById('scoreBoard');
        var rowCount = connectedPlayers.rows.length;
        var row = connectedPlayers.rows[1]
        for (var i = rowCount - 1; i > -1; i--) {
            var row = connectedPlayers.rows[i];
            var username = row.cells[0].innerText;
            if (username.indexOf(playerId) != -1) {
                connectedPlayers.deleteRow(i);
            };
        };
    };

    var showPwdinput = function(user) {
        var currentUser = document.getElementById('userName');
        var pwd = document.getElementById('pwd');
        if (pwd == null) {
            var loginField = document.getElementById('loginfields');
            var reminderUserText = document.createTextNode('Indiquez le mot de passe pour le pseudo : ' + user)
            var reminderUser = document.createElement('div')
            reminderUser.appendChild(reminderUserText);
            var wrongUserText = document.createTextNode('Oops ce n’est pas mon pseudo');
            var wrongUser = document.createElement('a');
            var myP = document.createElement('p')
            wrongUser.appendChild(wrongUserText);
            wrongUser.href = '/game';
            var pwdInput = document.createElement('input');
            pwdInput.id = 'pwd'
            pwdInput.placeholder = 'indiquez votre mot de passe ici';
            pwdInput.type = 'password';
            pwdInput.focus();
            loginField.appendChild(reminderUser);
            loginField.appendChild(myP);
            loginField.appendChild(pwdInput);
            loginField.appendChild(myP);
            loginField.appendChild(wrongUser);
            sendIdAndPassword(user);
        };
    };

    var showCredentialMsg = function() {
        var errorMessage = document.getElementById('errorMessage');
        if (errorMessage == null) {
            var passwordField = document.getElementById('pwd');
            var errorMessage = document.createElement('div');
            errorMessage.id = 'errorMessage'
            errorMessage.setAttribute("style", "color: red; font-family: Arial");
            var myPText = document.createTextNode('identifiant ou mot passe erroné, réessayer s\'il vous plaît');
            errorMessage.appendChild(myPText);
            passwordField.parentNode.appendChild(errorMessage);
        };
    };

    var sendIdAndPassword = function(user) {
        $(".start").click(function() {
            var username = document.getElementById('userName').value;
            var pwd = document.getElementById('pwd').value;
            if (username === user) {
                socket.emit('check my ids', {
                    username: username,
                    pwd: pwd
                });
            } else {
                createPlayer()
            }
        });
    };

    var timer = function(limit) {
            var gameTime = setInterval(function() {
                if (limit <= 0) {
                    clearInterval(gameTime);
                    endGame()
                } else {
                    limit--;
                    $("#time").text("time left : " + (limit));
                };
            }, 1000); //set interval
        } //timer

    $("#startagain").click(function() {
        socket.emit('startAgain')
        $('#end').hide();
        $('#home').hide();
        $('#game').show();
        timer(180);
        socket.emit('Send me a new flag');
    });

    var game = function(country, flag, capitalsize, data, time) {
            $("#butttholder").empty();
            $("#ppholder").empty();
            genButtons(16);
            capitalSize = capitalsize;
            distributeLetters(data);
            changeCountry(country, flag);
            genPs(capitalsize);
        } //function game

    var distributeLetters = function(letters) {
        for (var i = 0; i < letters.length; i++) {
            $('.' + i + '.button').text(letters[i])
        };
    };

    function endGame() {
        socket.emit('end game', {
            message: 'c\’est la fin'
        })
        $("#game").fadeOut();
        $("#end").show();
    }; //endgame funciotn

    window.addEventListener('beforeunload', function() {
        socket.emit('disconnect');
    });

});
