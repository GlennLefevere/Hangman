package be.vdab.entities;

public class Uitdaging {
	private String uitdager = "";
	private String uitgedaagde = "";
	private boolean aanvaard = false;
	private String woord = "";
	private int pogingen = 0;
	
	public boolean getAanvaard(){
		return aanvaard;
	}
	
	public String getWoord() {
		return woord;
	}

	public int getPogingen() {
		return pogingen;
	}

	public String getUitdager() {
		return uitdager;
	}
	public String getUitgedaagde() {
		return uitgedaagde;
	}
}
