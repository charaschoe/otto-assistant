document.addEventListener('DOMContentLoaded', () => {
  // DOM-Elemente für Login und Hauptbereich
  const loginContainer = document.getElementById('login-container');
  const mainContainer = document.getElementById('main-container');
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  
  // Tab-Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // DOM-Elemente für Transkription
  const startRecordingBtn = document.getElementById('start-recording');
  const stopRecordingBtn = document.getElementById('stop-recording');
  const recordingStatus = document.getElementById('recording-status');
  const recordingTime = document.getElementById('recording-time');
  const transcriptResult = document.getElementById('transcript-result');
  const transcriptLoader = document.getElementById('transcript-loader');
  const transcriptContent = document.getElementById('transcript-content');
  const downloadTranscriptBtn = document.getElementById('download-transcript');
  const copyTranscriptBtn = document.getElementById('copy-transcript');
  const transcriptTitle = document.getElementById('transcript-title');
  
  // Verlauf-Elemente
  const historyList = document.getElementById('history-list');
  const historyDetails = document.getElementById('history-details');
  const historyTitle = document.getElementById('history-title');
  const historyDate = document.getElementById('history-date');
  const historyContent = document.getElementById('history-content');
  const historyDownload = document.getElementById('history-download');
  const historyCopy = document.getElementById('history-copy');
  const historyBack = document.getElementById('history-back');
  
  // Einstellungen-Elemente
  const saveNotionBtn = document.getElementById('save-notion');
  const saveObsidianBtn = document.getElementById('save-obsidian');
  const saveGoogleBtn = document.getElementById('save-google');
  
  const notionToken = document.getElementById('notion-token');
  const notionDatabase = document.getElementById('notion-database');
  const obsidianWebhook = document.getElementById('obsidian-webhook');
  const obsidianVault = document.getElementById('obsidian-vault');
  const googleCredentials = document.getElementById('google-credentials');
  
  // Ausgabe-Optionen
  const outputOptions = {
    notion: document.getElementById('notion-output'),
    obsidian: document.getElementById('obsidian-output'),
    markdown: document.getElementById('markdown-output'),
    pdf: document.getElementById('pdf-output'),
    csv: document.getElementById('csv-output'),
    gdrive: document.getElementById('gdrive-output')
  };
  
  // Aufnahme-Variablen
  let mediaRecorder;
  let audioChunks = [];
  let startTime;
  let timerInterval;
  
  // Auth-Token und User-ID
  let authToken = localStorage.getItem('authToken');
  let userId = localStorage.getItem('userId');
  
  // Prüfen ob Benutzer bereits angemeldet ist
  if (authToken && userId) {
    showMainInterface();
    loadSettings();
    loadTranscriptHistory();
  }
  
  // Überprüfe ob Browser MediaRecorder unterstützt
  if (!window.MediaRecorder) {
    alert('Ihr Browser unterstützt keine Audioaufnahmen. Bitte verwenden Sie Chrome, Firefox oder Edge.');
    startRecordingBtn.disabled = true;
  }
  
  // ====== Event-Listener ======
  
  // Login & Logout
  loginButton.addEventListener('click', handleLogin);
  logoutButton.addEventListener('click', handleLogout);
  
  // Tab-Navigation
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.id === 'logout-button') return;
      
      const tabName = button.getAttribute('data-tab');
      
      // Aktive Klasse entfernen
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Aktive Klasse hinzufügen
      button.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
      
      // Bei Verlauf-Tab die Transkriptionen laden
      if (tabName === 'history') {
        loadTranscriptHistory();
      }
    });
  });
  
  // Transkription
  startRecordingBtn.addEventListener('click', startRecording);
  stopRecordingBtn.addEventListener('click', stopRecording);
  downloadTranscriptBtn.addEventListener('click', downloadTranscript);
  copyTranscriptBtn.addEventListener('click', copyTranscript);
  
  // Verlauf
  historyBack.addEventListener('click', () => {
    historyDetails.classList.add('hidden');
    historyList.classList.remove('hidden');
  });
  historyDownload.addEventListener('click', () => downloadHistoryTranscript());
  historyCopy.addEventListener('click', () => copyHistoryTranscript());
  
  // Einstellungen
  saveNotionBtn.addEventListener('click', () => saveCredentials('notion'));
  saveObsidianBtn.addEventListener('click', () => saveCredentials('obsidian'));
  saveGoogleBtn.addEventListener('click', () => saveCredentials('google'));
  
  // ====== Funktionen ======
  
  // Auth-Funktionen
  async function handleLogin() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    
    if (!email || !password) {
      alert('Bitte E-Mail und Passwort eingeben');
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Token und User-ID speichern
        authToken = data.token;
        userId = data.userId;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userId', userId);
        
        // Interface anzeigen
        showMainInterface();
        loadSettings();
      } else {
        alert(data.error || 'Fehler bei der Anmeldung');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Verbindungsfehler. Bitte versuchen Sie es später erneut.');
    }
  }
  
  function handleLogout() {
    // Token und User-ID löschen
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    authToken = null;
    userId = null;
    
    // Zurück zum Login
    loginContainer.classList.remove('hidden');
    mainContainer.classList.add('hidden');
    
    // Formular zurücksetzen
    loginEmail.value = '';
    loginPassword.value = '';
  }
  
  function showMainInterface() {
    loginContainer.classList.add('hidden');
    mainContainer.classList.remove('hidden');
  }
  
  // API-Anfrage mit Auth-Token
  async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
      'Authorization': `Bearer ${authToken}`
    };
    
    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }
    
    const options = {
      method,
      headers
    };
    
    if (body) {
      options.body = body;
    }
    
    try {
      const response = await fetch(endpoint, options);
      
      // Token abgelaufen
      if (response.status === 401 || response.status === 403) {
        alert('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.');
        handleLogout();
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      return null;
    }
  }
  
  // Settings-Funktionen  
  async function loadSettings() {
    // Notion-Credentials laden
    try {
      const notionResponse = await apiRequest('/api/credentials/notion');
      if (notionResponse && notionResponse.ok) {
        const data = await notionResponse.json();
        notionToken.value = data.data.token || '';
        notionDatabase.value = data.data.databaseId || '';
      }
    } catch (error) {
      console.error('Fehler beim Laden der Notion-Credentials:', error);
    }
    
    // Obsidian-Credentials laden
    try {
      const obsidianResponse = await apiRequest('/api/credentials/obsidian');
      if (obsidianResponse && obsidianResponse.ok) {
        const data = await obsidianResponse.json();
        obsidianWebhook.value = data.data.webhookUrl || '';
        obsidianVault.value = data.data.vault || '';
      }
    } catch (error) {
      console.error('Fehler beim Laden der Obsidian-Credentials:', error);
    }
    
    // Google-Credentials laden
    try {
      const googleResponse = await apiRequest('/api/credentials/google');
      if (googleResponse && googleResponse.ok) {
        const data = await googleResponse.json();
        googleCredentials.value = data.data.credentials || '';
      }
    } catch (error) {
      console.error('Fehler beim Laden der Google-Credentials:', error);
    }
  }
  
  async function saveCredentials(service) {
    let data = {};
    
    switch (service) {
      case 'notion':
        data = {
          token: notionToken.value.trim(),
          databaseId: notionDatabase.value.trim()
        };
        break;
      case 'obsidian':
        data = {
          webhookUrl: obsidianWebhook.value.trim(),
          vault: obsidianVault.value.trim()
        };
        break;
      case 'google':
        data = {
          credentials: googleCredentials.value.trim()
        };
        break;
    }
    
    try {
      const response = await apiRequest('/api/credentials', 'POST', {
        service,
        data
      });
      
      if (response && response.ok) {
        alert(`${service.charAt(0).toUpperCase() + service.slice(1)}-Einstellungen erfolgreich gespeichert!`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || `Fehler beim Speichern der ${service}-Einstellungen`);
      }
    } catch (error) {
      console.error(`Save ${service} Error:`, error);
      alert(`Fehler beim Speichern der ${service}-Einstellungen`);
    }
  }
  
  // Transkriptionsverlauf-Funktionen
  async function loadTranscriptHistory() {
    historyList.innerHTML = '<div class="loader"></div>';
    
    try {
      const response = await apiRequest('/api/transcripts');
      
      if (response && response.ok) {
        const data = await response.json();
        
        if (data.transcripts && data.transcripts.length > 0) {
          // Verlauf anzeigen
          const historyHTML = data.transcripts.map(transcript => `
            <div class="history-item" data-id="${transcript.id}">
              <h4>${transcript.title || 'Unbenannt'}</h4>
              <div class="date">${new Date(transcript.created_at).toLocaleString()}</div>
            </div>
          `).join('');
          
          historyList.innerHTML = historyHTML;
          
          // Event-Listener für Klicks auf Verlaufseinträge
          document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => loadTranscriptDetails(item.getAttribute('data-id')));
          });
        } else {
          historyList.innerHTML = '<p class="empty-state">Noch keine Transkriptionen vorhanden.</p>';
        }
      } else {
        historyList.innerHTML = '<p class="error-state">Fehler beim Laden des Verlaufs.</p>';
      }
    } catch (error) {
      console.error('History Load Error:', error);
      historyList.innerHTML = '<p class="error-state">Fehler beim Laden des Verlaufs.</p>';
    }
  }
  
  async function loadTranscriptDetails(id) {
    try {
      const response = await apiRequest(`/api/transcripts/${id}`);
      
      if (response && response.ok) {
        const data = await response.json();
        const transcript = data.transcript;
        
        // Details anzeigen
        historyTitle.textContent = transcript.title || 'Unbenannt';
        historyDate.textContent = new Date(transcript.created_at).toLocaleString();
        historyContent.textContent = transcript.content;
        
        // UI-Wechsel
        historyList.classList.add('hidden');
        historyDetails.classList.remove('hidden');
        
        // Aktuelle Transkript-ID speichern für Download und Kopieren
        historyDetails.setAttribute('data-id', id);
      } else {
        alert('Fehler beim Laden der Transkription.');
      }
    } catch (error) {
      console.error('Transcript Detail Error:', error);
      alert('Fehler beim Laden der Transkription.');
    }
  }
  
  function downloadHistoryTranscript() {
    const text = historyContent.textContent;
    if (!text) return;
    
    const title = historyTitle.textContent;
    downloadText(text, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
  }
  
  function copyHistoryTranscript() {
    const text = historyContent.textContent;
    if (!text) return;
    
    copyToClipboard(text);
  }
  
  // Aufnahme-Funktionen
  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    recordingTime.textContent = `${minutes}:${seconds}`;
  }
  
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      
      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });
      
      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        await processAudio(audioBlob);
      });
      
      // Starte die Aufnahme
      mediaRecorder.start();
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);
      
      // UI aktualisieren
      startRecordingBtn.disabled = true;
      stopRecordingBtn.disabled = false;
      recordingStatus.textContent = 'Aufnahme läuft...';
      recordingStatus.style.backgroundColor = '#e74c3c';
      recordingStatus.style.color = 'white';
      
    } catch (error) {
      console.error('Fehler beim Starten der Aufnahme:', error);
      alert('Fehler beim Starten der Aufnahme. Bitte erlauben Sie den Zugriff auf Ihr Mikrofon.');
    }
  }
  
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      
      // Alle Tracks stoppen
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      // Timer stoppen
      clearInterval(timerInterval);
      
      // UI aktualisieren
      startRecordingBtn.disabled = false;
      stopRecordingBtn.disabled = true;
      recordingStatus.textContent = 'Verarbeite Aufnahme...';
      recordingStatus.style.backgroundColor = '#f39c12';
      recordingStatus.style.color = 'white';
    }
  }
  
  async function processAudio(audioBlob) {
    // Zeige Lade-Animation
    transcriptResult.classList.remove('hidden');
    transcriptLoader.classList.remove('hidden');
    transcriptContent.textContent = 'Transkription wird erstellt...';
    
    try {
      // FormData erstellen für den API-Aufruf
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      // Titel hinzufügen
      const title = transcriptTitle.value.trim() || `Transkript ${new Date().toLocaleDateString()}`;
      formData.append('title', title);
      
      // Ausgabeoptionen hinzufügen
      const selectedOptions = [];
      if (outputOptions.notion.checked) selectedOptions.push('1');
      if (outputOptions.obsidian.checked) selectedOptions.push('2');
      if (outputOptions.markdown.checked) selectedOptions.push('21');
      if (outputOptions.pdf.checked) selectedOptions.push('8');
      if (outputOptions.csv.checked) selectedOptions.push('7');
      if (outputOptions.gdrive.checked) selectedOptions.push('12');
      
      formData.append('outputOptions', selectedOptions.join(','));
      
      // API-Aufruf mit Auth-Token
      const response = await apiRequest('/api/transcribe', 'POST', formData);
      
      if (response && response.ok) {
        const data = await response.json();
        
        // Zeige das Transkript an
        transcriptLoader.classList.add('hidden');
        transcriptContent.textContent = data.transcript;
        
        // UI aktualisieren
        recordingStatus.textContent = 'Fertig';
        recordingStatus.style.backgroundColor = '#2ecc71';
        
        // Zeige Export-Ergebnisse
        let exportMessage = '';
        const exportResults = data.exportResults || {};
        
        for (const [service, status] of Object.entries(exportResults)) {
          if (status === 'success') {
            exportMessage += `✅ ${service.charAt(0).toUpperCase() + service.slice(1)}-Export erfolgreich\n`;
          } else if (status === 'error') {
            exportMessage += `❌ Fehler beim ${service.charAt(0).toUpperCase() + service.slice(1)}-Export\n`;
          } else if (status === 'no_credentials') {
            exportMessage += `⚠️ Keine ${service.charAt(0).toUpperCase() + service.slice(1)}-Anmeldedaten gefunden\n`;
          }
        }
        
        if (exportMessage) {
          alert(`Transkription abgeschlossen!\n\n${exportMessage}`);
        }
      } else {
        const errorData = await response.json();
        transcriptLoader.classList.add('hidden');
        transcriptContent.textContent = errorData.transcript || 'Fehler bei der Transkription. Bitte versuchen Sie es erneut.';
        
        recordingStatus.textContent = 'Fehler';
        recordingStatus.style.backgroundColor = '#e74c3c';
        
        alert(errorData.error || 'Fehler bei der Transkription.');
      }
    } catch (error) {
      console.error('Transkriptions-Fehler:', error);
      transcriptLoader.classList.add('hidden');
      transcriptContent.textContent = 'Fehler bei der Transkription. Bitte versuchen Sie es erneut.';
      
      recordingStatus.textContent = 'Fehler';
      recordingStatus.style.backgroundColor = '#e74c3c';
    }
  }
  
  // Hilfsfunktionen
  function downloadTranscript() {
    const text = transcriptContent.textContent;
    if (!text) return;
    
    const title = transcriptTitle.value.trim() || `transkript_${new Date().toISOString().slice(0, 10)}`;
    downloadText(text, `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`);
  }
  
  function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Aufräumen
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  function copyTranscript() {
    const text = transcriptContent.textContent;
    if (!text) return;
    
    copyToClipboard(text);
  }
  
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Text in die Zwischenablage kopiert!');
      })
      .catch(err => {
        console.error('Fehler beim Kopieren:', err);
        alert('Fehler beim Kopieren des Textes.');
      });
  }
});