	/*
	the capitals quizz
	Design and Code by Boudjema Abdennour
	facebook.com/nouri.karita.dz
	*/
// JavaScript Document

$(document).ready(function(){
  console.log('javascript chargé')
    "use strict";
	$("#game").hide();
	$("#end").hide();
	$("#home").show();
	var countries=["ALBANIA","ARMENIA","AUSTRIA","AZERIBAIJAN","BELARUS","BELGIUM","BOSNIA AND HERZEGOVINA","BULGARIA","CROATIA","CYPRUS","CZECH REPUBLIC","DENMARK","ESTONIA","FINLAND","FRANCE","GEORGIA","GERMANY","GREECE","HUNGARY","ICELAND","IRELAND","ITALY","KAZAKHSTAN","LATVIA","LIECHTENSTEIN","LITHUANIA","LUXEMBOURG","MACEDONIA","MALTA","MOLDOVA","MONACO","MONTENEGRO","NETHERLANDS","NORWAY","POLAND","PORTUGAL","ROMANIA","RUSSIA","SAN MARINO","SERBIA","SLOVAKIA","SLOVENIA","SPAIN","SWEDEN","SWITZERLAND","TURKEY","UKRAINE","UNITED KINGDOM"];
	var capitals=["TIRANA","YEREVAN","VIENNA","BAKU","MINSK","BRUSSELS","SARAJEVO","SOFIA","ZAGREB","NICOSIA","PRAGUE","COPENHAGEN","TALLINN","HELSINKI","PARIS","TBILISI","BERLIN","ATHENS","BUDAPEST","REYKJAVIK","DUBLIN","ROME","ASTANA","RIGA","VADUZ","VILNIUS","LUXEMBOURG","SKOPJE","VALLETTA","CHISINAU","MONACO","PODGORICA","AMSTERDAM","OSLO","WARSAW","LISBON","BUCHAREST","MOSCOW","SAN MARINO","BELGRADE","BRATISLAVA","LJUBLJANA","MADRID","STOCKHOLM","BERN","ANKARA","KYIV","LONDON"];
	var flags=["https://upload.wikimedia.org/wikipedia/commons/3/36/Flag_of_Albania.svg","https://upload.wikimedia.org/wikipedia/commons/2/2f/Flag_of_Armenia.svg","https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_Austria.svg","https://upload.wikimedia.org/wikipedia/commons/d/dd/Flag_of_Azerbaijan.svg","https://upload.wikimedia.org/wikipedia/commons/8/85/Flag_of_Belarus.svg","https://upload.wikimedia.org/wikipedia/commons/6/65/Flag_of_Belgium.svg","https://upload.wikimedia.org/wikipedia/commons/b/bf/Flag_of_Bosnia_and_Herzegovina.svg","https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg","https://upload.wikimedia.org/wikipedia/commons/1/1b/Flag_of_Croatia.svg","https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Cyprus.svg","https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_Czech_Republic.svg","https://upload.wikimedia.org/wikipedia/commons/9/9c/Flag_of_Denmark.svg","https://upload.wikimedia.org/wikipedia/commons/8/8f/Flag_of_Estonia.svg","https://upload.wikimedia.org/wikipedia/commons/b/bc/Flag_of_Finland.svg","https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg","https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_Georgia.svg","https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg","https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Greece.svg","https://upload.wikimedia.org/wikipedia/commons/c/c1/Flag_of_Hungary.svg","https://upload.wikimedia.org/wikipedia/commons/c/ce/Flag_of_Iceland.svg","https://upload.wikimedia.org/wikipedia/commons/4/45/Flag_of_Ireland.svg","https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg","https://upload.wikimedia.org/wikipedia/commons/d/d3/Flag_of_Kazakhstan.svg","https://upload.wikimedia.org/wikipedia/commons/8/84/Flag_of_Latvia.svg","https://upload.wikimedia.org/wikipedia/commons/4/47/Flag_of_Liechtenstein.svg","https://upload.wikimedia.org/wikipedia/commons/1/11/Flag_of_Lithuania.svg","https://upload.wikimedia.org/wikipedia/commons/d/da/Flag_of_Luxembourg.svg","https://upload.wikimedia.org/wikipedia/commons/f/f8/Flag_of_Macedonia.svg","https://upload.wikimedia.org/wikipedia/commons/7/73/Flag_of_Malta.svg","https://upload.wikimedia.org/wikipedia/commons/2/27/Flag_of_Moldova.svg","https://upload.wikimedia.org/wikipedia/commons/e/ea/Flag_of_Monaco.svg","https://upload.wikimedia.org/wikipedia/commons/6/64/Flag_of_Montenegro.svg","https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg","https://upload.wikimedia.org/wikipedia/commons/d/d9/Flag_of_Norway.svg","https://upload.wikimedia.org/wikipedia/en/1/12/Flag_of_Poland.svg","https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg","https://upload.wikimedia.org/wikipedia/commons/7/73/Flag_of_Romania.svg","https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg","https://upload.wikimedia.org/wikipedia/commons/b/b1/Flag_of_San_Marino.svg","https://upload.wikimedia.org/wikipedia/commons/f/ff/Flag_of_Serbia.svg","https://upload.wikimedia.org/wikipedia/commons/e/e6/Flag_of_Slovakia.svg","https://upload.wikimedia.org/wikipedia/commons/f/f0/Flag_of_Slovenia.svg","https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg","https://upload.wikimedia.org/wikipedia/en/4/4c/Flag_of_Sweden.svg","https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg","https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg","https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg","https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg"];
	var theLetterWanted=-1;
	var remainingButtons=0;
	var alreadyPlayed=[];
	var theAnswerDivided=[];
	var randomNumberMainOption;
	var theAnswerLength;
	var theAnswer;
	var slicer;
	var splitersHolder=[];
	var nextAppend;
	var counter=1;
	var howmanyButtons=16;
	var playedAlreadies=0;
	var rights=0;
	var wrongs=0;
	var passes=0;
	var seconds=0;
	var miliseconds=0;
	var mistake=[];
	var correct=[];
	var interv=1;
	var limit=180;
	var accuracy=0;
	function resetall(){
		theLetterWanted=-1;
		remainingButtons=0;
		theAnswerDivided=[];
		splitersHolder=[];
		counter=0;
	}
  var socket = io();
  console.log(socket);

  //function qui remet tous les indicateur à zero -
	function resetEverything(){
		$("#end").hide();
		$("#game").hide();
		$("#home").show();
		$("#fautes").empty();
		$("#justes").empty();
		resetall();
		playedAlreadies=0;
		rights=0;
		wrongs=0;
		passes=0;
		seconds=0;
		miliseconds=0;
		mistake=[];
	    correct=[];
		accuracy=0;
	}

//function qui générèe un nombre aléatoire pour choisir dans le tableau country.
	function generateNumber(){
			randomNumberMainOption=Math.floor(Math.random()*countries.length);
			var checkAvailability=alreadyPlayed.indexOf(randomNumberMainOption);
			if(checkAvailability===-1){
					alreadyPlayed.push(randomNumberMainOption);
					//console.log(randomNumberMainOption);

				}
			else{
					randomNumberMainOption=Math.floor(Math.random()*countries.length);
					console.log(randomNumberMainOption);
				}

			//console.log("array : "+alreadyPlayed+" the number : "+randomNumberMainOption);
		}//generate random Number and check if not used already



	function getTheAnswerAndBreakIt(){
		//console.log(randomNumberMainOption);
			theAnswer=capitals[randomNumberMainOption];
			theAnswerLength=theAnswer.length;
			for(var i=0;i<theAnswerLength;i++){
					slicer=theAnswer.slice(i,i+1);
					theAnswerDivided.push(slicer);
				}
			console.log("the Answer : "+theAnswer);
			$(".theCountry").text(countries[randomNumberMainOption]);
		}//get answer and break it;
	function changeImage(){
			$("img").attr("src",flags[randomNumberMainOption]);
		}
		function distributeLetters(){
			for(var k=0;k<1000;k++){

				var randomNumberToSplitLetters=Math.floor(Math.random()*howmanyButtons);
				var splitersAvailabilityChecker=splitersHolder.indexOf(randomNumberToSplitLetters);
					if(splitersAvailabilityChecker===-1){
							theLetterWanted++;
							splitersHolder.push(randomNumberToSplitLetters);
							//console.log("randoms : "+splitersHolder+" k : "+k+" the letter : "+theLetterWanted);
							$("."+randomNumberToSplitLetters+"").text(theAnswerDivided[theLetterWanted]);
								if(splitersHolder.length>=theAnswerDivided.length){break;}
					}
					else{
							randomNumberToSplitLetters=Math.floor(Math.random()*theAnswerDivided.length);
					}
			}//for
		}//distribute letters on buttons , the right ones

	var letters=["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

	function fillTheRemainingButtons(){
		for(var x=0;x<1000;x++){
				var randomLetterSelecter=Math.floor(Math.random()*letters.length);
				var randomOtherButtonsSelector=Math.floor(Math.random()*howmanyButtons);
				var indexOfOtherRandom=splitersHolder.indexOf(randomOtherButtonsSelector);
					if(indexOfOtherRandom===-1){
							splitersHolder.push(randomOtherButtonsSelector);
							remainingButtons++;
							$("."+randomOtherButtonsSelector+"").text(letters[randomLetterSelecter]);
							/*console.log("buttons : "+howmanyButtons);
							console.log(" filled already : "+splitersHolder.length+"counter : "+remainingButtons);*/
							//console.log("the random : "+randomOtherButtonsSelector);
								if(remainingButtons>howmanyButtons-theLetterWanted){break;}
						}
					else{
							randomOtherButtonsSelector=Math.floor(Math.random()*howmanyButtons);
						}
			}//for
		}//fill the remaining buttons
	function genButtons(){
		for(var k=0;k<howmanyButtons;k++){
			$("#butttholder").append("<div class='"+k+" button'></div>");
			}
	}//generate buttons
	function genPs(){
		for(var i=0;i<theAnswerDivided.length;i++){
			$("#ppholder").append("<div id='"+i+"' class='p'></div>");
			}
		//console.log(theAnswerDivided.length);
	}//generate paragraphs that'll hold the letters


	function checkNextAppend(){
		for(var j=0;j<theAnswerDivided.length;j++){
			var text=$("#"+j+"").text();
			if(!text){
				nextAppend=j;
				//console.log("next append : "+nextAppend);
				break;
				}//if
			else{
				nextAppend=-1;
			    }//else
			}//for
		}//check next append
	$("#butttholder").on("click", ".button", function(){
		createPlayer();
    checkNextAppend();
		if(nextAppend>-1){
			var texts = $(this).text();
            $("#"+nextAppend+"").text(texts);
		    $(this).remove();
			counter++;
			checkIfWin();
		}//if still places
		//console.log(counter);
	});//on cilick button










	function checkIfWin(){
		$("h6").text("");
		for(var d=0;d<theAnswerDivided.length;d++){
			$("h6").append($("#"+d+"").text());
		}//for
		if(counter>=theAnswerLength){
				playedAlreadies++;
				if($("h6").text()===theAnswer){
					game();
					rights++;
					correct.push(randomNumberMainOption);
				}//if win
				else{
					game();
					wrongs++;
					mistake.push(randomNumberMainOption);
				}///else lose
			}//if all filed
			//console.log("counter : "+counter+" answer length : "+theAnswerLength);
	}//check if win
	$("#pass").click(function() {
        playedAlreadies++;
		passes++;
		mistake.push(randomNumberMainOption);
		game();
    });
	$("#ppholder").on("click", ".p",function() {
			var textOfP = $(this).text();
			if(textOfP){
				counter+=-1;
				$("#butttholder").append("<div class='button'>"+$(this).text()+"</div>");
			}
			//console.log(counter);
			$(this).text("");
    });//on click p
	$(".start").click(function() {
		$("#home").hide();
		$("#game").show();
		$("#end").hide();
        game();

    createPlayer();
		Timer();
    });//start the game


  var createPlayer = function(){
    var newUser = document.getElementById('userName').value;
    socket.emit('new player', newUser);
  }

  socket.on('ok_player', function(msg){
    console.log('nouveau joueur'  + msg.user);
    var displayName = document.getElementById('username')
    displayName.appendChild(msg.user);
  });

	function Timer(){
			var gameTime=setInterval(function(){
				miliseconds++;
				if(miliseconds>=10){
					miliseconds=0;
					seconds++;
				}
				$("#time").text("time left : "+(180-seconds));

				//console.log("seconds : "+seconds+" interv : "+interv);
				if(seconds>=limit){
					clearInterval(gameTime);
					endGame();
					}
			},100*interv);//set interval
	}//timer
	$("#startagain").click(function() {
        resetEverything();
    });
	function game(){
		$("#butttholder").empty();
		$("#ppholder").empty();
		resetall();
		genButtons();
		generateNumber();
		getTheAnswerAndBreakIt();
		distributeLetters();
		fillTheRemainingButtons();
		changeImage();
		genPs();
	}//function game
	function endGame(){
			$("#game").hide();
			$("#home").hide();
			$("#end").show();
			$("#wrong").text("wrong : "+wrongs);
			$("#correct").text("correct : "+rights);
			accuracy=(100*(rights-wrongs))/(playedAlreadies);
			if(accuracy<0){
				accuracy=0;
			}
			$("#accuracy").text("accuracy : "+accuracy+"%");
			for(var f=0;f<mistake.length;f++){
				var lesFautes=mistake[f];
				$("#fautes").append(countries[lesFautes]+" : "+capitals[lesFautes]+"<br>");
			}//write the mistakes


			/*for(var r=0;r<correct.length;r++){
				var lesJustes=correct[r];
				$("#justes").append(countries[lesJustes]+" : "+capitals[lesJustes]+"<br>");
			}*///write the rights
			//console.log(miliseconds);
	}//endgame funciotn

});
