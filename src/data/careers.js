// Mock career architecture for B-Line X Dynamics — a futuristic asteroid
// mining and deep space exploration company. Modeled as a metro transit
// system: three lines, stations are positions, interchanges allow
// transfers between tracks.

export const COMPANY = {
  name: 'B-LINE X DYNAMICS',
  tagline: 'Asteroid Mining · Deep Space Exploration',
  mapTitle: 'Career Transit Map',
}

export const LEVEL_NAMES = [
  'Entry',
  'Associate',
  'Specialist',
  'Senior',
  'Lead',
  'Director',
  'Vice President',
  'Executive',
]

// Years covered by every position's staffing forecast (index-aligned
// with each station's staffTrend array).
export const STAFF_YEARS = [2026, 2027, 2028, 2029, 2030]

export const TRACKS = {
  eng: {
    id: 'eng',
    name: 'Engineering Line',
    short: 'ENG',
    color: '#ff9e2c',
    description: 'Spacecraft, propulsion, and orbital mining systems.',
  },
  sci: {
    id: 'sci',
    name: 'Sciences Line',
    short: 'SCI',
    color: '#27e6ff',
    description: 'Astrogeology, prospecting, and deep space research.',
  },
  med: {
    id: 'med',
    name: 'Medical Line',
    short: 'MED',
    color: '#ff4d8d',
    description: 'Crew health, space medicine, and bioastronautics.',
  },
}

// Career segments ("fare zones" on the map): contiguous level ranges.
export const SEGMENTS = [
  { id: 'early', name: 'Early Career', short: 'Early', levels: [1, 3], color: '#5b8dff' },
  { id: 'mid', name: 'Mid Career', short: 'Mid', levels: [4, 6], color: '#a78bfa' },
  { id: 'senior', name: 'Senior Career', short: 'Senior', levels: [7, 8], color: '#e8b84b' },
]

export const segmentForLevel = (level) =>
  SEGMENTS.find((s) => level >= s.levels[0] && level <= s.levels[1])

// Map level -> world coordinates. X advances with seniority, Y is the
// "climb" (elevation), Z separates the three line corridors.
export const LEVEL_SPACING_X = 6.5
const LEVEL_SPACING_Y = 3.1
const X = (l) => (l - 1) * LEVEL_SPACING_X - 22.75
const Y = (l) => (l - 1) * LEVEL_SPACING_Y

/** World x coordinate for a career level (used for zone bands in the scene). */
export const LEVEL_X = X

const station = (id, title, level, tracks, z, salary, description, requirements, staffTrend) => ({
  id,
  title,
  level,
  levelName: LEVEL_NAMES[level - 1],
  tracks,
  interchange: tracks.length > 1,
  pos: [X(level), Y(level), z],
  salary,
  description,
  requirements,
  staffTrend,
})

