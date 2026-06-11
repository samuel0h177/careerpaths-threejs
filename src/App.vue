<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { MetroScene } from './three/MetroScene'
import { COMPANY, NODE_BY_ID } from './data/careers'
import TrackLegend from './components/TrackLegend.vue'
import DetailPanel from './components/DetailPanel.vue'
import ExternalDetailPanel from './components/ExternalDetailPanel.vue'

const container = ref(null)
const selected = ref(null)
const focusedTrack = ref(null)
let scene = null

onMounted(() => {
  scene = new MetroScene(container.value, {
    onSelect: (id) => {
      selected.value = id ? NODE_BY_ID[id] : null
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
  selected.value = NODE_BY_ID[id]
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
        <div class="brand-mark">
        <svg width="33" height="22" viewBox="0 0 35 24" aria-label="Pac-Man eating an asteroid as big as itself">
          <!-- Pac-Man, mouth open toward the asteroid -->
          <path d="M7.3 12 L13.5 8.7 A6.6 6.6 0 1 0 13.5 15.3 Z" fill="currentColor" />
          <circle cx="8.2" cy="8.2" r="1" fill="#0d1322" />
          <!-- Asteroid, every bit as big as Pac-Man -->
          <path
            d="M16.5 10.5 L18.5 7.5 L22 6 L25.5 6.8 L28 9 L28.8 12.5 L27.5 15.5 L24 17.2 L20.5 16.8 L17.5 14.5 Z"
            fill="#9aa7c4"
          />
          <circle cx="21.5" cy="10.5" r="1.2" fill="#5d6b8c" />
          <circle cx="25" cy="13.6" r="0.9" fill="#5d6b8c" />
          <circle cx="19.5" cy="14" r="0.7" fill="#5d6b8c" />
        </svg>
      </div>
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
        v-if="selected && !selected.external"
        :station="selected"
        @close="handleClosePanel"
        @select-station="handleSelectStation"
      />
      <ExternalDetailPanel
        v-else-if="selected?.external"
        :station="selected"
        @close="handleClosePanel"
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
  /* Contain CSS2D label z-indexes so UI panels always paint above them */
  z-index: 0;
}

.topbar,
.legend,
.panel,
.hints {
  z-index: 1;
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
  color: var(--accent);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  background: var(--panel);
  backdrop-filter: blur(8px);
}

.brand-mark svg {
  filter: drop-shadow(0 0 7px rgba(39, 230, 255, 0.55));
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
