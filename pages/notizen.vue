<template>
  <div class="min-h-screen bg-white p-4">
    <!-- Hamburger-Menü oben rechts -->
    <div class="flex items-center justify-end mb-4 relative">
      <button class="md:hidden focus:outline-none" @click="menuOpen = !menuOpen">
        <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div v-if="menuOpen" class="absolute right-0 top-12 bg-white shadow-lg rounded-lg w-40 z-50">
        <ul class="flex flex-col divide-y divide-gray-200">
          <li>
            <button class="w-full text-left px-4 py-3 hover:bg-gray-100" @click="goToHome">Aufnahme</button>
          </li>
          <li>
            <button class="w-full text-left px-4 py-3 hover:bg-gray-100">Settings</button>
          </li>
          <li>
            <button class="w-full text-left px-4 py-3 hover:bg-gray-100" @click="goToNotizen">Backlog</button>
          </li>
        </ul>
      </div>
    </div>
    <h1 class="text-2xl font-bold mb-6">Backlog</h1>
    <ul class="space-y-4">
      <li v-for="note in notes" :key="note.id" class="p-4 rounded-lg shadow flex flex-col bg-gray-50">
        <span class="font-semibold text-lg">{{ note.title }}</span>
        <span class="text-gray-500 text-sm mt-1">{{ note.time }} | {{ note.date }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const menuOpen = ref(false);
const router = useRouter();

function goToNotizen() {
  menuOpen.value = false;
  router.push('/notizen');
}

function goToHome() {
  menuOpen.value = false;
  router.push('/');
}

const notes = [
  { id: 1, title: 'Einkaufsliste', time: '14:32', date: '2024-05-01' },
  { id: 2, title: 'Projektbesprechung', time: '09:15', date: '2024-05-02' },
  { id: 3, title: 'Sprachnachricht an Max', time: '18:47', date: '2024-05-03' },
];
</script>

<style scoped>
</style> 