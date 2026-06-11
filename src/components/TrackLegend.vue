<script setup>
import { TRACKS, SEGMENTS } from '../data/careers'
import TrackIcon from './TrackIcon.vue'

defineProps({
  focusedTrack: { type: String, default: null },
})

defineEmits(['focus-track', 'reset'])
</script>

<template>
  <aside class="legend">
    <div class="legend-head">Lines</div>
    <button
      v-for="track in TRACKS"
      :key="track.id"
      class="line-row"
      :class="{ active: focusedTrack === track.id, faded: focusedTrack && focusedTrack !== track.id }"
      @click="$emit('focus-track', track.id)"
    >
      <span
        class="icon-badge"
        :style="{ color: track.color, borderColor: track.color + '55', background: track.color + '14' }"
      >
        <TrackIcon :track-id="track.id" :size="16" />
      </span>
      <span class="line-info">
        <span class="line-name">{{ track.name }}</span>
        <span class="line-desc">{{ track.description }}</span>
      </span>
      <span class="line-code" :style="{ color: track.color }">{{ track.short }}</span>
    </button>

    <div class="legend-divider"></div>

    <div class="key-row">
      <span class="key-mark interchange-mark"></span>
      <span>Interchange — switch tracks</span>
    </div>
    <div class="key-row">
      <span class="key-mark station-mark"></span>
      <span>Position</span>
    </div>
    <div class="key-row">
      <span class="key-mark external-mark"></span>
      <span>External pathway</span>
    </div>

    <div class="legend-divider"></div>

    <div class="legend-head">Career zones</div>
    <div class="zones-row">
      <span v-for="s in SEGMENTS" :key="s.id" class="zone-key">
        <span class="zone-dot" :style="{ background: s.color, boxShadow: `0 0 8px ${s.color}88` }"></span>
        <span class="zone-name">{{ s.short }}</span>
        <span class="zone-range">L{{ s.levels[0] }}–{{ s.levels[1] }}</span>
      </span>
    </div>

    <button class="reset-btn" @click="$emit('reset')">⟲ Reset view</button>
  </aside>
</template>

<style scoped>
.legend {
  position: absolute;
  left: 24px;
  top: 110px;
  width: 285px;
  padding: 16px;
  border-radius: 18px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-head {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 2px;
}

.line-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body);
  transition: background 0.2s, border-color 0.2s, opacity 0.25s;
}

.line-row:hover {
  background: rgba(120, 160, 255, 0.08);
}

.line-row.active {
  background: rgba(120, 160, 255, 0.1);
  border-color: var(--panel-border);
}

.line-row.faded {
  opacity: 0.4;
}

.icon-badge {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1px solid;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px currentColor);
}

.line-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.line-name {
  font-size: 13px;
  font-weight: 600;
}

.line-desc {
  font-size: 10.5px;
  color: var(--text-dim);
  line-height: 1.35;
}

.line-code {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.legend-divider {
  height: 1px;
  background: var(--panel-border);
  margin: 4px 0;
}

.key-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-dim);
  padding: 0 12px;
}

.key-mark {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.interchange-mark {
  border: 2px solid #fff;
  background: #0a1020;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.35);
}

.station-mark {
  background: var(--accent);
  width: 10px;
  height: 10px;
  box-shadow: 0 0 6px var(--accent);
}

.external-mark {
  width: 10px;
  height: 10px;
  background: #6b7280;
  transform: rotate(45deg);
  border-radius: 2px;
}

.zones-row {
  display: flex;
  justify-content: space-between;
  padding: 2px 12px 4px;
}

.zone-key {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.zone-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.zone-name {
  font-weight: 600;
}

.zone-range {
  font-size: 9.5px;
  color: var(--text-dim);
  font-family: var(--font-display);
}

.reset-btn {
  margin-top: 6px;
  padding: 9px;
  border-radius: 10px;
  border: 1px solid var(--panel-border);
  background: rgba(120, 160, 255, 0.06);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s;
}

.reset-btn:hover {
  background: rgba(120, 160, 255, 0.14);
}
</style>
