<script setup>
import { computed } from 'vue'
import { STAFF_YEARS } from '../data/careers'

const props = defineProps({
  trend: { type: Array, required: true },
})

const W = 280
const H = 72
const PAD_X = 8
const PAD_Y = 10

const current = computed(() => props.trend[0])
const projected = computed(() => props.trend[props.trend.length - 1])
const deltaPct = computed(() => Math.round(((projected.value - current.value) / current.value) * 100))
const direction = computed(() => (deltaPct.value > 0 ? 'up' : deltaPct.value < 0 ? 'down' : 'flat'))

const color = computed(
  () => ({ up: '#34d399', down: '#ff6b7d', flat: '#8da0c4' })[direction.value],
)

const points = computed(() => {
  const max = Math.max(...props.trend)
  const min = Math.min(...props.trend)
  const span = max - min || 1
  const stepX = (W - PAD_X * 2) / (props.trend.length - 1)
  return props.trend.map((v, i) => ({
    x: PAD_X + i * stepX,
    y: PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2),
    v,
  }))
})

const linePath = computed(() =>
  points.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '),
)

const areaPath = computed(
  () => `${linePath.value} L${points.value.at(-1).x},${H} L${points.value[0].x},${H} Z`,
)
</script>

<template>
  <div class="staff-chart">
    <div class="stats">
      <div class="stat">
        <span class="stat-label">Current staff</span>
        <span class="stat-value">{{ current }}</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ STAFF_YEARS.at(-1) }} expected</span>
        <span class="stat-value">{{ projected }}</span>
      </div>
      <div class="delta" :class="direction" :style="{ color }">
        <span v-if="direction === 'up'">▲</span>
        <span v-else-if="direction === 'down'">▼</span>
        <span v-else>—</span>
        {{ deltaPct === 0 ? 'flat' : Math.abs(deltaPct) + '%' }}
      </div>
    </div>

    <svg :viewBox="`0 0 ${W} ${H}`" class="spark" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="`fill-${direction}`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.35" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.02" />
        </linearGradient>
      </defs>
      <path :d="areaPath" :fill="`url(#fill-${direction})`" />
      <path :d="linePath" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      <circle
        v-for="(p, i) in points"
        :key="i"
        :cx="p.x" :cy="p.y"
        :r="i === 0 || i === points.length - 1 ? 3.2 : 2"
        :fill="i === 0 || i === points.length - 1 ? color : '#0d1322'"
        :stroke="color" stroke-width="1.5"
      />
    </svg>

    <div class="years">
      <span v-for="y in STAFF_YEARS" :key="y">{{ y }}</span>
    </div>
  </div>
</template>

<style scoped>
.staff-chart {
  padding: 12px;
  border-radius: 12px;
  background: rgba(120, 160, 255, 0.06);
  border: 1px solid var(--panel-border);
}

.stats {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  margin-bottom: 10px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.stat-value {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
}

.delta {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-bottom: 2px;
}

.spark {
  display: block;
  width: 100%;
  height: 72px;
}

.years {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--text-dim);
}
</style>
