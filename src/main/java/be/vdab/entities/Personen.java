package be.vdab.entities;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class Personen {
	private Set<Persoon> personen = new HashSet<Persoon>();
	
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
