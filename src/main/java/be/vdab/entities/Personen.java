package be.vdab.entities;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

public class Personen {
	private Set<Persoon> personen = new CopyOnWriteArraySet<Persoon>();
	
	public Set<Persoon> getPersonen(){
		return Collections.unmodifiableSet(personen);
	}
	
	public void addPersoon(Persoon persoon){
		personen.add(persoon);
	}
	
	public void removePersoon(Persoon persoon){
		for (Persoon person : personen) {
			if(person.getNaam().equalsIgnoreCase(persoon.getNaam())){
				personen.remove(person);
				break;
			}
		}
	}
}
//todo bij /verwijder een signiaal sturen dat de persoon gestopt is