export const STATIONS = [
  // ── Engineering Line ────────────────────────────────────────────────
  station(
    'e1', 'Systems Technician', 1, ['eng'], -8,
    '$68k – $86k',
    'Maintain and calibrate ground-side rig hardware, drone fleets, and launch support systems at B-Line X ground stations.',
    ['Associate degree or trade certification', 'Mechatronics fundamentals', '0–2 years experience'],
    [86, 81, 75, 69, 62], // shrinking as drone maintenance is automated
  ),
  station(
    'e2', 'Propulsion Engineer', 2, ['eng'], -8,
    '$95k – $128k',
    'Design and test ion thruster arrays and cold-gas maneuvering systems for ore-hauler spacecraft.',
    ['BS in Aerospace/Mechanical Engineering', 'Propulsion test experience', 'Vacuum systems knowledge'],
    [54, 60, 68, 78, 88],
  ),
  station(
    'e3', 'Mining Systems Engineer', 4, ['eng'], -8,
    '$142k – $176k',
    'Own the extraction stack: anchoring rigs, regolith processors, and autonomous excavation swarms on target asteroids.',
    ['5+ years spacecraft systems', 'Robotics & autonomy', 'Microgravity operations cert'],
    [38, 47, 58, 73, 90],
  ),
  station(
    'e4', 'Principal Spacecraft Architect', 5, ['eng'], -8,
    '$168k – $205k',
    'Set the technical architecture for next-generation hauler and refinery vessels across the B-Line X fleet.',
    ['8+ years multidisciplinary design', 'Fleet-level systems thinking', 'Flight heritage on 2+ vehicles'],
    [12, 13, 15, 17, 19],
  ),
  station(
    'e5', 'VP of Engineering', 7, ['eng'], -8,
    '$248k – $320k + equity',
    'Lead all engineering organizations: propulsion, structures, autonomy, and mining systems. Own the fleet roadmap.',
    ['12+ years engineering leadership', 'Org building at scale', 'Program delivery track record'],
    [4, 4, 5, 5, 6],
  ),
  station(
    'e6', 'Chief Engineering Officer', 8, ['eng'], -8,
    '$390k+ · executive package',
    'Executive accountable for every vehicle, rig, and robot B-Line X flies. Reports to the CEO; seat on Mission Council.',
    ['15+ years, VP-level experience', 'Board-level communication', 'Deep space program leadership'],
    [1, 1, 1, 1, 1],
  ),

  // ── Sciences Line ───────────────────────────────────────────────────
  station(
    's1', 'Research Analyst', 1, ['sci'], 0,
    '$64k – $80k',
    'Process spectroscopy and radar returns from prospector probes to grade candidate asteroids for ore yield.',
    ['BS in Geology/Physics/Astronomy', 'Data analysis (Python)', 'Strong scientific writing'],
    [64, 58, 52, 46, 41], // ML pipelines absorb routine grading work
  ),
  station(
    's2', 'Astrogeologist', 2, ['sci'], 0,
    '$92k – $118k',
    'Characterize asteroid composition and structural integrity; build the geological models that guide every claim.',
    ['MS in Planetary Science preferred', 'Remote sensing experience', 'Mineralogy expertise'],
    [40, 46, 53, 61, 70],
  ),
  station(
    's3', 'Senior Planetary Scientist', 4, ['sci'], 0,
    '$138k – $170k',
    'Lead survey campaigns for new claim regions and author the yield forecasts the company bets its capital on.',
    ['PhD or equivalent research record', '5+ years mission science', 'Published survey methodology'],
    [22, 26, 30, 36, 42],
  ),
  station(
    's4', 'Deep Space Research Director', 6, ['sci'], 1.5,
    '$196k – $245k',
    'Direct the long-horizon research portfolio: outer-belt prospecting, ISRU science, and exploration missions.',
    ['10+ years research leadership', 'Cross-agency partnerships', 'Portfolio & budget ownership'],
    [8, 9, 10, 12, 14],
  ),
  station(
    's5', 'VP of Science', 7, ['sci'], 0,
    '$240k – $310k + equity',
    'Lead all science organizations and arbitrate where B-Line X stakes its next decade of claims.',
    ['12+ years science leadership', 'Strategic capital allocation', 'External scientific standing'],
    [3, 3, 4, 4, 5],
  ),
  station(
    's6', 'Chief Science Officer', 8, ['sci'], 0,
    '$380k+ · executive package',
    'Executive owner of B-Line X\'s scientific edge — from prospecting algorithms to exploration strategy.',
    ['15+ years, VP-level experience', 'Recognized field authority', 'Mission Council seat'],
    [1, 1, 1, 1, 1],
  ),

  // ── Medical Line ────────────────────────────────────────────────────
  station(
    'm1', 'Medical Technician', 1, ['med'], 8,
    '$62k – $78k',
    'Staff crew health screening, hyperbaric support, and launch-day medical readiness at ground stations.',
    ['EMT-P or RT certification', 'Aerospace physiology basics', 'Emergency response training'],
    [48, 53, 60, 67, 74],
  ),
  station(
    'm2', 'Flight Paramedic', 2, ['med'], 8,
    '$88k – $112k',
    'Provide acute care during crewed ascent, transit, and rig rotations. First responder for orbital incidents.',
    ['Critical care paramedic cert', 'Microgravity care training', '100+ hours simulator time'],
    [36, 34, 32, 30, 28], // telemedicine and robotic triage reduce seats
  ),
  station(
    'm3', 'Flight Surgeon', 3, ['med'], 8,
    '$165k – $210k',
    'Physician responsible for assigned crews pre-flight through recovery; clears every miner for EVA rotation.',
    ['MD/DO with aerospace medicine residency', 'Board certification', 'Operational medicine experience'],
    [18, 22, 26, 31, 36],
  ),
  station(
    'm4', 'Senior Flight Surgeon', 4, ['med'], 8,
    '$198k – $240k',
    'Lead surgeon for an entire mining campaign; sets medical go/no-go policy and supervises flight surgeons.',
    ['5+ years as flight surgeon', 'Long-duration mission support', 'Telemedicine systems fluency'],
    [8, 9, 11, 13, 15],
  ),
  station(
    'm5', 'VP of Space Medicine', 7, ['med'], 8,
    '$252k – $325k + equity',
    'Lead B-Line X\'s medical organization: crew health, habitat medicine, and the bioastronautics research group.',
    ['12+ years medical leadership', 'Regulatory & flight certification', 'Clinical org management'],
    [2, 3, 3, 4, 4],
  ),
  station(
    'm6', 'Chief Medical Officer', 8, ['med'], 8,
    '$385k+ · executive package',
    'Executive accountable for the life and health of every human B-Line X sends past the Kármán line.',
    ['15+ years, VP-level experience', 'Aerospace medicine authority', 'Mission Council seat'],
    [1, 1, 1, 1, 1],
  ),

  // ── Interchange stations (transfer between lines) ───────────────────
  station(
    'x1', 'Mission Operations Specialist', 3, ['eng', 'sci'], -4,
    '$118k – $148k',
    'Run live mining operations from the Flight Deck — fusing engineering telemetry with survey science to steer rigs in real time. A proving ground for both Engineering and Sciences careers.',
    ['3+ years in engineering or science role', 'Console certification', 'Real-time decision making'],
    [26, 34, 44, 56, 70],
  ),
  station(
    'x2', 'Bioastronautics Lead', 5, ['sci', 'med'], 4,
    '$172k – $215k',
    'Lead the human-systems research program: radiation exposure, partial-g physiology, and closed-loop life support science. Bridges the Sciences and Medical lines.',
    ['Advanced degree in life sciences or medicine', 'Human research protocols', 'Lab leadership experience'],
    [10, 12, 15, 18, 22],
  ),
  station(
    'x3', 'Crew Systems Director', 6, ['eng', 'med'], -2,
    '$205k – $255k',
    'Own every system that keeps crews alive — habitats, EVA suits, and medical hardware. The interchange where Engineering and Medical careers converge.',
    ['10+ years in crewed systems', 'Safety & certification authority', 'Cross-discipline leadership'],
    [5, 6, 7, 8, 10],
  ),
]

