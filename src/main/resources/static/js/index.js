var stompClient = null;
var yourName = null;
var uitdaging = null;
var letters = [];
var patternCijfers = /[0-9]/g;
var patternLetters = /[a-z]/i;

$(window).on("load", function() {
	var socket = new SockJS('/hangman');
	stompClient = Stomp.over(socket);
	stompClient.connect("guest", "guest", function() {
		stompClient.subscribe('/topic/users', function(users) {
			showUsers(JSON.parse(users.body));
		});
		stompClient.subscribe('/topic/request', function(request) {
			behandelRequest(JSON.parse(request.body));
		});
		stompClient.subscribe('/app/users', function(users) {
			showUsers(JSON.parse(users.body));
		});
		stompClient.subscribe('/topic/response', function(response) {
			behandelResponse(JSON.parse(response.body));
		});
		stompClient.subscribe('/app/charachters', function(response) {
			console.log(JSON.parse(response.body));
		});
		stompClient.subscribe('/topic/checked', function(response) {
			console.log(JSON.parse(response.body));
		});
		versturen("/app/controle", {
			"uitdager" : {"naam" : "jos"},
			"uitgedaagde" : {"naam" : "pol"},
			"aanvaard" : true,
			"letters" : ["s","p","r","a","n","g"],
			"woord" : "spring"
		})
	});
});

$(window).ready(function() {
	$("#versturen").on("click", function() {
		yourName = $("#naam").val();
		if (yourName.indexOf(" ") < 0) {
			if (naamcontrole()) {
				$("<h1>Welcome " + yourName + "</h1>").insertBefore("#invoer");
				versturen("/app/connect", {
					'naam' : yourName
				});
				$("#invoer").hide("fast");
			}
		}
		else {
			$(".error").remove();
			$("<p class='error'>De naam mag geeen spaties bevatten</p>").insertAfter("#versturen");
		}
	});
});

$(window).on("beforeunload", function() {
	versturen("/app/verwijderen", {
		'naam' : yourName
	});
	stompClient.disconnect();
});

function behandelRequest(tempUitdaging) {
	var location = "/app/aanvaard";
	if (tempUitdaging.uitgedaagde.naam === yourName) {
		if (!tempUitdaging.aanvaard) {
			if (uitdaging === null || uitdaging.geraden) {
				uitdaging = tempUitdaging;
				$("#uitdaging").append("<p>U wordt uitgedaagd door: " + uitdaging.uitdager.naam + "</p><button id='bevestig'>Aanvaarden</button><button id='weigeren'>Weigeren</button>");
				
				$("#bevestig").on("click", function() {
					uitdaging.aanvaard = true;
					$("#uitdaging").children().remove();
					$("#spel").children().remove();
					$("#foto").children().remove();
					letters = [];
					versturen(location, uitdaging);
				});
				
				$("#weigeren").on("click",function(){
					versturen(location, uitdaging);
					uitdaging = null;
					$("#uitdaging").children().remove();
				});
			}
			else {
				versturen(location, tempUitdaging);
			}
		}
		else {
			uitdaging = tempUitdaging;
			toonPuntjesEnLetters();
			hangman();
		}
	}
}

function versturen(locatie, waarde) {
	stompClient.send(locatie, {}, JSON.stringify(waarde));
}

function overLoopList(teZoekenWaarde) {
	var returnWaarde = null;
	$("li").each(function() {
		if ($(this).text().toLowerCase() === teZoekenWaarde.toLowerCase()) {
			returnWaarde = this;
		}
	});
	return returnWaarde;
}

function behandelResponse(uitgedaagde) {
	$(".error").remove();
	if (uitgedaagde.uitdager.naam === yourName) {
		if (uitgedaagde.aanvaard) {
			if (uitgedaagde.woord === "") {
				nieuweUitdaging(uitgedaagde);
			}
			else {
				resultaat(uitgedaagde);
			}
		}
		else {
			var returnwaarde = overLoopList(uitgedaagde.uitgedaagde.naam);
			$("<p class='error'>" + uitgedaagde.uitgedaagde.naam + " is al een spel aan het spelen</p>").insertAfter(returnwaarde);
		}
	}
}

function nieuweUitdaging(uitgedaagde){
	var locatie = "/app/verzoek";
	var returnValue = overLoopList(uitgedaagde.uitgedaagde.naam);
	$("<div><label>Woord: </label><input type='text' autofocus/><button id='" + uitgedaagde.uitgedaagde.naam + "'>Start</button></div>").insertAfter(returnValue);
	$("#" + uitgedaagde.uitgedaagde.naam + "").on("click", function() {
		var woordje = $(this).prev().val();
		var result = woordje.match(patternCijfers);
		if (woordje !== "" && woordje.indexOf(" ") < 0 && result === null) {
			uitgedaagde.woord = woordje;
			uitgedaagde.uitgedaagde.naam = $(this).attr('id');
			versturen(locatie, uitgedaagde);
			$(this).parent().remove();
		}
		else {
			$(this).parent().children(".error").remove();
			$(this).parent().append("<p class='error'>Het woord mag geen spaties of nummers bevatten</p>");
		}
	});
}

