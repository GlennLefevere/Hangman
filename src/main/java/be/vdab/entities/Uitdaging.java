package be.vdab.entities;

public class Uitdaging {
	private String uitdager = "";
	private String uitgedaagde = "";
	private boolean aanvaard = false;
	private String woord = "";
	private int pogingen = 0;
	private boolean geraden = false;
	
	public boolean isGeraden() {
		return geraden;
	}

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
