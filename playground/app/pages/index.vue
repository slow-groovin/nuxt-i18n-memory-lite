<template>
  <div>
    index

    <div>
      {{ locale }} {{ availableLocales }} 
      <br/>{{ localePath('/1') }} 
      <br/>
      {{ t('hello') }} 
    </div>
    <button @click="setLocale('ja')">ja</button>
    <button @click="setLocale('zh')">zh</button>
    <button @click="setLocale('en')">en</button>

    <div>
      <a :href="switchLocalePath('ja')">go ja</a>
      <a :href="switchLocalePath('en')">go en</a>
      <a :href="switchLocalePath('zh')">go zh</a>
    </div>
    
    <pre>{{ config }}</pre>

  </div>
</template>

<script setup>
const config=useRuntimeConfig().public.i18n
const {availableLocales,locale,t,localePath,setLocale,switchLocalePath}=useI18n()
</script>