// Ordered station sequence for each line, entry → executive.
export const LINES = {
  eng: ['e1', 'e2', 'x1', 'e3', 'e4', 'x3', 'e5', 'e6'],
  sci: ['s1', 's2', 'x1', 's3', 'x2', 's4', 's5', 's6'],
  med: ['m1', 'm2', 'm3', 'm4', 'x2', 'x3', 'm5', 'm6'],
}

export const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]))

// ── External company pathways (grey branch lines off the main network) ──

export const EXTERNAL_ORGS = {
  spacex: {
    id: 'spacex',
    name: 'SpaceX',
    color: '#8b95a8',
  },
  nasa: {
    id: 'nasa',
    name: 'NASA',
    color: '#8b95a8',
  },
}

// Vertical-diagonal branch offsets (y, z) — step upward then sideways in Z,
// staying in the same seniority column (X) so branches never cross other lines.
const externalDefs = [
  // Engineering ↔ SpaceX — branch up and toward the ENG outer edge (z −)
  { id: 'ext_sx1', orgId: 'spacex', title: 'Launch Vehicle Engineer', linkedTo: 'e2', branch: { y: 2.2, z: -2.5 } },
  { id: 'ext_sx2', orgId: 'spacex', title: 'Starship Systems Engineer', linkedTo: 'e3', branch: { y: 2.8, z: -3 } },
  { id: 'ext_sx3', orgId: 'spacex', title: 'Senior Propulsion Architect', linkedTo: 'e4', branch: { y: 3.4, z: -3.5 } },
  // Sciences ↔ NASA — branch up and away from Medical (z −, toward ENG side)
  { id: 'ext_nasa1', orgId: 'nasa', title: 'Planetary Science Fellow', linkedTo: 's2', branch: { y: 2.2, z: -2.5 } },
  { id: 'ext_nasa2', orgId: 'nasa', title: 'Mission Science Lead', linkedTo: 's3', branch: { y: 2.8, z: -3 } },
  { id: 'ext_nasa3', orgId: 'nasa', title: 'Deep Space Program Director', linkedTo: 's4', branch: { y: 3.4, z: -3.5 } },
]

export const EXTERNAL_STATIONS = externalDefs.map((ext) => {
  const linked = STATION_BY_ID[ext.linkedTo]
  const { y, z } = ext.branch
  return {
    id: ext.id,
    orgId: ext.orgId,
    org: EXTERNAL_ORGS[ext.orgId],
    title: ext.title,
    linkedTo: ext.linkedTo,
    external: true,
    track: linked.tracks[0],
    level: linked.level,
    branch: ext.branch,
    pos: [linked.pos[0], linked.pos[1] + y, linked.pos[2] + z],
  }
})

export const EXTERNAL_BY_ID = Object.fromEntries(EXTERNAL_STATIONS.map((s) => [s.id, s]))
export const NODE_BY_ID = { ...STATION_BY_ID, ...EXTERNAL_BY_ID }

/** External pathways reachable from an internal station. */
export function externalLinksFor(stationId) {
  return EXTERNAL_STATIONS.filter((e) => e.linkedTo === stationId)
}

/** Next positions reachable from a station (promotions along each line). */
export function nextStops(stationId) {
  const out = []
  for (const [trackId, seq] of Object.entries(LINES)) {
    const i = seq.indexOf(stationId)
    if (i !== -1 && i < seq.length - 1) {
      const next = STATION_BY_ID[seq[i + 1]]
      if (!out.some((o) => o.station.id === next.id)) out.push({ trackId, station: next })
    }
  }
  return out
}
