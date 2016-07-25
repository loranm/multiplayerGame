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


/******************************************************************************
  DIALOGUE CLIENT SERVEUR VIA SOCKET.IO
*******************************************************************************/

    //crée le tableau des participants pour le nouveau connecté
    socket.on('createMyNewScoreBoard', function(data) {
        $("#home").hide();
        $('#instructions').fadeOut();
        $("#game").show();
        $("#end").hide();
        corrections = [];
        myCounter = 0;
        myAnswer = '';
        timer(60);
        addToPlayersBoard(data.players);
        socket.emit('Send me a new flag', {
            data
        })
    });

    //Ajoute l'input pour entrer un mot de passe si l'id est reconnu
    socket.on('ask pwd', function(data) {
        $("#userName").hide();
        $(".start").off('click');
        showPwdinput(data.user);
    })

    //affiche un message d'erreur si le mot de passe est erronné
    socket.on('no credential', function() {
        var password = document.getElementById('pwd');
        password.value = '';
        showCredentialMsg()
    });

    //ajoute le joueur qui vient de se connecter.
    socket.on('addNewPlayerToBoard', function(data) {
        addToPlayersBoard(data);
    });

    //un joueur vient de partir
    socket.on('leftTheGame', function(data) {
        deletePlayerFromBoard(data.user.user);
    });
    //Mets à jour le tableau des scores
    socket.on('update score', function(data) {
        updateScore(data.user, data.score, data.bestScore);
    });

    //retour visuel en cas de bonne réponse
    socket.on('correct answer', function(){
      $('#correct').fadeIn(1000, function(){
        $(this).fadeOut(1000);
      })
    });

    //retour visuel en cas de mauvaise réponse
    socket.on('wrong answer', function(){
      $('#wrong').fadeIn(1000, function(){
        $(this).fadeOut(1000);
      })
    });

    //gestion de demande d'un nouveau tour de jeu
    socket.on('next round', function(data) {
      myCounter = 0;
      myAnswer = '';
      socket.emit('Send me a new flag');
    })

    //gestion de demande d'un nouveau drapeau
    socket.on('newFlag', function(data) {
        game(data.country, data.flag, data.capitalsize, data.letters)
    });

    //les valeurs temporaires de réponses de l'utilisateur sont vidées pour le prochain pays.
    socket.on('resetValue',function(data){
      myCounter = data.myCounter;
      myAnswer = data.myAnswer;
    });

    //gestion de la mise à jour des meilleurs scores
    socket.on('update leaderBoard data', function(data){
      updateLeaderBoard(data);
    });

    //Affichage du formulaire d'inscription
    socket.on('please register', function(data) {
        var myButton = document.getElementById('send')
        $('#results').show();
        var results = document.getElementById('comments');
        var scoreDiv = document.getElementById('scoreDiv');
        if(scoreDiv === null){
          var scoreDiv = document.createElement('div');
          scoreDiv.id = "scoreDiv";
          scoreDiv.innerHTML = '<em>'+data.user.toUpperCase() +'</em>'+ ' <br>Your score is : ' + data.score + '. <br>Your rank is <em>' + data.rank + ' <br> You may save this score by <em>registering</em> and come back later to improve it';
          results.appendChild(scoreDiv);
        }else{
          scoreDiv.innerHTML = '<em>'+data.user+'</em>'+ ' <br>Your score is : ' + data.score + '. <br>Your rank is ' + data.rank + ' <br> You may save this score by <em>registering</em> and come back later to improve it';
        }
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
            });
        });
    })

    //retour visuel si l'inscription s'est bien passée.
    socket.on('account created', function(data){
      var myDiv = document.getElementById('register');
      myDiv.innerHTML="Congratulations <em>"+ data.user + "</em> <br>Your score is recorded !";
    })

    //retours visuels en cas d'erreur de remplissage du formulaire par l'utilisateur.
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


    //affichage des résultats
    socket.on('show results', function(data) {
        $('#register').hide();
        $('#scoreDiv').hide();
        var resultsDiv = document.getElementsByClassName('results');
        resultsDiv[0].innerHTML = '<em>' + data.message.toUpperCase() + '</em>';
        var displayScore = document.getElementById('displayScore');
        if(displayScore === null){
          displayScore = document.createElement('div');
          displayScore.id = 'displayScore'
          displayScore.innerHTML = '<span><em>' + data.user + '</em> <br>You score '+ data.score + ' points.<br> Your ranking on the ladder is '+ data.rank +'. Try Again !</span>'
          resultsDiv[1].appendChild(displayScore);
        }else{
          displayScore.innerHTML = '<span><em>' + data.user + '</em> <br>You score '+ data.score + ' points.<br> Your ranking on the ladder is '+ data.rank +'. Try Again !</span>'
        };
    });


/*******************************************************************
  FUNCTIONS APPELEES par le client
********************************************************************/



  var updateScore = function(playerID, score, bestScore) {
      var connectedPlayers = document.getElementById('scoreBoard');
      var rowCount = connectedPlayers.rows.length;
      var tds = connectedPlayers.getElementsByTagName('td')
      for (var i = 0; i < tds.length; i++) {
          if (tds[i].innerHTML === playerID) {
              tds[i + 1].innerHTML = score;
              tds[i + 2].innerHTML = bestScore;
          };
      };
  };

  var updateLeaderBoard = function(data){
    var leaderboard = document.getElementById('leaderBoard');
    var rowCount = leaderboard.rows.length;
    for (var i in data){
      var rank = parseInt(i)+1;
      leaderboard.rows[rank].cells[1].innerHTML = data[i].user;
      leaderboard.rows[rank].cells[2].innerHTML = data[i].bestScore;
    };
  };


  var addToPlayersBoard = function(data) {
    var connectedPlayers = document.getElementById('scoreBoard');
    for (var i in data) {
      if (data[i].user != undefined){
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
          var reminderUserText = document.createTextNode('Enter password for : ' + user)
          var reminderUser = document.createElement('div')
          reminderUser.appendChild(reminderUserText);
          var wrongUserText = document.createTextNode('I am not ' + user + ' ! ');
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
      timer(60);
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

  var endGame = function() {
      socket.emit('end game', {
          message: "Time's up !"
      })
      $("#game").fadeOut();
      $("#end").show();
  };

  window.addEventListener('beforeunload', function() {
      socket.emit('disconnect');
  });

});
