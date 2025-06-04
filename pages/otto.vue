<template>
  <div class="min-h-screen bg-gray-100">
    <OttoNavbar :current-section="currentSection" @select-section="selectSection" />
    <div class="pl-[6%] pr-[6%] pt-8">
      <div v-if="currentSection === 'overview'">
        <div class="grid grid-cols-3 gap-6">
          <OttoCard
            title="Milcheis"
            lastUpdate="vor 2 Stunden"
            startDate="01.01.2024"
            endDate="31.12.2024"
            chartPath="M0,80 L50,70 L100,75 L150,60 L200,65 L250,50 L300,55"
            :currentPosition="180"
          />
          <OttoCard
            title="Schokolade"
            lastUpdate="vor 3 Stunden"
            startDate="01.02.2024"
            endDate="28.02.2024"
            chartPath="M0,90 L50,60 L100,80 L150,50 L200,70 L250,60 L300,80"
            :currentPosition="120"
          />
          <OttoCard
            title="Vanille"
            lastUpdate="vor 1 Stunde"
            startDate="01.03.2024"
            endDate="31.03.2024"
            chartPath="M0,70 L50,80 L100,60 L150,90 L200,55 L250,75 L300,65"
            :currentPosition="240"
          />
          <OttoCard
            title="Erdbeere"
            lastUpdate="vor 4 Stunden"
            startDate="01.04.2024"
            endDate="30.04.2024"
            chartPath="M0,60 L50,65 L100,80 L150,70 L200,90 L250,60 L300,85"
            :currentPosition="90"
          />
          <OttoCard
            title="Mango"
            lastUpdate="vor 5 Stunden"
            startDate="01.05.2024"
            endDate="31.05.2024"
            chartPath="M0,85 L50,75 L100,65 L150,80 L200,60 L250,90 L300,70"
            :currentPosition="210"
          />
          <OttoCard
            title="Kokos"
            lastUpdate="vor 6 Stunden"
            startDate="01.06.2024"
            endDate="30.06.2024"
            chartPath="M0,75 L50,90 L100,70 L150,60 L200,80 L250,65 L300,85"
            :currentPosition="280"
          />
        </div>
      </div>
      <div v-if="currentSection === 'mitglieder'">
        <div class="bg-white p-6 rounded-lg shadow-sm">
          <h1 class="text-2xl font-bold mb-6">Mitglieder</h1>
          <div class="flex flex-col gap-4">
            <!-- Markus Rotman -->
            <div class="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0">
              <div class="flex items-center gap-4">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" class="w-12 h-12 rounded-full"/>
                <div>
                  <span class="text-lg font-medium">Markus Rotman</span>
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
                  <span class="text-lg font-medium">Ayse Uldur</span>
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
                  <span class="text-lg font-medium">Samantha Kohl</span>
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
                  <span class="text-lg font-medium text-gray-400">Mitglied hinzufügen</span>
                  <p class="text-sm text-gray-400">Klicken Sie hier, um ein neues Mitglied einzuladen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentSection === 'settings'">
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
                  <input type="text" value="Otto" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
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
    </div>
  </div>
</template>

<script setup>
import OttoNavbar from '../components/OttoNavbar.vue'
import OttoCard from '../components/OttoCard.vue'
import { ref } from 'vue'

const currentSection = ref('overview')
const selectSection = (section) => {
  currentSection.value = section
}
</script>
