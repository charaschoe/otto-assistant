// Auth-Service für Supabase Authentifizierung
import supabase from "../config/supabase.js";

// Benutzer registrieren
export async function signUp(email, password) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error) {
		throw error;
	}

	return data;
}

// Benutzer anmelden
export async function signIn(email, password) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		throw error;
	}

	return data;
}

// Benutzer abmelden
export async function signOut() {
	const { error } = await supabase.auth.signOut();

	if (error) {
		throw error;
	}

	return true;
}

// Aktuellen Benutzer abrufen
export async function getCurrentUser() {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
}

// Benutzer-Session abrufen
export async function getSession() {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	return session;
}

// Passwort zurücksetzen
export async function resetPassword(email) {
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${window.location.origin}/reset-password`,
	});

	if (error) {
		throw error;
	}

	return true;
}

// Passwort aktualisieren
export async function updatePassword(newPassword) {
	const { error } = await supabase.auth.updateUser({
		password: newPassword,
	});

	if (error) {
		throw error;
	}

	return true;
}

// Benutzer-Session überprüfen (Middleware)
export function authMiddleware(req, res, next) {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res
			.status(401)
			.json({ error: "Authentifizierung erforderlich" });
	}

	const token = authHeader.split(" ")[1];

	// Verifiziere Token mit Supabase
	supabase.auth
		.getUser(token)
		.then(({ data: { user }, error }) => {
			if (error || !user) {
				return res
					.status(403)
					.json({ error: "Ungültiges oder abgelaufenes Token" });
			}

			// Benutzer zum Request hinzufügen
			req.user = user;
			next();
		})
		.catch((error) => {
			console.error("Auth Middleware Error:", error);
			res.status(500).json({
				error: "Server-Fehler bei der Authentifizierung",
			});
		});
}
