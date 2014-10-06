package be.vdab.web;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import be.vdab.entities.Personen;
import be.vdab.entities.Persoon;
import be.vdab.entities.Uitdaging;

@Controller
public class IndexController {
	Personen personen = new Personen();
	
	@MessageMapping("/connect")
	@SendTo("/topic/users")
	public Personen getPersonen(Persoon persoon){
		personen.addPersoon(persoon);
		return personen;
	}
	
	@MessageMapping("/verzoek")
	@SendTo("/topic/request")
	public Uitdaging verzoek(Uitdaging uitdaging){
		return uitdaging;
	}

	@MessageMapping("/verwijderen")
	@SendTo("/topic/users")
	public Personen persoonVerwijderen(Persoon persoon){
		personen.removePersoon(persoon);
		return personen;
	}

	@MessageMapping("/aanvaard")
	@SendTo("/topic/response")
	public Uitdaging aanvaard(Uitdaging uitdaging){
		return uitdaging;
	}
	
	@SubscribeMapping("/users")
	public Personen getPersonenBijLoad(){
		return personen;
	}
	
	@SubscribeMapping("/charachters")
	public Character[] bla(){
		Character[] letters = {'a', 'b'};
		return letters;
	}
	
	@MessageMapping("/controle")
	@SendTo("/topic/checked")
	public Uitdaging controle(Uitdaging uitdaging){
		int teller = 0;
		StringBuilder weergave = new StringBuilder();
		String woord = uitdaging.getWoord();
		char characters[] = woord.toCharArray();
		for (int i = 0; i< characters.length; i++) {
			for (Character letter : uitdaging.getLetters()) {
				if(letter.equals(characters[i])){
					weergave.append(characters[i]);
					teller++;
					break;
				}
			}
			if(weergave.length() != i+1){
				weergave.append(".");
			}
		}
		uitdaging.setWeergave(weergave.toString());
		if(teller == woord.length()){
			uitdaging.setGeraden(true);
		}
		else{
			uitdaging.setPogingen(uitdaging.getPogingen() + 1);
		}
		return uitdaging;
	}

	
}
