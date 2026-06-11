<script setup>
import { computed } from 'vue'
import { TRACKS, nextStops } from '../data/careers'
import TrackIcon from './TrackIcon.vue'
import StaffChart from './StaffChart.vue'

const props = defineProps({
  station: { type: Object, required: true },
})

defineEmits(['close', 'select-station'])

const stationTracks = computed(() => props.station.tracks.map((t) => TRACKS[t]))
const promotions = computed(() => nextStops(props.station.id))
</script>

<template>
  <aside class="panel">
    <button class="close" aria-label="Close" @click="$emit('close')">✕</button>

    <div class="track-chips">
      <span
        v-for="t in stationTracks"
        :key="t.id"
        class="chip"
        :style="{ borderColor: t.color, color: t.color }"
      >
        <TrackIcon :track-id="t.id" :size="11" />
        {{ t.short }} · {{ t.name }}
      </span>
    </div>

    <h2>{{ station.title }}</h2>

    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Grade</span>
        <span class="meta-value">L{{ station.level }} — {{ station.levelName }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Compensation</span>
        <span class="meta-value">{{ station.salary }}</span>
      </div>
    </div>

    <div v-if="station.interchange" class="transfer-badge">
      <span class="transfer-icon"></span>
      Interchange station — transfer between lines available here
    </div>

    <p class="desc">{{ station.description }}</p>

    <div class="section">
      <h3>Staffing outlook</h3>
      <StaffChart :trend="station.staffTrend" />
    </div>

    <div class="section">
      <h3>Requirements</h3>
      <ul>
        <li v-for="req in station.requirements" :key="req">{{ req }}</li>
      </ul>
    </div>

    <div v-if="promotions.length" class="section">
      <h3>Next stops</h3>
      <button
        v-for="p in promotions"
        :key="p.station.id"
        class="next-stop"
        @click="$emit('select-station', p.station.id)"
      >
        <span class="next-line" :style="{ background: TRACKS[p.trackId].color }"></span>
        <span class="next-info">
          <span class="next-title">{{ p.station.title }}</span>
          <span class="next-sub">L{{ p.station.level }} · {{ TRACKS[p.trackId].name }}</span>
        </span>
        <span class="next-arrow">→</span>
      </button>
    </div>
    <div v-else class="section terminus">
      <h3>Terminus</h3>
      <p>End of the line — you've reached the top of this track.</p>
    </div>
  </aside>
</template>

<style scoped>
.panel {
  position: absolute;
  right: 24px;
  top: 110px;
  bottom: 70px;
  width: 360px;
  padding: 22px;
  border-radius: 20px;
  background: var(--panel);
  border: 1px solid var(--panel-border);
  backdrop-filter: blur(14px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(120, 160, 255, 0.25) transparent;
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
  transition: background 0.2s, color 0.2s;
}

.close:hover {
  background: rgba(120, 160, 255, 0.15);
  color: var(--text);
}

.track-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  padding-right: 32px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid;
}

h2 {
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 700;
  line-height: 1.25;
  margin-bottom: 16px;
}

.meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.meta-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(120, 160, 255, 0.06);
  border: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.meta-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.meta-value {
  font-size: 12.5px;
  font-weight: 600;
}

.transfer-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  font-size: 11.5px;
  font-weight: 500;
  margin-bottom: 14px;
}

.transfer-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 3px solid #fff;
  background: #0a1020;
  flex-shrink: 0;
}

.desc {
  font-size: 13px;
  line-height: 1.6;
  color: #c3cfe8;
  margin-bottom: 18px;
}

.section {
  margin-bottom: 18px;
}

.section h3 {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.section ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.section li {
  font-size: 12.5px;
  color: #c3cfe8;
  padding-left: 16px;
  position: relative;
  line-height: 1.45;
}

.section li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.7;
}

.next-stop {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  border: 1px solid var(--panel-border);
  background: rgba(120, 160, 255, 0.05);
  color: var(--text);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body);
  transition: background 0.2s, transform 0.15s;
}

.next-stop:hover {
  background: rgba(120, 160, 255, 0.12);
  transform: translateX(3px);
}

.next-line {
  width: 6px;
  height: 30px;
  border-radius: 999px;
  flex-shrink: 0;
}

.next-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.next-title {
  font-size: 13px;
  font-weight: 600;
}

.next-sub {
  font-size: 10.5px;
  color: var(--text-dim);
}

.next-arrow {
  color: var(--text-dim);
}

.terminus p {
  font-size: 12.5px;
  color: #c3cfe8;
}
</style>
