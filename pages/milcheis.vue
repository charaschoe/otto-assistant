<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <!-- Pass MilcheisNavbar the current section and listen for section changes -->
    <MilcheisNavbar :current-section="currentSection" @select-section="selectSection" />

    <div class="pl-[6%] pr-[6%] pt-8 flex-1">
      <!-- Conditional rendering based on currentSection -->
      <div v-if="currentSection === 'overview'">
        <!-- Inhalt für Overview (Die Kacheln) -->
         <div class="flex justify-between items-center mb-4">
          <div class="flex space-x-2">
            <button class="bg-gray-100 border border-gray-300 rounded px-4 py-2 font-medium flex items-center text-sm hover:bg-gray-200 transition">Json <span class="ml-1">↓</span></button>
            <button class="bg-gray-100 border border-gray-300 rounded px-4 py-2 font-medium flex items-center text-sm hover:bg-gray-200 transition">CSV <span class="ml-1">↓</span></button>
          </div>
         </div>
        
        <!-- Obere große Kachel mit Summary -->
        <div class="bg-white rounded-lg shadow-sm p-8 mb-8">
           <div class="grid grid-cols-2 gap-8 items-center">
               <div class="mt-[-8px]">
                  <h2 class="text-xl font-semibold mb-3">Milcheis</h2>
                  <p class="text-gray-700 leading-relaxed max-w-md">
                    Dieses Projekt dreht sich um die Entwicklung eines innovativen Milcheisprodukts, das auf nachhaltigen Zutaten basiert und eine neue Zielgruppe anspricht. Ziel ist es, den Marktanteil im Premium-Segment zu erhöhen und gleichzeitig umweltfreundliche Produktionsprozesse zu etablieren.
                  </p>
               </div>
               <div class="flex flex-col justify-center items-start w-full md:w-auto">
                 <span class="text-sm font-semibold text-gray-700 mb-1">Work Hours Distribution</span>
                 <span class="text-xl font-semibold text-gray-900 mb-1">120h</span>
                 <span class="text-sm mb-4"><span class="text-green-600 font-semibold">Total +10%</span></span>
                 <div class="flex gap-8 mt-2 items-end">
                   <div class="flex flex-col items-center">
                     <div class="w-36 h-20 bg-gray-100 border-t-2 border-gray-400 mb-2 flex items-center justify-center text-xl font-bold text-gray-500">50h</div>
                     <span class="text-base font-medium">Markus Rotman</span>
                   </div>
                   <div class="flex flex-col items-center">
                     <div class="w-36 h-16 bg-gray-100 border-t-2 border-gray-400 mb-2 flex items-center justify-center text-xl font-bold text-gray-500">40h</div>
                     <span class="text-base font-medium">Ayse Uldur</span>
                   </div>
                   <div class="flex flex-col items-center">
                     <div class="w-24 h-8 bg-gray-100 border-t-2 border-gray-400 mb-2 flex items-center justify-center text-xl font-bold text-gray-500">30h</div>
                     <span class="text-base font-medium">Samantha Kohl</span>
                   </div>
                 </div>
               </div>
            </div>
         </div>

        <!-- Grid mit Kacheln -->
        <div class="grid grid-cols-3 gap-6 mb-12">
          <!-- Mitglieder -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="font-semibold text-lg mb-4">Mitglieder</h2>
            <div class="flex flex-col gap-8">
              <div class="flex items-center gap-4 leading-none">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-8 h-8 rounded-full m-0 p-0"/>
                <span class="text-base font-medium">Markus Rotman</span>
              </div>
              <div class="flex items-center gap-4 leading-none">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" class="w-8 h-8 rounded-full m-0 p-0"/>
                <span class="text-base font-medium">Ayse Uldur</span>
              </div>
              <div class="flex items-center gap-4 leading-none">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" class="w-8 h-8 rounded-full m-0 p-0"/>
                <span class="text-base font-medium">Samantha Kohl</span>
              </div>
            </div>
          </div>
          <!-- Integrationen Kachel (bleibt hier, wird aber auf der Integrationen-Seite als Hauptinhalt verwendet) -->
           <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="font-semibold text-lg mb-4">Integrationen</h2>
            <div class="flex flex-col gap-2">
              <!-- Beispiel Integration: Notion -->
              <div class="flex items-center pb-4 last:pb-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/notion.png" alt="Notion" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Notion</span>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
              <!-- Beispiel Integration: Miro -->
              <div class="flex items-center pb-4 last:pb-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/miro.png" alt="Miro" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Miro</span>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
              <!-- Beispiel Integration: Obsidian (inaktiv) -->
              <div class="flex items-center pb-4 last:pb-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/obsidian.png" alt="Obsidian" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Obsidian</span>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
            </div>
          </div>
          <!-- Beiträge -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
            <h2 class="font-semibold text-lg mb-4">Beiträge</h2>
            <div class="flex flex-col gap-8">
              <div class="flex items-center gap-4 leading-none">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-8 h-8 rounded-full m-0 p-0"/>
                <span class="text-base font-medium">Markus Rotman</span>
                <span class="ml-auto text-base font-bold">33</span>
              </div>
              <div class="flex items-center gap-4 leading-none">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" class="w-8 h-8 rounded-full m-0 p-0"/>
                <span class="text-base font-medium">Ayse Uldur</span>
                <span class="ml-auto text-base font-bold">21</span>
              </div>
              <div class="flex items-center gap-4 leading-none">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" class="w-8 h-8 rounded-full m-0 p-0"/>
                <span class="text-base font-medium">Samantha Kohl</span>
                <span class="ml-auto text-base font-bold">15</span>
              </div>
            </div>
          </div>
          <!-- Orte (Heatmap) -->
          <div class="bg-white p-6 rounded-lg shadow-sm flex flex-col">
            <h2 class="font-semibold text-lg mb-4">Orte</h2>
            <div id="heatmap-map" class="w-full h-24"></div>
          </div>
          <!-- Contributions (Neue Kachel wie auf Otto.vue) -->
          <div class="bg-white p-6 rounded-lg shadow-sm">
             <div class="flex justify-between items-start mb-4">
                <div>
                   <h3 class="text-lg font-semibold">Contributions</h3>
                   <p class="text-sm text-gray-500">last update heute</p>
                </div>
             </div>
             <!-- Einfaches Liniendiagramm (wie Otto.vue) -->
             <div class="h-16 mb-4">
                <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                   <path
                      d="M0,80 L50,70 L100,75 L150,60 L200,65 L250,50 L300,55"
                      fill="none"
                      stroke="#4F46E5"
                      stroke-width="2"
                   />
                </svg>
             </div>
             <div class="flex justify-between text-sm text-gray-600">
                <div>
                   <p>01.01.2024</p>
                   <p class="font-medium">Kick-Off</p>
                </div>
                <div class="text-right">
                   <p>31.12.2024</p>
                   <p class="font-medium">Ende</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div v-if="currentSection === 'integrationen'">
         <!-- Inhalt für Integrationen (Die große Kachel mit Liste) -->
         <div class="bg-white p-6 rounded-lg shadow-sm">
            <h1 class="text-2xl font-bold mb-6">Integrationen</h1>
            <div class="flex flex-col gap-2">
              <!-- Beispiel Integration: Notion -->
              <div class="flex items-center border-b border-gray-200 pb-4 last:border-b-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/notion.png" alt="Notion" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Notion</span>
                <a href="https://notion.com/898989" target="_blank" class="ml-2 text-gray-500 text-sm">notion.com/898989</a>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
              <!-- Beispiel Integration: Miro -->
              <div class="flex items-center border-b border-gray-200 pb-4 last:border-b-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/miro.png" alt="Miro" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Miro</span>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
              <!-- Beispiel Integration: Obsidian (inaktiv) -->
              <div class="flex items-center border-b border-gray-200 pb-4 last:border-b-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/obsidian.png" alt="Obsidian" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Obsidian</span>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
              <!-- Figma -->
              <div class="flex items-center border-b border-gray-200 pb-4 last:border-b-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/figma.png" alt="Figma" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Figma</span>
                <a href="https://figma.com/board-xyz" target="_blank" class="ml-2 text-gray-500 text-sm">figma.com/board-xyz</a>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
              <!-- PDF -->
              <div class="flex items-center border-b border-gray-200 pb-4 last:border-b-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/pdf.png" alt="PDF" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">PDF</span>
                <a href="https://pdf.com/board-abc" target="_blank" class="ml-2 text-gray-500 text-sm">pdf.com/board-abc</a>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
              <!-- Excel -->
              <div class="flex items-center border-b border-gray-200 pb-4 last:border-b-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/Excel.png" alt="Excel" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Excel</span>
                <a href="https://excel.com/board-123" target="_blank" class="ml-2 text-gray-500 text-sm">excel.com/board-123</a>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
              <!-- Word (inaktiv) -->
              <div class="flex items-center border-b border-gray-200 pb-4 last:border-b-0">
                <span class="w-10 h-10 flex items-center justify-center">
                  <img src="/images/word.png" alt="Word" class="w-8 h-8 object-contain" />
                </span>
                <span class="text-base font-medium ml-2">Word</span>
                <a href="https://word.com/board-456" target="_blank" class="ml-2 text-gray-500 text-sm">word.com/board-456</a>
                <span class="ml-auto flex items-center gap-2">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </span>
              </div>
            </div>
         </div>
      </div>

      <div v-if="currentSection === 'mitglieder'">
         <!-- Inhalt für Mitglieder -->
         <div class="bg-white p-6 rounded-lg shadow-sm">
            <h1 class="text-2xl font-bold mb-6">Mitglieder</h1>
            <div class="flex flex-col gap-4">
              <!-- Markus Rotman -->
              <div class="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-center gap-4">
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-12 h-12 rounded-full"/>
                  <div>
                    <span class="text-base font-medium">Markus Rotman</span>
                    <p class="text-sm text-gray-500">Projektleiter</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p class="text-sm text-gray-500">Beiträge</p>
                    <p class="font-semibold">33</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>

              <!-- Ayse Uldur -->
              <div class="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-center gap-4">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" class="w-12 h-12 rounded-full"/>
                  <div>
                    <span class="text-base font-medium">Ayse Uldur</span>
                    <p class="text-sm text-gray-500">Entwicklerin</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p class="text-sm text-gray-500">Beiträge</p>
                    <p class="font-semibold">21</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>

              <!-- Samantha Kohl -->
              <div class="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-center gap-4">
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" class="w-12 h-12 rounded-full"/>
                  <div>
                    <span class="text-base font-medium">Samantha Kohl</span>
                    <p class="text-sm text-gray-500">Designerin</p>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-right">
                    <p class="text-sm text-gray-500">Beiträge</p>
                    <p class="font-semibold">15</p>
                  </div>
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>

              <!-- Neues Mitglied -->
              <div class="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  </div>
                  <div>
                    <span class="text-base font-medium text-gray-400">Mitglied hinzufügen</span>
                    <p class="text-sm text-gray-400">Klicken Sie hier, um ein neues Mitglied einzuladen</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>

      <div v-if="currentSection === 'settings'">
         <!-- Inhalt für Settings -->
         <div class="bg-white p-6 rounded-lg shadow-sm">
            <h1 class="text-2xl font-bold mb-6">Einstellungen</h1>
            
            <!-- Benachrichtigungen -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold mb-4">Benachrichtigungen</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">E-Mail Benachrichtigungen</p>
                    <p class="text-sm text-gray-500">Erhalten Sie Updates per E-Mail</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" checked>
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Push-Benachrichtigungen</p>
                    <p class="text-sm text-gray-500">Erhalten Sie Updates in Echtzeit</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <!-- Datenschutz -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold mb-4">Datenschutz</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Datenexport</p>
                    <p class="text-sm text-gray-500">Exportieren Sie alle Ihre Daten</p>
                  </div>
                  <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Exportieren
                  </button>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Daten löschen</p>
                    <p class="text-sm text-gray-500">Löschen Sie alle Ihre Daten unwiderruflich</p>
                  </div>
                  <button class="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50">
                    Löschen
                  </button>
                </div>
              </div>
            </div>

            <!-- Projekt-Einstellungen -->
            <div class="mb-8">
              <h2 class="text-lg font-semibold mb-4">Projekt-Einstellungen</h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Projektname</p>
                    <p class="text-sm text-gray-500">Ändern Sie den Namen des Projekts</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <input type="text" value="Milcheis" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      Speichern
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">Sichtbarkeit</p>
                    <p class="text-sm text-gray-500">Wer kann das Projekt sehen?</p>
                  </div>
                  <select class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Nur Mitglieder</option>
                    <option>Öffentlich</option>
                    <option>Privat</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Speichern Button -->
            <div class="flex justify-end">
              <button class="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Änderungen speichern
              </button>
            </div>
          </div>
      </div>

      <!-- Füge hier div-Blöcke für andere Sektionen hinzu (Insights) -->

    </div>

    <!-- Footer -->
    <footer class="bg-white text-center p-4 mt-auto">
      <p class="text-gray-600 text-sm">&copy; {{ new Date().getFullYear() }} Ihr Unternehmen. Alle Rechte vorbehalten.</p>
    </footer>
  </div>
