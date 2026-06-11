<script setup>
defineProps({
  orgId: { type: String, required: true },
  size: { type: Number, default: 20 },
})
</script>

<template>
  <!-- SpaceX — stylized geometric X -->
  <svg
    v-if="orgId === 'spacex'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" aria-hidden="true"
  >
    <path
      d="M4 18 L12 4 L20 18 M7 13 L17 13"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
    />
  </svg>

  <!-- NASA — simplified meatball mark -->
  <svg
    v-else-if="orgId === 'nasa'"
    :width="size" :height="size" viewBox="0 0 24 24"
    fill="none" aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
    <path d="M5 14 Q12 6 19 14" stroke="#c45c5c" stroke-width="2" fill="none" stroke-linecap="round" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
    <text x="12" y="21" text-anchor="middle" fill="currentColor" font-size="4.5" font-weight="700" font-family="Arial,sans-serif">NASA</text>
  </svg>
</template>
