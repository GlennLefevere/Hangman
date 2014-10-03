var stompClient = null;
var yourName = null
var uitdaging = null;
var letters = [];
var patternCijfers = /[0-9]/g;
var patternLetters = /[a-z]/i;

$(window).on("load", function() {
	var socket = new SockJS('/hangman');
	stompClient = Stomp.over(socket);
	stompClient.connect("guest", "guest", function(frame) {
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
	});
});

$(window).ready(function() {
	$("#versturen").on("click", function() {
		yourName = $("#naam").val();
		if (yourName.indexOf(" ") < 0) {
			$("<h1>Welcome " + yourName + "</h1>").insertBefore("#invoer");
			if (naamcontrole()) {
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
	if (tempUitdaging.uitgedaagde === yourName) {
		if (!tempUitdaging.aanvaard) {
			if (uitdaging === null || uitdaging.geraden) {
				uitdaging = tempUitdaging;
				$("#uitdaging").append("<p>U wordt uitgedaagd door: " + uitdaging.uitdager + "</p><button id='bevestig'>Aanvaarden</button>");
				$("#bevestig").on("click", function() {
					uitdaging.aanvaard = true;
					$("#uitdaging").children().remove();
					$("#spel").children().remove();
					$("#foto").children().remove();
					letters = [];
					versturen(location, uitdaging);
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

function behandelResponse(uitgedaagde) {
	var locatie = "/app/verzoek";
	if (uitgedaagde.uitdager === yourName) {
		if (uitgedaagde.aanvaard) {
			if (uitgedaagde.woord == "") {
				$("#opgave").append("<label>Woord: </label><input type='text' id='woord' autofocus/><button id='start'>Start</button>");
				$("#start").on("click", function() {
					var woordje = $("#woord").val();
					var result = woordje.match(patternCijfers);
					if (woordje != "" && woordje.indexOf(" ") < 0 && result === null) {
						uitgedaagde.woord = woordje;
						versturen(locatie, uitgedaagde);
						$("#opgave").children().remove();
					}
					else {
						$("#error").remove();
						$("#opgave").append("<p id='error' class='error'>Het woord mag geen spaties of nummers bevatten</p>");
					}
				});
			}
			else {
				if (uitgedaagde.geraden) {
					$("#resultaat").append("<p>Het woord werd geraden door " + uitgedaagde.uitgedaagde);
					$(this).text(uitgedaagde.uitgedaagde);
				}
				else {
					if (uitgedaagde.pogingen > 0) {
						$("li").each(function(index) {
							var inhoud = $(this).text();
							if (inhoud.indexOf(uitgedaagde.uitgedaagde) >= 0) {
								if (uitgedaagde.pogingen != 10) {
									$(this).text(uitgedaagde.uitgedaagde + " " + uitgedaagde.pogingen);
								}
								else {
									$("#resultaat").append("<p>Het woord werdt niet geraden door " + uitgedaagde.uitgedaagde);
									$(this).text(uitgedaagde.uitgedaagde);
								}
							}
						});
					}
				}
			}
		}
		else {
			$("#opgave").append("<p>" + uitgedaagde.uitgedaagde + " is al een spel aan het spelen</p>");
		}
	}
}

function showUsers(users) {
	var userbestaatNog = false;
	$("#uitdaging").remove();
	$("<p id='uitdaging'>Daag een van de volgende spelers uit:</p>").insertBefore("#users");
	$("#users").empty();
	for (var x = 0; x < users.personen.length; x++) {
		if (uitdaging != null) {
			if (uitdaging.woord === "") {
				if (users.personen[x].naam === uitdaging.uitdager) {
					userbestaatNog = true;
				}
			}
		}
		if (users.personen[x].naam !== yourName) {
			$("#users").append("<li>" + users.personen[x].naam + "</li>");
		}
	}
	if (uitdaging != null) {
		if (uitdaging.woord === "") {
			if (!userbestaatNog) {
				uitdaging = null;
			}
		}
	}
	$("li").on("click", function() {
		if (yourName !== null) {
			var oponent = $(this).text();
			versturen("/app/verzoek", {
				'uitdager' : yourName,
				'uitgedaagde' : oponent
			});
		}
	});
}

function naamcontrole() {
	var vlag = true;
	$(".error").remove();
	$("li").each(function(index) {
		if ($(this).text().toLowerCase() === yourName.toLowerCase()) {
			$("<p class='error'>De naam wordt al gebruikt</p>").insertAfter("#versturen");
			vlag = false;
		}
	});
	return vlag;
}

function hangman() {
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
						pogingenBekijken();
					}
					versturen("/app/aanvaard", uitdaging);
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
	$("#fout").remove();
	$("<p class='error' id='fout'>" + boodschap + "</p>").insertAfter("#probeer");
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
		$("#foto").append("<img src='images/" + foutpoging + ".png' alt='hangman foto'/>")
		if (foutpoging === 10) {
			$("#spel").children().remove();
			$("#spel").append("<p>u hebt het woord niet gevonden het woord was: " + uitdaging.woord + "</p>");
		}
	}
}

function woordControle() {
	var weergave = $(".weergave").text();
	if (uitdaging.woord === weergave) {
		$("#spel").children().remove();
		$("#spel").append("<p>Profficiat u hebt het woord geraden in " + letters.length + " pogingen</p>");
		uitdaging.geraden = true;
	}
}