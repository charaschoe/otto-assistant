const PDFDocument = require("pdfkit");
const fs = require("fs");

/**
 * Generiert ein PDF-Dokument aus dem Transkriptionstext
 *
 * @param {string} text Der zu exportierende Transkriptionstext
 * @param {string} outputPath Pfad, unter dem das PDF gespeichert werden soll
 * @returns {Promise<string>} Pfad zur generierten PDF-Datei
 */
async function generatePDF(text, outputPath) {
	return new Promise((resolve, reject) => {
		try {
			// Neues PDF-Dokument erstellen
			const doc = new PDFDocument({
				margin: 50,
				size: "A4",
			});

			// Stream zum Dateisystem
			const stream = fs.createWriteStream(outputPath);

			// Fehlerbehandlung für den Stream
			stream.on("error", (err) => {
				reject(err);
			});

			// Wenn das PDF fertig ist, Promise resolven
			stream.on("finish", () => {
				resolve(outputPath);
			});

			// PDF-Dokument mit dem Stream verbinden
			doc.pipe(stream);

			// PDF-Metadaten
			doc.info.Title = "Transkription";
			doc.info.Author = "Otto Assistant";
			doc.info.Creator = "Otto Transcription Service";

			// Titel
			doc.fontSize(24).font("Helvetica-Bold").text("Transkription", {
				align: "center",
			});

			// Datum
			doc.moveDown()
				.fontSize(12)
				.font("Helvetica-Oblique")
				.text(`Erstellt am ${new Date().toLocaleDateString()}`, {
					align: "center",
				});

			// Trennlinie
			doc.moveDown()
				.moveTo(50, doc.y)
				.lineTo(doc.page.width - 50, doc.y)
				.stroke();

			// Hauptinhalt
			doc.moveDown().font("Helvetica").fontSize(12).text(text, {
				align: "justify",
				lineGap: 5,
			});

			// Seitenzahlen
			const totalPages = doc.bufferedPageRange().count;
			for (let i = 0; i < totalPages; i++) {
				doc.switchToPage(i);

				// Fußzeile
				doc.fontSize(10).text(
					`Seite ${i + 1} von ${totalPages}`,
					50,
					doc.page.height - 50,
					{ align: "center", width: doc.page.width - 100 }
				);
			}

			// PDF abschließen
			doc.end();
		} catch (error) {
			reject(error);
		}
	});
}

module.exports = { generatePDF };
