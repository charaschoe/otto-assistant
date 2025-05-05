// Einfacher Auth-Test für das Frontend
document.addEventListener("DOMContentLoaded", () => {
	// Supabase Client im Frontend initialisieren
	const supabaseUrl = "https://rbbeytzjbahcossmktis.supabase.co";
	// Public/Anon Key für Frontend-Authentifizierung
	const supabaseAnonKey =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiYmV5dHpqYmFoY29zc21rdGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjgzNDIsImV4cCI6MjA2MjA0NDM0Mn0.F8kjBTAy0uiUhZYKlmbE-fWr7BoGz2kN4n5lpkdMRE4";

	// Supabase Client erstellen - KORREKTUR: supabase statt supabaseClient
	const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

	// Login-Formular-Elemente
	const loginForm = document.getElementById("login-form");
	const emailInput = document.getElementById("login-email");
	const passwordInput = document.getElementById("login-password");
	const loginButton = document.getElementById("login-button");
	const registerButton = document.getElementById("register-button");
	const logoutButton = document.getElementById("logout-button");
	const authMessage = document.getElementById("auth-message");

	// Auth-Status anzeigen
	async function updateAuthUI() {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user) {
			// Benutzer ist angemeldet
			loginForm.classList.add("hidden");
			logoutButton.classList.remove("hidden");
			authMessage.textContent = `Angemeldet als: ${user.email}`;
			authMessage.classList.remove("hidden");

			// Jetzt können wir API-Schlüssel abrufen/speichern
			const apiKeysSection = document.getElementById("api-keys-section");
			apiKeysSection.classList.remove("hidden");
		} else {
			// Benutzer ist nicht angemeldet
			loginForm.classList.remove("hidden");
			logoutButton.classList.add("hidden");
			authMessage.classList.add("hidden");

			// API-Schlüssel-Bereich ausblenden
			const apiKeysSection = document.getElementById("api-keys-section");
			apiKeysSection.classList.add("hidden");
		}
	}

	// Beim Laden der Seite den Auth-Status prüfen
	updateAuthUI();

	// Event-Listener für Login
	loginButton.addEventListener("click", async (e) => {
		e.preventDefault();

		const email = emailInput.value.trim();
		const password = passwordInput.value;

		if (!email || !password) {
			alert("Bitte E-Mail und Passwort eingeben");
			return;
		}

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;

			// UI aktualisieren
			updateAuthUI();
		} catch (error) {
			alert(`Fehler beim Anmelden: ${error.message}`);
		}
	});

	// Event-Listener für Registrierung
	registerButton.addEventListener("click", async (e) => {
		e.preventDefault();

		const email = emailInput.value.trim();
		const password = passwordInput.value;

		if (!email || !password) {
			alert("Bitte E-Mail und Passwort eingeben");
			return;
		}

		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) throw error;

			if (
				data.user &&
				data.user.identities &&
				data.user.identities.length === 0
			) {
				alert("Diese E-Mail-Adresse ist bereits registriert.");
			} else {
				alert(
					"Registrierung erfolgreich! Bitte prüfen Sie Ihre E-Mails für den Bestätigungslink."
				);
			}
		} catch (error) {
			alert(`Fehler bei der Registrierung: ${error.message}`);
		}
	});

	// Event-Listener für Logout
	logoutButton.addEventListener("click", async () => {
		const { error } = await supabase.auth.signOut();

		if (error) {
			alert(`Fehler beim Abmelden: ${error.message}`);
		} else {
			// UI aktualisieren
			updateAuthUI();
		}
	});
});
