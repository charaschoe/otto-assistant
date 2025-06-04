<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <NavBar />
    <div class="flex justify-center pt-8">
      <div class="grid grid-cols-3 gap-8 w-full px-[6%]">
        <div class="bg-white rounded-xl shadow-lg h-80 flex flex-col items-center justify-center text-2xl font-bold text-gray-700 w-full">
           <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m6-6H6"></path></svg>
           <span class="mt-4 text-xl">neues gerät hinzufügen</span>
        </div>
        <div class="bg-white rounded-xl shadow-lg h-80 flex p-6 items-center justify-between w-full">
          <div class="flex flex-col">
            <span class="text-3xl font-bold">Iphone</span>
            <span class="text-gray-600 text-sm mt-2">Letzte Synchronisation 13:23 Uhr</span>
          </div>
          <!-- Placeholder für iPhone Bild -->
          <div class="w-1/3 flex items-center justify-center">
             <img src="/images/iPhone 13.png" alt="iPhone 13" class="w-full h-auto" />
          </div>
        </div>
        <div @click="goToOtto" class="bg-white rounded-xl shadow-lg h-80 flex p-6 items-center justify-between w-full cursor-pointer hover:bg-gray-100 transition">
           <div class="flex flex-col">
              <span class="text-3xl font-bold">Otto</span>
              <span class="text-gray-600 text-sm mt-2">Geräteübersicht</span>
           </div>
           <!-- Placeholder für Otto Visualisierung/Icon -->
           <div class="w-1/3 flex items-center justify-center">
             <svg width="64" height="64" viewBox="0 0 48 48">
               <polygon points="24,8 40,40 8,40" fill="#444" />
             </svg>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import NavBar from "../components/NavBar.vue";

const router = useRouter();

function goToOtto() {
  router.push('/otto');
}
</script>
