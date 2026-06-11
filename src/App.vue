<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { MetroScene } from './three/MetroScene'
import { COMPANY, STATION_BY_ID } from './data/careers'
import TrackLegend from './components/TrackLegend.vue'
import DetailPanel from './components/DetailPanel.vue'

const container = ref(null)
const selected = ref(null)
const focusedTrack = ref(null)
let scene = null

onMounted(() => {
  scene = new MetroScene(container.value, {
    onSelect: (id) => {
      selected.value = id ? STATION_BY_ID[id] : null
      if (id) focusedTrack.value = null
    },
  })
})

onBeforeUnmount(() => scene?.dispose())

function handleFocusTrack(trackId) {
  focusedTrack.value = focusedTrack.value === trackId ? null : trackId
  selected.value = null
  scene?.focusTrack(focusedTrack.value)
}

function handleReset() {
  focusedTrack.value = null
  selected.value = null
  scene?.resetView()
}

function handleSelectStation(id) {
  selected.value = STATION_BY_ID[id]
  focusedTrack.value = null
  scene?.selectStation(id)
}

function handleClosePanel() {
  selected.value = null
  scene?.selectStation(null)
}
</script>

<template>
  <div class="app">
    <div ref="container" class="canvas-host"></div>

    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">◆</div>
        <div>
          <h1>{{ COMPANY.name }}</h1>
          <p>{{ COMPANY.tagline }}</p>
        </div>
      </div>
      <div class="map-title">{{ COMPANY.mapTitle }}</div>
    </header>

    <TrackLegend
      :focused-track="focusedTrack"
      @focus-track="handleFocusTrack"
      @reset="handleReset"
    />

    <Transition name="panel">
      <DetailPanel
        v-if="selected"
        :station="selected"
        @close="handleClosePanel"
        @select-station="handleSelectStation"
      />
    </Transition>

    <footer class="hints">
      <span><b>Drag</b> orbit</span>
      <span class="sep">·</span>
      <span><b>Scroll</b> zoom</span>
      <span class="sep">·</span>
      <span><b>Click a station</b> for position details</span>
    </footer>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  width: 100%;
  height: 100%;
}

.canvas-host {
  position: absolute;
  inset: 0;
}

.canvas-host :deep(canvas) {
  display: block;
  cursor: grab;
}

/* ── Top bar ─────────────────────────────────────────────────────────── */

.topbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 28px;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(7, 11, 20, 0.85), transparent);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  font-size: 18px;
  color: var(--accent);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  background: var(--panel);
  backdrop-filter: blur(8px);
  text-shadow: 0 0 12px var(--accent);
}

.brand h1 {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 900;
  letter-spacing: 0.22em;
}

.brand p {
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.08em;
  margin-top: 2px;
}

.map-title {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 8px 16px;
  border: 1px solid var(--panel-border);
  border-radius: 999px;
  background: var(--panel);
  backdrop-filter: blur(8px);
}

/* ── Footer hints ────────────────────────────────────────────────────── */

.hints {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 11.5px;
  color: var(--text-dim);
  padding: 8px 18px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(8px);
  pointer-events: none;
  letter-spacing: 0.03em;
}

.hints b {
  color: var(--text);
  font-weight: 600;
}

.hints .sep {
  opacity: 0.4;
}

/* ── Detail panel transition ─────────────────────────────────────────── */

.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
