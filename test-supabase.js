// Test-Skript für Supabase-Verbindung
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Lade Umgebungsvariablen
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
	console.error("Fehlende Supabase-Umgebungsvariablen!");
	process.exit(1);
}

// Erstelle Supabase-Client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
	try {
		// Teste Auth-Einstellungen
		const { data: authSettings, error: authError } = await supabase
			.from("auth.config")
			.select("*")
			.limit(1);

		if (authError) {
			console.log(
				"Auth-Test fehlgeschlagen, aber das ist normal, wenn Sie keine Berechtigungen haben."
			);
		} else {
			console.log("Auth-Einstellungen abgerufen:", authSettings);
		}

		// Prüfe, ob Tabellen existieren
		const { data: tables, error: tablesError } = await supabase.rpc(
			"get_tables"
		);

		if (tablesError) {
			console.error("Fehler beim Abrufen der Tabellen:", tablesError);
		} else {
			console.log("Verfügbare Tabellen:");
			tables.forEach((table) => {
				console.log(`- ${table.name}`);
			});

			// Prüfe, ob unsere benötigten Tabellen vorhanden sind
			const requiredTables = ["credentials", "transcripts"];
			const missingTables = requiredTables.filter(
				(table) => !tables.some((t) => t.name === table)
			);

			if (missingTables.length > 0) {
				console.warn(`Fehlende Tabellen: ${missingTables.join(", ")}`);
				console.log("Bitte erstellen Sie diese Tabellen in Supabase.");
			} else {
				console.log("Alle benötigten Tabellen sind vorhanden.");
			}
		}

		console.log("Supabase-Verbindungstest abgeschlossen!");
	} catch (error) {
		console.error("Fehler beim Testen der Supabase-Verbindung:", error);
	}
}

testConnection();
