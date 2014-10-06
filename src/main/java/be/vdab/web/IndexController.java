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
	
	/*@SubscribeMapping("/uitdaging")
	public Uitdaging uitdagingen(){
		Persoon uitgedaagde = new Persoon();
		uitgedaagde.setNaam("pol");
		Persoon uitdager = new Persoon();
		uitdager.setNaam("jos");
		Uitdaging uitdaging = new Uitdaging();
		uitdaging.setUitgedaagde(uitgedaagde);
		uitdaging.setUitdager(uitdager);
		return uitdaging;
	}*/
}
