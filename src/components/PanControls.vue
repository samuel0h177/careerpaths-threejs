<script setup>
defineEmits(['pan'])
</script>

<template>
  <div class="pan-controls" role="group" aria-label="Pan map">
    <span class="pan-label">Pan</span>
    <div class="pad">
      <button class="pan-btn up" aria-label="Pan up" @click="$emit('pan', 'up')">▲</button>
      <div class="pan-row">
        <button class="pan-btn" aria-label="Pan left" @click="$emit('pan', 'left')">◀</button>
        <span class="pan-center"></span>
        <button class="pan-btn" aria-label="Pan right" @click="$emit('pan', 'right')">▶</button>
      </div>
      <button class="pan-btn down" aria-label="Pan down" @click="$emit('pan', 'down')">▼</button>
    </div>
  </div>
</template>

<style scoped>
.pan-controls {
  position: absolute;
  left: 24px;
  bottom: 68px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: 16px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(12px);
}

.pan-label {
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.pan-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pan-btn {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid var(--panel-border);
  background: rgba(120, 160, 255, 0.06);
  color: var(--text);
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.pan-btn:hover {
  background: rgba(120, 160, 255, 0.14);
  border-color: rgba(39, 230, 255, 0.35);
}

.pan-btn:active {
  transform: scale(0.94);
  background: rgba(39, 230, 255, 0.12);
}

.pan-center {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px dashed rgba(120, 160, 255, 0.15);
  background: rgba(120, 160, 255, 0.03);
}

.up,
.down {
  width: 36px;
}
</style>