</template>

<script setup>
import MilcheisNavbar from '../components/MilcheisNavbar.vue'
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'; // Importiere Chart.js

// --- Zustandsverwaltung für Sektionen ---
const currentSection = ref('overview') // Standardmäßig Overview anzeigen

const selectSection = (section) => {
  currentSection.value = section
  console.log('Selected section:', currentSection.value)
  // Hier könntest du auch die URL aktualisieren, wenn gewünscht, ohne das Routing zu nutzen
  // window.history.pushState({}, '', `/milcheis/${section}`)
}

// --- Leaflet/Heatmap Code (bleibt in onMounted) ---
// Entferne globale Leaflet Imports
// import leaflet from 'leaflet'
// import 'leaflet.heat'
// import 'leaflet/dist/leaflet.css'

onMounted(async () => {
  // Stelle sicher, dass der Heatmap-Code nur für die Overview-Sektion läuft
  if (currentSection.value === 'overview') {
      // Dynamische Imports für Heatmap
     const leaflet = await import('leaflet');
     await import('leaflet.heat');
     await import('leaflet/dist/leaflet.css');

     // Beispiel-Daten für die Heatmap [lat, lng, intensity]
     const heatData = [
       [48.8566, 2.3522, 1.0], // Paris
       [52.5200, 13.4050, 0.8], // Berlin
       [41.9028, 12.4964, 0.6], // Rome
       [51.5074, -0.1278, 0.9], // London
       [40.7128, -74.0060, 0.7]  // New York (Beispiel für andere Orte)
     ];

     // Karte initialisieren
     const map = leaflet.map('heatmap-map').setView([48.8566, 2.3522], 5); // Zentriert über Paris mit Zoom Level 5

     // OpenStreetMap Tiles hinzufügen
     leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

     // Heatmap-Ebene hinzufügen
     if (leaflet.heatLayer) {
         leaflet.heatLayer(heatData, {radius: 25}).addTo(map);
     } else if (leaflet.default && leaflet.default.heatLayer) {
         leaflet.default.heatLayer(heatData, {radius: 25}).addTo(map);
     } else {
         console.error('Heatmap layer not found on leaflet object');
     }

      // --- Chart.js Diagramm für Arbeitszeit ---
      const ctx = document.getElementById('zeitChart');

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Markus', 'Ayse', 'Samantha'],
          datasets: [{
            label: 'Arbeitszeit (h)',
            data: [33, 21, 15],
            backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)'
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Stunden'
              }
            },
            x: {
                title: {
                    display: true,
                    text: 'Mitarbeiter'
                }
            }
          },
           plugins: {
            legend: {
                display: false // Legende ausblenden
            }
          }
        }
      });
   }
});
</script> 