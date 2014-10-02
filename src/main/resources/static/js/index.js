var stompClient = null;
	var yourName = null
	var uitdaging = null;
	var letters = [];
	$(window).on("load", function() {
		var socket = new SockJS('/hangman');
		stompClient = Stomp.over(socket);
		stompClient.connect("guest", "guest", function(frame) {
			stompClient.subscribe('/topic/users', function(users) {
				showUsers(JSON.parse(users.body));
			});
			stompClient.subscribe('/topic/request', function(request) {
				var tempUitdaging = JSON.parse(request.body);
				if (tempUitdaging.uitgedaagde === yourName) {
					uitdaging = tempUitdaging;
					if (!uitdaging.aanvaard) {
						$("#uitdaging").append("<p>U wordt uitgedaagd door: " + uitdaging.uitdager + "</p><button id='bevestig'>Aanvaarden</button>");
						$("#bevestig").on("click", function(){
							uitdaging.aanvaard = true;
							$("#uitdaging").children().remove();
							stompClient.send("/app/aanvaard", {}, JSON.stringify(uitdaging));
						});
					}
					else{
						console.log(uitdaging);
						hangman();
					}
				}
			});
			stompClient.subscribe('/app/users', function(users) {
				showUsers(JSON.parse(users.body));
			});
			stompClient.subscribe('/topic/response', function(response) {
				var uitgedaagde = JSON.parse(response.body);
				if (uitgedaagde.uitdager === yourName) {
					if(uitgedaagde.aanvaard){
						if(uitgedaagde.woord == ""){
							$("#opgave").children().remove();
							$("#opgave").append("<label>Woord: </label><input type='text' id='woord'/><button id='start'>Start</button>");
							$("#start").on("click", function(){
								var woordje = $("#woord").val();
								if(woordje != ""){
									uitgedaagde.woord = woordje;
									stompClient.send("/app/verzoek", {}, JSON.stringify(uitgedaagde));
									$("#opgave").children().remove();
								}
							});
						}
						else{
							if(uitgedaagde.pogingen > 0){
								$("li").each(function(index){
									var inhoud = $(this).text();
									if(inhoud.indexOf(uitgedaagde.uitgedaagde) >= 0){
										$(this).text(uitgedaagde.uitgedaagde + " " + uitgedaagde.pogingen);
									}
								});
							}
						}
					}
					else{
						// TODO: hier zeggen dat de speler al bezig is met een spel
					}
				}
			});
		});
	});
	
	$(window).ready(function() {
		$("#versturen").on("click", function() {
			yourName = $("#naam").val();
			if (naamcontrole()) {
				stompClient.send("/app/connect", {}, JSON.stringify({
					'naam' : yourName
				}));
				$("#invoer").hide("fast");
			}
		});
	});

	$(window).on("beforeunload", function() {
		stompClient.send("/app/verwijderen", {}, JSON.stringify({
			'naam' : yourName
		}));
		stompClient.disconnect();
	})

	function showUsers(users) {
		$("#users").empty();
		for (var x = 0; x < users.personen.length; x++) {
			if (users.personen[x].naam !== yourName) {
				$("#users").append("<li>" + users.personen[x].naam + "</li>");
			}
		}
		$("li").on("click", function() {
			if (yourName !== null) {
				var oponent = $(this).text();
				stompClient.send("/app/verzoek", {}, JSON.stringify({
					'uitdager' : yourName,
					'uitgedaagde' : oponent
				}));
			}
		});
	}
	function naamcontrole() {
		var vlag = true;
		$(".error").remove();
		$("li").each(function(index) {
			if ($(this).text().toLowerCase() === yourName.toLowerCase()) {
				$("<p class='error'>De naam wordt al gebruikt</p>").insertAfter("#naam");
				vlag = false;
			}
		});
		return vlag;
	}
	
	function hangman(){
		toonPuntjesEnLetters();
		$("#probeer").on("click", function(){
			 var letter = $("#poging").val();
			 if(letter !== "" && $.inArray(letter, letters) < 0 && letter.length < 2){
				 letters.push(letter);
				 woordControle();
				 if(!uitdaging.geraden){
					 pogingenBekijken();
				 }
				 stompClient.send("/app/aanvaard", {}, JSON.stringify(uitdaging));
				 hangman();
			 }
		});
	}
	
	function toonPuntjesEnLetters(){
		var length = uitdaging.woord.length;
		var weergave = "";
		for(var i = 0; i < length; i++){
			for(var x = 0; x < letters.length; x++){
				if(uitdaging.woord.charAt(i) === letters[x]){
					weergave += uitdaging.woord.charAt(i);
					break;
				}
			}
			if(weergave.length !== i+1){
				weergave += ".";	
			}
		}
		$("#spel").children().remove();
		$("#spel").append("<p class='weergave'>" + weergave + "</p>");
		$("<input type='text' id='poging'/> <button id='probeer'>Probeer</button>").insertAfter(".weergave");
	}
	
	function pogingenBekijken(){
		var foutpoging = 0;
		var woord = uitdaging.woord;
		if(letters.length > 1){
			for(var i = 0; i < letters.length; i++){
				if(woord.indexOf(letters[i]) < 0){
					foutpoging++;
				}
			}
		}
		if(foutpoging > 0){
			uitdaging.pogingen = foutpoging;
			$("#foto").children().remove();
			$("#foto").append("<img src='images/" + foutpoging +".png' alt='hangman foto'/>")
			if(foutpoging === 10){
				$("#spel").children().remove();
				$("#spel").append("<p>u hebt het woord niet gevonden het woord was: " + uitdaging.woord + "</p>");
			}
		}
	}
	function woordControle(){
		var weergave = $(".weergave").text();
		if(uitdaging.woord === weergave){
			$("#spel").children().remove();
			$("#spel").append("<p>Profficiat u hebt het woord geraden in " + letters.length +" pogingen</p>");
			uitdaging.geraden = true;
		}
	}