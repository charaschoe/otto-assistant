// Korrekte Implementierung der Startseite mit funktionierender Aufnahme
document.addEventListener("DOMContentLoaded", () => {
	// DOM-Elemente
	const startRecordingBtn = document.getElementById("start-recording");
	const stopRecordingBtn = document.getElementById("stop-recording");
	const recordingStatus = document.getElementById("recording-status");
	const recordingTimer = document.getElementById("recording-timer");
	const audioFileInput = document.getElementById("audio-file");
	const uploadForm = document.getElementById("upload-form");
	const statusInfo = document.getElementById("status-info");
	const processIndicator = document.getElementById("process-indicator");
	const resultSection = document.getElementById("result-section");
	const loadingSection = document.getElementById("loading-section");

	// Tabs
	const tabButtons = document.querySelectorAll(".tab-btn");
	const tabContents = document.querySelectorAll(".tab-content");
	const resultTabs = document.querySelectorAll(".result-tab");
	const resultContents = document.querySelectorAll(".result-content");

	// Ergebnis-Bereich
	const resultText = document.getElementById("result-text");
	const summaryText = document.getElementById("summary-text");
	const copyBtn = document.getElementById("copy-btn");
	const downloadBtn = document.getElementById("download-btn");
	const newTranscriptionBtn = document.getElementById(
		"new-transcription-btn"
	);

	// Prozess-Schritte
	const processSteps = {
		recording: document.getElementById("step-recording"),
		transcribing: document.getElementById("step-transcribing"),
		ai: document.getElementById("step-ai"),
		exporting: document.getElementById("step-exporting"),
	};
	const processDetails = document.getElementById("process-details");

	// Ausgabe-Optionen
	const outputOptions = {
		txt: document.getElementById("option-txt"),
		markdown: document.getElementById("option-md"),
		pdf: document.getElementById("option-pdf"),
		clipboard: document.getElementById("option-clipboard"),
		obsidian: document.getElementById("option-obsidian"),
		obsidianVault: document.getElementById("obsidian-vault"),
		notion: document.getElementById("option-notion"),
		notionDatabase: document.getElementById("notion-database"),
		display: document.getElementById("option-display"),
		subtitles: document.getElementById("option-subtitles"),
		gemini: document.getElementById("option-gemini"),
	};

	// Aufnahme-Variablen
	let mediaRecorder;
	let audioChunks = [];
	let startTime;
	let timerInterval;
	let recordingDuration = 10000; // 10 Sekunden

	// ===== EVENTS =====

	// Tab-Navigation
	tabButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const tabName = button.getAttribute("data-tab");

			// Aktive Klasse entfernen
			tabButtons.forEach((btn) => btn.classList.remove("active"));
			tabContents.forEach((content) =>
				content.classList.remove("active")
			);

			// Aktive Klasse hinzufügen
			button.classList.add("active");
			document.getElementById(`${tabName}-tab`).classList.add("active");
		});
	});

	// Ergebnis-Tab-Navigation
	resultTabs.forEach((button) => {
		button.addEventListener("click", () => {
			const tabName = button.getAttribute("data-tab");

			// Aktive Klasse entfernen
			resultTabs.forEach((btn) => btn.classList.remove("active"));
			resultContents.forEach((content) =>
				content.classList.remove("active")
			);

			// Aktive Klasse hinzufügen
			button.classList.add("active");
			document
				.getElementById(`${tabName}-content`)
				.classList.add("active");
		});
	});

	// Aufnahme starten
	if (startRecordingBtn) {
		startRecordingBtn.addEventListener("click", startRecording);
		console.log("Start-Recording-Button gefunden und Listener angehängt");
	}

	// Aufnahme stoppen
	if (stopRecordingBtn) {
		stopRecordingBtn.addEventListener("click", stopRecording);
		console.log("Stop-Recording-Button gefunden und Listener angehängt");
	}

	// Formular absenden
	if (uploadForm) {
		uploadForm.addEventListener("submit", function (e) {
			e.preventDefault();
			handleUpload();
		});
	}

	// Ergebnis-Aktionen
	if (copyBtn) copyBtn.addEventListener("click", copyToClipboard);
	if (downloadBtn) downloadBtn.addEventListener("click", downloadTranscript);
	if (newTranscriptionBtn)
		newTranscriptionBtn.addEventListener("click", resetUI);

	// ===== FUNKTIONEN =====

	// Systemstatus prüfen
	async function checkSystemStatus() {
		try {
			if (statusInfo) {
				statusInfo.innerHTML = "<p>Prüfe Systemstatus...</p>";

				console.log("Rufe /api/system-status auf...");
				const response = await fetch("/api/system-status");
				console.log("Systemstatus Response erhalten:", response.status);

				if (!response.ok) {
					throw new Error(
						`Server-Fehler: ${response.status} ${response.statusText}`
					);
				}

				const data = await response.json();
				console.log("Systemstatus Daten:", data);

				// Status-Anzeige aktualisieren
				let statusHTML = "";

				if (data.whisper) {
					statusHTML += `<p class="status-ok">✅ Whisper: ${data.whisper}</p>`;
				} else {
					statusHTML += `<p class="status-error">❌ Whisper nicht gefunden!</p>`;
					if (startRecordingBtn) startRecordingBtn.disabled = true;
				}

				statusHTML += `<p>Unterstützte Exportformate:</p><ul>`;
				if (data.supportedExports && data.supportedExports.length > 0) {
					data.supportedExports.forEach((format) => {
						statusHTML += `<li class="status-ok">✅ ${format}</li>`;
					});
				} else {
					statusHTML += `<li class="status-error">❌ Keine Exportformate gefunden</li>`;
				}
				statusHTML += `</ul>`;

				statusInfo.innerHTML = statusHTML;
			}
		} catch (error) {
			console.error("Fehler beim Abrufen des Systemstatus:", error);
			if (statusInfo) {
				statusInfo.innerHTML = `
          <p class="status-error">❌ Fehler beim Verbinden mit dem Server: ${error.message}</p>
          <p>Bitte stellen Sie sicher, dass der Server läuft und erreichbar ist.</p>
          <button id="retry-status" class="btn primary">Erneut versuchen</button>
        `;

				// Retry-Button
				const retryBtn = document.getElementById("retry-status");
				if (retryBtn) {
					retryBtn.addEventListener("click", checkSystemStatus);
				}
			}
		}
	}

	// Aufnahme starten
	async function startRecording() {
		console.log("Starte Aufnahme...");
		try {
			// UI zurücksetzen
			resetUI();

			// Prozessindikator anzeigen
			if (processIndicator) {
				processIndicator.classList.remove("hidden");
				updateProcessStep("recording");
			}

			// Mikrofon-Zugriff anfordern
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: true,
			});
			console.log("Mikrofon-Zugriff erhalten");

			// MediaRecorder initialisieren
			mediaRecorder = new MediaRecorder(stream);
			audioChunks = [];

			// Event-Listener für Audio-Daten
			mediaRecorder.addEventListener("dataavailable", (e) => {
				console.log("Audio-Chunk erhalten:", e.data.size, "Bytes");
				audioChunks.push(e.data);
			});

			// Event-Listener für Aufnahme-Ende
			mediaRecorder.addEventListener("stop", () => {
				console.log("Aufnahme beendet, verarbeite Audio...");
				const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
				processAudio(audioBlob);
			});

			// Aufnahme starten
			mediaRecorder.start();
			startTime = Date.now();

			// Timer starten
			if (timerInterval) clearInterval(timerInterval);
			timerInterval = setInterval(updateTimer, 100);

			// UI aktualisieren
			if (startRecordingBtn) startRecordingBtn.disabled = true;
			if (stopRecordingBtn) stopRecordingBtn.disabled = false;
			if (recordingStatus) {
				recordingStatus.textContent = "Aufnahme läuft...";
				recordingStatus.classList.add("recording");
			}

			// Automatisches Stoppen nach 10 Sekunden
			setTimeout(() => {
				if (mediaRecorder && mediaRecorder.state === "recording") {
					console.log(
						"10 Sekunden erreicht, stoppe Aufnahme automatisch"
					);
					stopRecording();
				}
			}, recordingDuration);
		} catch (error) {
			console.error("Fehler beim Starten der Aufnahme:", error);
			alert(
				"Fehler beim Starten der Aufnahme. Bitte erlauben Sie den Zugriff auf Ihr Mikrofon."
			);

			resetProcessStep();
			if (startRecordingBtn) startRecordingBtn.disabled = false;
			if (stopRecordingBtn) stopRecordingBtn.disabled = true;
		}
	}

	// Aufnahme stoppen
	function stopRecording() {
		console.log("Stoppe Aufnahme...");
		if (mediaRecorder && mediaRecorder.state === "recording") {
			mediaRecorder.stop();

			// Alle Tracks stoppen
			mediaRecorder.stream.getTracks().forEach((track) => track.stop());

			// Timer stoppen
			if (timerInterval) clearInterval(timerInterval);

			// UI aktualisieren
			if (stopRecordingBtn) stopRecordingBtn.disabled = true;
			if (recordingStatus) {
				recordingStatus.textContent = "Verarbeitung...";
				recordingStatus.classList.remove("recording");
				recordingStatus.classList.add("processing");
			}

			// Aktualisiere Prozessindikator
			updateProcessStep("transcribing");
		}
	}

	// Timer aktualisieren
	function updateTimer() {
		if (!startTime) return;

		const elapsed = Date.now() - startTime;
		const remaining = Math.max(0, recordingDuration - elapsed);
		const seconds = Math.floor(remaining / 1000);
		const milliseconds = Math.floor((remaining % 1000) / 10);

		if (recordingTimer) {
			recordingTimer.textContent = `${seconds
				.toString()
				.padStart(2, "0")}:${milliseconds.toString().padStart(2, "0")}`;
		}
	}

	// Audiodatei hochladen
	async function handleUpload() {
		console.log("Handhabung des Uploads...");
		const audioFile = audioFileInput.files[0];
		if (!audioFile) {
			alert("Bitte wählen Sie eine Audiodatei aus");
			return;
		}

		// UI zurücksetzen
		resetUI();

		// Prozessindikator anzeigen
		if (processIndicator) {
			processIndicator.classList.remove("hidden");
			updateProcessStep("transcribing");
		}

		// Audio verarbeiten
		await processAudio(audioFile);
	}

	// Audio verarbeiten
	async function processAudio(audioBlob) {
		console.log("Verarbeite Audio...");
		if (loadingSection) loadingSection.classList.remove("hidden");

		try {
			// FormData erstellen
			const formData = new FormData();
			const fileName = "recording.wav";
			formData.append(
				"audio",
				audioBlob instanceof Blob
					? new File([audioBlob], fileName)
					: audioBlob
			);

			// Optionen sammeln
			const options = {
				txt: outputOptions.txt && outputOptions.txt.checked,
				markdown:
					outputOptions.markdown && outputOptions.markdown.checked,
				pdf: outputOptions.pdf && outputOptions.pdf.checked,
				obsidian:
					outputOptions.obsidian && outputOptions.obsidian.checked
						? outputOptions.obsidianVault
							? outputOptions.obsidianVault.value
							: true
						: false,
				notion:
					outputOptions.notion && outputOptions.notion.checked
						? outputOptions.notionDatabase
							? outputOptions.notionDatabase.value
							: true
						: false,
				display: outputOptions.display && outputOptions.display.checked,
				subtitles:
					outputOptions.subtitles && outputOptions.subtitles.checked,
				gemini: outputOptions.gemini && outputOptions.gemini.checked,
			};

			formData.append("options", JSON.stringify(options));

			console.log("Sende Anfrage an /api/transcribe...");
			const response = await fetch("/api/transcribe", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Server-Fehler: ${response.status}. ${errorText}`
				);
			}

			const data = await response.json();
			console.log("Transkriptionsergebnis erhalten:", data);

			// Wenn Gemini-Option aktiviert ist
			if (options.gemini) {
				updateProcessStep("ai");

				try {
					console.log("Sende Anfrage an /api/summarize...");
					const summaryResponse = await fetch("/api/summarize", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ text: data.transcription }),
					});

					if (summaryResponse.ok) {
						const summaryData = await summaryResponse.json();
						if (summaryText)
							summaryText.innerHTML = summaryData.summary;
					} else {
						if (summaryText)
							summaryText.innerHTML =
								'<p class="error-state">Fehler bei der KI-Zusammenfassung.</p>';
					}
				} catch (error) {
					console.error("Fehler bei der Zusammenfassung:", error);
					if (summaryText)
						summaryText.innerHTML = `<p class="error-state">Fehler: ${error.message}</p>`;
				}
			}

			// Exportphase
			updateProcessStep("exporting");

			// Ergebnis anzeigen
			if (resultText) resultText.textContent = data.transcription;
			if (resultSection) resultSection.classList.remove("hidden");

			// Alle Schritte abschließen
			completeAllProcessSteps();

			// Exportergebnisse anzeigen
			if (processDetails && data.exportResults) {
				let detailsHTML =
					'<p class="status-ok">✅ Transkription abgeschlossen!</p>';

				for (const [service, status] of Object.entries(
					data.exportResults
				)) {
					if (status === "success") {
						detailsHTML += `<p class="status-ok">✅ ${
							service.charAt(0).toUpperCase() + service.slice(1)
						}-Export erfolgreich</p>`;
					} else if (status === "error") {
						detailsHTML += `<p class="status-error">❌ Fehler beim ${
							service.charAt(0).toUpperCase() + service.slice(1)
						}-Export</p>`;
					} else if (status === "no_credentials") {
						detailsHTML += `<p class="status-warning">⚠️ Keine ${
							service.charAt(0).toUpperCase() + service.slice(1)
						}-Anmeldedaten gefunden</p>`;
					}
				}

				processDetails.innerHTML = detailsHTML;
			}
		} catch (error) {
			console.error("Fehler bei der Audioverarbeitung:", error);

			// Fehler im Prozessindikator markieren
			markStepAsError(getCurrentProcessStep());

			if (processDetails) {
				processDetails.innerHTML = `<p class="status-error">❌ Fehler: ${error.message}</p>`;
			}

			alert("Fehler bei der Transkription: " + error.message);
		} finally {
			if (loadingSection) loadingSection.classList.add("hidden");
			if (startRecordingBtn) startRecordingBtn.disabled = false;
		}
	}

	// Transkript in die Zwischenablage kopieren
	async function copyToClipboard() {
		if (!resultText || !resultText.textContent) return;

		try {
			await navigator.clipboard.writeText(resultText.textContent);
			alert("Text in die Zwischenablage kopiert!");
		} catch (error) {
			console.error("Fehler beim Kopieren:", error);
			alert("Fehler beim Kopieren in die Zwischenablage.");
		}
	}

	// Transkript herunterladen
	function downloadTranscript() {
		if (!resultText || !resultText.textContent) return;

		const text = resultText.textContent;
		const filename = `transkript_${new Date()
			.toISOString()
			.replace(/:/g, "-")
			.slice(0, 19)}.txt`;

		const blob = new Blob([text], { type: "text/plain" });
		const url = URL.createObjectURL(blob);

		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();

		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, 100);
	}

	// UI zurücksetzen
	function resetUI() {
		if (recordingStatus) {
			recordingStatus.textContent = "Bereit";
			recordingStatus.classList.remove("recording", "processing");
		}

		if (recordingTimer) recordingTimer.textContent = "10:00";
		if (resultSection) resultSection.classList.add("hidden");
		if (loadingSection) loadingSection.classList.add("hidden");

		resetProcessSteps();
	}

	// Prozess-Management
	function updateProcessStep(step) {
		if (!processSteps) return;

		// Alle Schritte zurücksetzen
		Object.values(processSteps).forEach((stepEl) => {
			if (stepEl) {
				stepEl.classList.remove("active", "completed", "error");
			}
		});

		// Schritte markieren
		const steps = Object.keys(processSteps);
		const currentIndex = steps.indexOf(step);

		for (let i = 0; i < steps.length; i++) {
			const stepKey = steps[i];
			const stepEl = processSteps[stepKey];

			if (stepEl) {
				if (i < currentIndex) {
					stepEl.classList.add("completed");
				} else if (i === currentIndex) {
					stepEl.classList.add("active");
					updateProcessDetails(stepKey);
				}
			}
		}
	}

	function updateProcessDetails(step) {
		if (!processDetails) return;

		const detailsMap = {
			recording: "Nehme Audio auf (10 Sekunden)...",
			transcribing: "Transkribiere Audio mit lokalem Whisper...",
			ai: "Erstelle KI-Zusammenfassung mit Google Gemini...",
			exporting: "Exportiere Ergebnisse in die ausgewählten Formate...",
		};

		processDetails.textContent =
			detailsMap[step] || "Verarbeitung läuft...";
	}

	function completeAllProcessSteps() {
		if (!processSteps) return;

		Object.values(processSteps).forEach((stepEl) => {
			if (stepEl) {
				stepEl.classList.remove("active", "error");
				stepEl.classList.add("completed");
			}
		});
	}

	function resetProcessSteps() {
		if (!processSteps) return;

		Object.values(processSteps).forEach((stepEl) => {
			if (stepEl) {
				stepEl.classList.remove("active", "completed", "error");
			}
		});

		if (processDetails) {
			processDetails.textContent = "Bereit zum Starten...";
		}
	}

	function getCurrentProcessStep() {
		if (!processSteps) return null;

		for (const [step, element] of Object.entries(processSteps)) {
			if (element && element.classList.contains("active")) {
				return step;
			}
		}

		return null;
	}

	function markStepAsError(step) {
		if (!processSteps || !step || !processSteps[step]) return;

		processSteps[step].classList.remove("active", "completed");
		processSteps[step].classList.add("error");
	}

	// Prüfe den Systemstatus beim Laden der Seite
	checkSystemStatus();
});
