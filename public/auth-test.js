// Einfacher Auth-Test für das Frontend
document.addEventListener("DOMContentLoaded", () => {
	// Supabase Client im Frontend initialisieren
	const supabaseUrl = "https://rbbeytzjbahcossmktis.supabase.co";
	// Public/Anon Key für Frontend-Authentifizierung
	const supabaseAnonKey =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiYmV5dHpqYmFoY29zc21rdGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjgzNDIsImV4cCI6MjA2MjA0NDM0Mn0.F8kjBTAy0uiUhZYKlmbE-fWr7BoGz2kN4n5lpkdMRE4";

	// Prüfen, ob die Supabase-Bibliothek geladen wurde
	if (typeof supabase === "undefined") {
		console.error(
			"Supabase-Client nicht gefunden. Stellen Sie sicher, dass die Supabase-Bibliothek vor diesem Script eingebunden ist."
		);
		return;
	}

	// Supabase Client erstellen - Korrektur: supabaseClient statt supabase
	const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

	// Login-Formular-Elemente
	const loginForm = document.getElementById("login-form");
	const emailInput = document.getElementById("login-email");
	const passwordInput = document.getElementById("login-password");
	const loginButton = document.getElementById("login-button");
	const registerButton = document.getElementById("register-button");

	// Status-Anzeige
	const authStatus = document.getElementById("auth-status");

	// Prüfen, ob der Benutzer bereits angemeldet ist
	checkAuthStatus();

	// Login-Formular-Handler
	if (loginForm) {
		loginForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			await handleLogin();
		});
	}

	// Login-Button-Handler
	if (loginButton) {
		loginButton.addEventListener("click", async () => {
			await handleLogin();
		});
	}

	// Register-Button-Handler
	if (registerButton) {
		registerButton.addEventListener("click", async () => {
			await handleRegister();
		});
	}

	// Login-Funktion
	async function handleLogin() {
		if (!emailInput || !passwordInput) {
			showMessage(
				"E-Mail- oder Passwort-Eingabefeld nicht gefunden",
				"error"
			);
			return;
		}

		const email = emailInput.value;
		const password = passwordInput.value;

		if (!email || !password) {
			showMessage("Bitte geben Sie E-Mail und Passwort ein", "error");
			return;
		}

		try {
			const { data, error } =
				await supabaseClient.auth.signInWithPassword({
					email,
					password,
				});

			if (error) throw error;

			showMessage("Erfolgreich angemeldet!", "success");
			checkAuthStatus();
		} catch (error) {
			console.error("Login-Fehler:", error);
			showMessage(`Anmeldung fehlgeschlagen: ${error.message}`, "error");
		}
	}

	// Registrierung-Funktion
	async function handleRegister() {
		if (!emailInput || !passwordInput) {
			showMessage(
				"E-Mail- oder Passwort-Eingabefeld nicht gefunden",
				"error"
			);
			return;
		}

		const email = emailInput.value;
		const password = passwordInput.value;

		if (!email || !password) {
			showMessage("Bitte geben Sie E-Mail und Passwort ein", "error");
			return;
		}

		try {
			const { data, error } = await supabaseClient.auth.signUp({
				email,
				password,
			});

			if (error) throw error;

			showMessage(
				"Registrierung erfolgreich! Bitte prüfen Sie Ihre E-Mails zur Bestätigung.",
				"success"
			);
		} catch (error) {
			console.error("Registrierungsfehler:", error);
			showMessage(
				`Registrierung fehlgeschlagen: ${error.message}`,
				"error"
			);
		}
	}

	// Auth-Status überprüfen
	async function checkAuthStatus() {
		try {
			const {
				data: { user },
			} = await supabaseClient.auth.getUser();

			if (user) {
				if (authStatus) {
					authStatus.innerHTML = `
            <p class="status-ok">Angemeldet als: ${user.email}</p>
            <button id="logout-button" class="btn danger">Abmelden</button>
          `;

					document
						.getElementById("logout-button")
						.addEventListener("click", handleLogout);
				}

				// Optional: Verstecke Login-Formular wenn angemeldet
				if (loginForm) loginForm.style.display = "none";
			} else {
				if (authStatus) {
					authStatus.innerHTML =
						'<p class="status-error">Nicht angemeldet</p>';
				}

				// Optional: Zeige Login-Formular wenn nicht angemeldet
				if (loginForm) loginForm.style.display = "block";
			}
		} catch (error) {
			console.error("Fehler beim Prüfen des Auth-Status:", error);
			if (authStatus) {
				authStatus.innerHTML = `<p class="status-error">Fehler: ${error.message}</p>`;
			}
		}
	}

	// Abmelden
	async function handleLogout() {
		try {
			const { error } = await supabaseClient.auth.signOut();

			if (error) throw error;

			showMessage("Erfolgreich abgemeldet", "success");
			checkAuthStatus();
		} catch (error) {
			console.error("Abmelde-Fehler:", error);
			showMessage(`Abmeldung fehlgeschlagen: ${error.message}`, "error");
		}
	}

	// Hilfsfunktion: Nachrichten anzeigen
	function showMessage(message, type = "info") {
		const messageContainer = document.getElementById("message-container");

		if (!messageContainer) {
			console.log(message);
			return;
		}

		const messageElement = document.createElement("div");
		messageElement.className = `message ${type}`;
		messageElement.textContent = message;

		messageContainer.innerHTML = "";
		messageContainer.appendChild(messageElement);

		// Nachricht nach 5 Sekunden ausblenden
		setTimeout(() => {
			messageElement.style.opacity = "0";
			setTimeout(() => {
				messageContainer.removeChild(messageElement);
			}, 500);
		}, 5000);
	}
});
