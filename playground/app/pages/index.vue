<template>
  <div style="padding: 0; margin: 0;">
    <h1 style="padding: 0; margin: 0 0 5px 0;">
      index
    </h1>

    <div style="padding: 5px 0; margin: 0;">
      <button @click="setLocale('ja')">
        ja
      </button>
      <button @click="setLocale('zh')">
        zh
      </button>
      <button @click="setLocale('en')">
        en
      </button>
    </div>

    <div style="padding: 5px 0; margin: 0;">
      <a :href="switchLocalePath('ja')">go ja</a>
      <a :href="switchLocalePath('en')">go en</a>
      <a :href="switchLocalePath('zh')">go zh</a>
    </div>

    <table
      border="1px"
      cellpadding="2"
      cellspacing="0"
      style="border:1px black; padding: 0; margin: 0; border-collapse: collapse; width: 100%;"
    >
      <thead>
        <tr>
          <th style="padding: 2px; margin: 0; text-align: left;">
            Property
          </th>
          <th style="padding: 2px; margin: 0; text-align: left;">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 2px; margin: 0;">
            locale
          </td>
          <td style="padding: 2px; margin: 0;">
            {{ locale }}
          </td>
        </tr>
        <tr>
          <td style="padding: 2px; margin: 0;">
            availableLocales
          </td>
          <td style="padding: 2px; margin: 0;">
            {{ availableLocales }}
          </td>
        </tr>
        <tr>
          <td style="padding: 2px; margin: 0;">
            t('hello')
          </td>
          <td style="padding: 2px; margin: 0;">
            {{ t('hello') }}
          </td>
        </tr>
        <tr>
          <td style="padding: 2px; margin: 0;">
            t("home.header.notify")
          </td>
          <td style="padding: 2px; margin: 0;">
            {{ t("home.header.notify") }}
          </td>
        </tr>
        <tr>
          <td style="padding: 2px; margin: 0;">
            localePath('/indexpage')
          </td>
          <td style="padding: 2px; margin: 0;">
            {{ localePath('/indexpage') }}
          </td>
        </tr>
        <tr>
          <td style="padding: 2px; margin: 0;">
            switchLocalePath('ja')
          </td>
          <td style="padding: 2px; margin: 0;">
            {{ switchLocalePath('ja') }}
          </td>
        </tr>
        <tr>
          <td style="padding: 2px; margin: 0;">
            switchLocalePath('en')
          </td>
          <td style="padding: 2px; margin: 0;">
            {{ switchLocalePath('en') }}
          </td>
        </tr>
        <tr>
          <td style="padding: 2px; margin: 0;">
            switchLocalePath('zh')
          </td>
          <td style="padding: 2px; margin: 0;">
            {{ switchLocalePath('zh') }}
          </td>
        </tr>
        <tr>
          <td style="padding: 2px; margin: 0;">
            config
          </td>
          <td style="padding: 2px; margin: 0;">
            <pre style="padding: 0; margin: 0;">{{ JSON.stringify(config, null, 2) }}</pre>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const config = useRuntimeConfig().public.i18n
const { availableLocales, locale, t, localePath, setLocale, switchLocalePath } = useI18n()
</script>
