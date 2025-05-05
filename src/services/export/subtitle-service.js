const fs = require("fs");

/**
 * Generiert Untertitel-Dateien (SRT und VTT) aus dem Transkriptionstext
 *
 * @param {string} text Der zu exportierende Transkriptionstext
 * @param {object} options Optionen für die Untertitel
 * @returns {Promise<object>} Pfade zu den erstellten Untertitel-Dateien
 */
async function generateSubtitles(text, options = {}) {
	return new Promise((resolve, reject) => {
		try {
			const {
				srtPath,
				vttPath,
				maxLineLength = 40, // Maximale Zeichen pro Zeile
				duration = 3000, // Millisekunden pro Untertitel
				overlap = 500, // Überlappung zwischen Untertiteln
			} = options;

			if (!srtPath && !vttPath) {
				throw new Error(
					"Mindestens ein Ausgabepfad (SRT oder VTT) muss angegeben werden"
				);
			}

			// Text in Teile aufteilen (einfaches Splitting nach Punkten)
			let sentences = text.split(/(?<=[.!?])\s+/);

			// Sehr lange Sätze in kürzere Teile aufteilen
			const segments = [];
			for (const sentence of sentences) {
				if (sentence.length <= maxLineLength) {
					segments.push(sentence);
				} else {
					// Lange Sätze an geeigneten Stellen aufteilen
					let remainingSentence = sentence;
					while (remainingSentence.length > maxLineLength) {
						// Suche nach einem geeigneten Trennzeichen (Komma, Semikolon, etc.)
						let splitPos = remainingSentence
							.substring(0, maxLineLength)
							.lastIndexOf(", ");
						if (splitPos === -1)
							splitPos = remainingSentence
								.substring(0, maxLineLength)
								.lastIndexOf(" ");
						if (splitPos === -1) splitPos = maxLineLength; // Hartschnitt, wenn kein Trennzeichen gefunden wird

						segments.push(
							remainingSentence.substring(0, splitPos + 1)
						);
						remainingSentence = remainingSentence.substring(
							splitPos + 1
						);
					}
					if (remainingSentence.length > 0) {
						segments.push(remainingSentence);
					}
				}
			}

			// SRT-Format generieren
			let srtContent = "";
			let vttContent = "WEBVTT\n\n";

			segments.forEach((segment, index) => {
				const segmentIndex = index + 1;
				const startTime = index * (duration - overlap);
				const endTime = startTime + duration;

				// Formatierte Zeitangaben
				const startTimeFormatted = formatTime(startTime, "srt");
				const endTimeFormatted = formatTime(endTime, "srt");
				const startTimeFormattedVtt = formatTime(startTime, "vtt");
				const endTimeFormattedVtt = formatTime(endTime, "vtt");

				// SRT-Format
				srtContent += `${segmentIndex}\n`;
				srtContent += `${startTimeFormatted} --> ${endTimeFormatted}\n`;
				srtContent += `${segment}\n\n`;

				// VTT-Format
				vttContent += `${segmentIndex}\n`;
				vttContent += `${startTimeFormattedVtt} --> ${endTimeFormattedVtt}\n`;
				vttContent += `${segment}\n\n`;
			});

			// Dateien speichern
			if (srtPath) {
				fs.writeFileSync(srtPath, srtContent, "utf8");
			}

			if (vttPath) {
				fs.writeFileSync(vttPath, vttContent, "utf8");
			}

			resolve({
				srt: srtPath,
				vtt: vttPath,
			});
		} catch (error) {
			reject(error);
		}
	});
}

/**
 * Formatiert eine Zeit in Millisekunden in das SRT- oder VTT-Format
 *
 * @param {number} milliseconds Zeit in Millisekunden
 * @param {string} format 'srt' oder 'vtt'
 * @returns {string} Formatierte Zeit
 */
function formatTime(milliseconds, format = "srt") {
	const totalSeconds = Math.floor(milliseconds / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const ms = milliseconds % 1000;

	if (format === "vtt") {
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms
			.toString()
			.padStart(3, "0")}`;
	} else {
		// SRT
		return `${hours.toString().padStart(2, "0")}:${minutes
			.toString()
			.padStart(2, "0")}:${seconds.toString().padStart(2, "0")},${ms
			.toString()
			.padStart(3, "0")}`;
	}
}

module.exports = { generateSubtitles };
