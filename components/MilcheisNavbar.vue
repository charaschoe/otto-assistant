<template>
  <nav class="bg-white border-b border-gray-200">
    <div class="flex flex-col pl-[6%] pr-[6%] pt-6 pb-0">
      <!-- Logo und Name -->
      <div class="flex items-center mb-2">
        <svg width="64" height="64" viewBox="0 0 48 48">
          <polygon points="24,8 40,40 8,40" fill="#444" />
        </svg>
        <span class="ml-4 text-3xl font-extrabold text-black cursor-pointer" @click="navigateToOtto">Otto</span>
        <svg class="ml-2" width="18" height="18" viewBox="0 0 20 20">
          <path d="M5 8l5 5 5-5" stroke="#222" stroke-width="2" fill="none" />
        </svg>
        <span class="ml-4 text-2xl font-extrabold text-black">/ Milcheis</span>
      </div>
      <!-- Tabs -->
      <div class="flex space-x-10 items-center relative">
        <button
          :class="{'text-black border-b-2 border-black': currentSection === 'overview', 'text-gray-400': currentSection !== 'overview'}"
          class="font-bold text-base pb-1 px-2 focus:outline-none"
          @click="$emit('select-section', 'overview')"
        >
          Overview
        </button>
        <button
           :class="{'text-black border-b-2 border-black': currentSection === 'integrationen', 'text-gray-400': currentSection !== 'integrationen'}"
          class="font-bold text-base pb-1 px-2 focus:outline-none"
          @click="$emit('select-section', 'integrationen')"
        >
          Integrationen
        </button>
         <button
          :class="{'text-black border-b-2 border-black': currentSection === 'mitglieder', 'text-gray-400': currentSection !== 'mitglieder'}"
          class="font-bold text-base pb-1 px-2 focus:outline-none"
          @click="$emit('select-section', 'mitglieder')"
        >
          Mitglieder
        </button>
         <button
          :class="{'text-black border-b-2 border-black': currentSection === 'settings', 'text-gray-400': currentSection !== 'settings'}"
          class="font-bold text-base pb-1 px-2 focus:outline-none"
          @click="$emit('select-section', 'settings')"
        >
          Settings
        </button>
        <div
          class="absolute left-0 right-0 bottom-0 border-b border-gray-200"
          style="z-index: 0"
        ></div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { defineProps, defineEmits } from 'vue'

// Füge useRouter wieder hinzu
const router = useRouter()

const props = defineProps({
    currentSection: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['select-section'])

// Passe isActive an, um currentSection zu verwenden
const isActive = (sectionName) => {
    return props.currentSection === sectionName
}

// Funktion zum Navigieren zur /otto Seite
const navigateToOtto = () => {
  router.push('/otto')
}
</script> 