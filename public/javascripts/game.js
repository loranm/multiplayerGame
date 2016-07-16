	/*
	the capitals quizz
	Design and Code by Boudjema Abdennour
	facebook.com/nouri.karita.dz
	*/
// JavaScript Document

$(document).ready(function(){
    "use strict";
	$("#game").hide();
	$("#end").hide();
	$("#home").show();
  var capitalSize;
  var myAnswer='';
  var theLetterWanted=-1;
	var remainingButtons=0;
	var alreadyPlayed=[];
	var theAnswerDivided=[];
	var randomNumberMainOption;
  var proposition = [];
  var myCounter = 0;
	var nextAppend;
	var counter=1;
	var resetAll = function(){
		theLetterWanted=-1;
		remainingButtons=0;
		counter=0;
	}
  var socket = io();

  //function qui remet tous les indicateur à zero -
	function resetEverything(){
		$("#end").hide();
		$("#game").hide();
		$("#home").show();
		$("#fautes").empty();
		$("#justes").empty();
		resetall();
    timer(180);

		// rights=0;
		// wrongs=0;
		// passes=0;
		// seconds=0;
		// miliseconds=0;
		// mistake=[];
	    // correct=[];
		// accuracy=0;
	};

	var changeCountry = function(country,flag){
    $(".theCountry").text(country);
		$("img").attr("src",flag);
	};

	var genButtons = function(nb){
		for(var k=0;k<nb;k++){
			$("#butttholder").append("<div class='"+k+" button'></div>");
			}
	}//generate buttons

	function genPs(nb){
		for(var i=0; i < nb; i++){
			$("#ppholder").append("<div id='"+i+"' class='p'></div>");
			}
	}//generate paragraphs that'll hold the letters


	function checkNextAppend(){
		for(var j=0;j<capitalSize;j++){
			var text=$("#"+j+"").text();
			if(!text){
				nextAppend=j;
				break;
				}//if
			else{
				nextAppend=-1;
			    }//else
			}//for
		}//check next append

	$("#butttholder").on("click", ".button", function(){
    var slots = document.getElementsByClassName('p');
    $(slots[myCounter]).text($(this).text());
    myAnswer += $(this).text();
    myCounter++;
    $(this).remove();
    if (myCounter >= capitalSize){
      checkIfWin(myAnswer);
      myCounter = 0;
      myAnswer = '';
    };
  });



	function checkIfWin(answer){
    console.log(answer)
    socket.emit('check if i win', {answer: answer});
	}//check if win


	$("#pass").click(function() {
    socket.emit('i pass')
  });

	$("#ppholder").on("click", ".p",function() {
			var textOfP = $(this).text();
			if(textOfP){
        myAnswer = myAnswer.substr(0,myAnswer.length-1);
				myCounter-=1;
				$("#butttholder").append("<div class='button'>"+$(this).text()+"</div>");
			}
			$(this).text("");
    });//on click p


	$(".start").click(function() {
		// $("#home").hide();
		// $("#game").show();
		// $("#end").hide();
      createPlayer();
	});//start the game


  var createPlayer = function(){
    var newUser = document.getElementById('userName').value;
    socket.emit('new player', newUser);
  }

//créer le tableau des participants pour le nouveau connecté
  socket.on('createMyNewScoreBoard', function(data){
    $("#home").hide();
    $("#game").show();
    $("#end").hide();
    timer(20);
    addToPlayersBoard(data.players);
    socket.emit('Send me a new flag', {data})
  });

//Ajoute l'input pour entrer un mot de passe si l'id est reconnu
  socket.on('ask pwd', function(){
    $(".start").off('click');
    showPwdinput();
  })

//Ajouter le text si erreur de mot de passe
  socket.on('no credential', function(){
    var password = document.getElementById('pwd');
    password.value = '';
    showCredentialMsg()
  });

//ajouter le nouveau participants au tableau des connecté
  socket.on('addNewPlayerToBoard', function(data){
    addToPlayersBoard(data);
  });
//un joueur vient de partir
  socket.on('leftTheGame', function(data){
    deletePlayerFromBoard(data.user.user);
  });

  socket.on('update score', function(data){
    updateScore(data.user, data.score)
    // socket.emit('Send me a new flag');
  })

  socket.on('next round', function(data){
    // updateScore(data.user, data.score)
    socket.emit('Send me a new flag');
  })

  socket.on('newFlag', function(data){
    game(data.country, data.flag, data.capitalsize,data.letters)
    console.log(data.capital)
  });

  socket.on('update time', function(data){
    console.log(data)
    var timer = document.getElementById('time');
    var timeLeft = document.createTextNode(' Time Left : ' + data.timeLeft);
    console.log(timeLeft);
    timer.appendChild(timeLeft)
  })

  socket.on('please register', function(data){
    var myButton = document.getElementById('send')
    $('#end').fadeIn()
    $("#register").text('Votre score est de : ' + data.score + " vous pouvez l'enregistrer et l'améliorer ensuite");
    var registerName = document.getElementById('registerName');
    registerName.value = data.user;
    registerName.readOnly = true;
    myButton.addEventListener('click', function(){
      var mail = document.getElementById('mail').value;
      var passInitial = document.getElementById('pass_initial').value;
      var pass_check = document.getElementById('pass_check').value;
      socket.emit('register my account', {user : registerName.value, mail: mail, passInitial: passInitial, pass_check: pass_check})
    })
  })


  var updateScore = function(playerID, score){
    var connectedPlayers = document.getElementById('scoreBoard');
    var rowCount = connectedPlayers.rows.length;
    var tds = connectedPlayers.getElementsByTagName('td')
    for (var i = 0; i < tds.length; i++){
      if (tds[i].innerHTML == playerID){
        tds[i+1].innerHTML = score;
      };
    };
  };

  var addToPlayersBoard = function(data){
    var connectedPlayers = document.getElementById('scoreBoard');
    for (var i in data){
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

  var deletePlayerFromBoard = function(playerId){
    var connectedPlayers = document.getElementById('scoreBoard');
    var rowCount = connectedPlayers.rows.length;
    var row = connectedPlayers.rows[1]
    for (var i = rowCount-1 ; i > -1; i--){
      var row = connectedPlayers.rows[i];
      var username = row.cells[0].innerText;
      if (username.indexOf(playerId) != -1){
        connectedPlayers.deleteRow(i);
      };
    };
  };

  var showPwdinput = function(){
    var pwd = document.getElementById('pwd');
    if (pwd == null){
      var loginField = document.getElementsByClassName('form-control')[0];
      var myP = document.createElement('p')
      var pwdInput = document.createElement('input');
      pwdInput.id = 'pwd'
      pwdInput.className ='form-control'
      pwdInput.placeholder = 'indiquez votre mot de passe ici';
      pwdInput.type = 'password';
      loginField.appendChild(myP);
      loginField.appendChild(pwdInput);
      sendIdAndPassword();
    }
  };

  var showCredentialMsg = function(){
    var errorMessage = document.getElementById('errorMessage');
    if (errorMessage == null){
      var loginField = document.getElementsByClassName('form-control')[0];
      var errorMessage = document.createElement('div');
      errorMessage.id = 'errorMessage'
      errorMessage.setAttribute("style", "color: red; font-family: Arial");
      var myPText = document.createTextNode('identifiant ou mot passe erroné, réessayer s\'il vous plaît');
      errorMessage.appendChild(myPText);
      loginField.appendChild(errorMessage);
    };
  };

  var sendIdAndPassword = function(){
    $(".start").click(function() {
      var username = document.getElementById('userName').value;
      var pwd = document.getElementById('pwd').value;
      socket.emit('check my ids', {username : username , pwd : pwd});
    });
  };


	var timer = function(limit){
        var gameTime=setInterval(function(){
          if(limit <= 0){
            clearInterval(gameTime);
            endGame()
          }else {
            limit--;
            $("#time").text("time left : "+(limit));
          };
      },1000);//set interval
  }//timer

	$("#startagain").click(function() {
        resetEverything();
    });

	var game = function(country,flag,capitalsize,data){
		$("#butttholder").empty();
		$("#ppholder").empty();
		resetAll();
		genButtons(16);
    capitalSize = capitalsize;
		distributeLetters(data);
		changeCountry(country,flag);
		genPs(capitalsize);
	}//function game

  var distributeLetters = function(letters){
		for(var i= 0; i < letters.length;i++){
      $('.'+i+'.button').text(letters[i])
    };
  };



	function endGame(){
    socket.emit('end game', {message:'c\’est la fin'})
			$("#game").fadeOut();
			// $("#home").hide();
      console.log('fin du jeu')
			// $("#end").show();
			// $("#correct").text("correct : " + 'blabla');
			// accuracy=(100*(rights-wrongs))/(playedAlreadies);
			// if(accuracy<=0){
			// 	accuracy=0;
			// }
			// $("#accuracy").text("accuracy : "+accuracy+"%");
			// for(var f=0;f<mistake.length;f++){
			// 	var lesFautes=mistake[f];
			// 	$("#fautes").append(countries[lesFautes]+" : "+capitals[lesFautes]+"<br>");
			// }//write the mistakes
	}//endgame funciotn

  window.addEventListener('beforeunload', function(){
    socket.emit('disconnect');
  });


});
