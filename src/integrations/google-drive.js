const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const TOKEN_PATH = path.join(__dirname, "../../config/token.json");
const CREDENTIALS_PATH = path.join(
	__dirname,
	"../../client_secret_534581237338-v35pn0363encbfmud73q01981loqi9v9.apps.googleusercontent.com.json"
);

async function authenticateGoogle() {
	const content = fs.readFileSync(CREDENTIALS_PATH, "utf8");
	const credentials = JSON.parse(content);
	const { client_secret, client_id } = credentials.web;
	const oAuth2Client = new google.auth.OAuth2(
		client_id,
		client_secret,
		"urn:ietf:wg:oauth:2.0:oob"
	);

	if (fs.existsSync(TOKEN_PATH)) {
		const token = fs.readFileSync(TOKEN_PATH, "utf8");
		oAuth2Client.setCredentials(JSON.parse(token));
		return oAuth2Client;
	} else {
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: "offline",
			scope: SCOPES,
		});
		console.log("Authorize this app by visiting this url:", authUrl);
		const rl = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		const code = await new Promise((resolve) =>
			rl.question("Enter the code from that page here: ", resolve)
		);
		rl.close();
		const { tokens } = await oAuth2Client.getToken(code);
		oAuth2Client.setCredentials(tokens);
		fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
		console.log("Token stored to", TOKEN_PATH);
		return oAuth2Client;
	}
}

async function uploadToGoogleDrive(auth, filePath, fileName) {
	const drive = google.drive({ version: "v3", auth });
	const fileMetadata = { name: fileName };
	const media = {
		mimeType: "application/octet-stream",
		body: fs.createReadStream(filePath),
	};

	const response = await drive.files.create({
		resource: fileMetadata,
		media: media,
		fields: "id",
	});

	console.log("File uploaded to Google Drive with ID:", response.data.id);
}

module.exports = { authenticateGoogle, uploadToGoogleDrive };
