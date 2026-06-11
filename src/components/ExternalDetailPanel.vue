<script setup>
import CompanyLogo from './CompanyLogo.vue'

defineProps({
  station: { type: Object, required: true },
})

defineEmits(['close'])
</script>

<template>
  <aside class="panel">
    <button class="close" aria-label="Close" @click="$emit('close')">✕</button>

    <div class="org-header">
      <span class="org-logo">
        <CompanyLogo :org-id="station.orgId" :size="22" />
      </span>
      <span class="org-name">{{ station.org.name }}</span>
    </div>

    <h2>{{ station.title }}</h2>

    <p class="note">
      External career pathway — experience here transfers in and out of B-Line X
      at the adjacent position on the map.
    </p>
  </aside>
</template>

<style scoped>
.panel {
  position: absolute;
  right: 24px;
  top: 110px;
  width: 300px;
  padding: 22px;
  border-radius: 20px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(14px);
}

.close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--panel-border);
  background: rgba(120, 160, 255, 0.06);
  color: var(--text-dim);
  cursor: pointer;
  font-size: 12px;
}

.close:hover {
  background: rgba(120, 160, 255, 0.15);
  color: var(--text);
}

.org-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding-right: 32px;
}

.org-logo {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid rgba(139, 149, 168, 0.35);
  background: rgba(139, 149, 168, 0.1);
  color: #a8b4c8;
}

.org-name {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-dim);
}

h2 {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
  margin-bottom: 14px;
}

.note {
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text-dim);
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed rgba(139, 149, 168, 0.35);
  background: rgba(139, 149, 168, 0.06);
}
</style>
