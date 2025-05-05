// Auth-Middleware für die Benutzerauthentifizierung
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// JWT Secret (sollte in Umgebungsvariablen gesetzt werden)
const JWT_SECRET =
	process.env.JWT_SECRET || "defaultJwtSecret_ChangeThisInProduction!";

// Middleware zur Token-Validierung
function authenticate(req, res, next) {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(" ")[1];

		jwt.verify(token, JWT_SECRET, (err, user) => {
			if (err) {
				return res
					.status(403)
					.json({ error: "Ungültiges oder abgelaufenes Token" });
			}

			req.user = user;
			next();
		});
	} else {
		res.status(401).json({ error: "Authentifizierung erforderlich" });
	}
}

// Generiert ein neues Benutzerkonto oder meldet einen bestehenden Benutzer an
async function createUserToken(email, password) {
	// In einer echten Anwendung würde hier die Passwortvalidierung stattfinden
	// Hier vereinfacht als Demo-Implementierung

	// Benutzer-ID generieren oder abrufen (hier simuliert)
	const userId = uuidv4();

	const token = jwt.sign({ id: userId, email }, JWT_SECRET, {
		expiresIn: "30d",
	});

	return { token, userId };
}

module.exports = {
	authenticate,
	createUserToken,
};