function resultaat(uitgedaagde){
	if (uitgedaagde.geraden) {
		stompClient.subscribe('/app/users', function(users) {
			showUsers(JSON.parse(users.body));
		});
		$("#resultaat").append("<p>Het woord werd geraden door " + uitgedaagde.uitgedaagde.naam);
	}
	else {
		if (uitgedaagde.pogingen > 0) {
			$("li").each(function() {
				var inhoud = $(this).text();
				if (inhoud.indexOf(uitgedaagde.uitgedaagde.naam) >= 0) {
					if (uitgedaagde.pogingen != 10) {
						$(this).text(uitgedaagde.uitgedaagde.naam + " " + uitgedaagde.pogingen);
					}
					else {
						$("#resultaat").append("<p>Het woord werdt niet geraden door " + uitgedaagde.uitgedaagde.naam);
						$(this).text(uitgedaagde.uitgedaagde.naam);
					}
				}
			});
		}
	}
}

function userBestaatNog(users, naam){
	var userbestaatNog = false;
	for(var x = 0; x < users.length; x++){
		if(users[x].naam === naam){
			userbestaatNog = true;
			break;
		}
	}
	return userbestaatNog;
}

function userInLijst(personen){
	for (var x = 0; x < personen.length; x++) {
		if (personen[x].naam !== yourName) {
			var returnwaarde = overLoopList(personen[x].naam);
			if (returnwaarde === null) {
				$("#users").append("<li>" + personen[x].naam + "</li>");
			}
		}
	}
}

function usersControle(personen){
	var userInLijsten = false;
	$("li").each(function() {
		var userInList = $(this).text();
		for (var x = 0; x < personen.length; x++) {
			if (userInList === personen[x].naam) {
				userInLijsten = true;
				break;
			}
		}
		if (!userInLijsten) {
			$(this).remove();
		}
		userInLijsten = false;
	});
}

function showUsers(users) {
	if (uitdaging !== null) {
		if (uitdaging.woord === "") {
			if(!userBestaatNog(users.personen, uitdaging.uitdager.naam)){
				uitdaging = null;
			}
		}
	}
	userInLijst(users.personen);
	usersControle(users.personen);
	$("li").unbind("click").on("click", function(e) {
		e.preventDefault();
		console.log("geklikt");
		if (yourName !== null) {
			var oponent = $(this).text();
			versturen("/app/verzoek", {
				'uitdager' : {
					"naam" : yourName
				},
				'uitgedaagde' : {
					"naam" : oponent
				}
			});
		}
	});
}

function naamcontrole() {
	var vlag = true;
	$(".error").remove();
	var returnwaarde = overLoopList(yourName);
	if(returnwaarde !== null){
		$("<p class='error'>De naam wordt al gebruikt</p>").insertAfter("#versturen");
		vlag = false;
	}
	return vlag;
}

function hangman() {
	var poging = null;
	$("#probeer").on("click", function() {
		var letter = $("#poging").val();
		var result = letter.match(patternLetters);
		if (result !== null && letter !== "") {
			if (letter.length < 2) {
				if ($.inArray(letter, letters) < 0) {
					letters.push(letter.toLowerCase());
					toonPuntjesEnLetters();
					woordControle();
					if (!uitdaging.geraden) {
						poging = pogingenBekijken();
					}
					versturen("/app/aanvaard", uitdaging);
					if (poging) {
						uitdaging = null;
					}
					hangman();
				}
				else {
					fout("Letter al gebruikt");
				}
			}
			else {
				fout("Gelieve maar 1 letter in te vullen");
			}
		}
		else {
			fout("Gelieve een letter in te voeren");
		}
	});
}

function fout(boodschap) {
	$(".error").remove();
	$("<p class='error'>" + boodschap + "</p>").insertAfter("#probeer");
}

function toonPuntjesEnLetters() {
	var length = uitdaging.woord.length;
	var weergave = "";
	for (var i = 0; i < length; i++) {
		for (var x = 0; x < letters.length; x++) {
			if (uitdaging.woord.charAt(i) === letters[x]) {
				weergave += uitdaging.woord.charAt(i);
				break;
			}
		}
		if (weergave.length !== i + 1) {
			weergave += ".";
		}
	}
	$("#spel").children().remove();
	$("#spel").append("<p class='weergave'>" + weergave + "</p>");
	$("<input type='text' id='poging'/> <button id='probeer'>Probeer</button>").insertAfter(".weergave");
}

function pogingenBekijken() {
	var poging = false;
	var foutpoging = 0;
	var woord = uitdaging.woord;
	for (var i = 0; i < letters.length; i++) {
		if (woord.indexOf(letters[i]) < 0) {
			foutpoging++;
		}
	}
	if (foutpoging > 0) {
		uitdaging.pogingen = foutpoging;
		$("#foto").children().remove();
		$("#foto").append("<img src='images/" + foutpoging + ".png' alt='hangman foto'/>");
		if (foutpoging === 10) {
			poging = true;
			$("#spel").children().remove();
			$("#spel").append("<p>u hebt het woord niet gevonden het woord was: " + uitdaging.woord + "</p>");
		}
	}
	return poging;
}

function woordControle() {
	var weergave = $(".weergave").text();
	if (uitdaging.woord === weergave) {
		$("#spel").children().remove();
		$("#spel").append("<p>Profficiat u hebt het woord geraden in " + letters.length + " pogingen</p>");
		uitdaging.geraden = true;
	}
}