<template>
  <div class="w-full h-screen flex flex-col bg-white">
    <!-- Hamburger-Menü oben rechts -->
    <div class="flex items-center justify-end p-4 relative">
      <button class="md:hidden focus:outline-none" @click="menuOpen = !menuOpen">
        <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div v-if="menuOpen" class="absolute right-0 top-14 bg-white shadow-lg rounded-lg w-40 z-50">
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
    <!-- Mikrofon-Button in der Mitte -->
    <div class="flex-1 flex items-center justify-center">
      <button class="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-lg active:scale-95 transition">
        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v2m0 0h3m-3 0H9m6-6a3 3 0 01-6 0V7a3 3 0 016 0v7z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const menuOpen = ref(false);
const router = useRouter();

function goToHome() {
  menuOpen.value = false;
  router.push('/');
}
function goToNotizen() {
  menuOpen.value = false;
  router.push('/notizen');
}
</script>

<style scoped>
</style> 