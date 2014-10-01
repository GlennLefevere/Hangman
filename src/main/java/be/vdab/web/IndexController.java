package be.vdab.web;

import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
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
	@SendTo("/topic/waiting")
	public Uitdaging aanvaard(Uitdaging uitdaging){
		System.out.println(uitdaging.getUitdager());
		return uitdaging;
	}
	
	@MessageExceptionHandler
	@SendTo("/queue/errors")
	public String handleException(Throwable exception){
		System.out.println(exception.getMessage());
		return exception.getMessage();
	}
	
	@SubscribeMapping("/users")
	public Personen getPersonenBijLoad(){
		return personen;
	}
}// TODO gebruik de uitdaging met false om aan te tonen dat de persoon al een spel aan het spelen is
