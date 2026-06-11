// Mock career architecture for Helion Dynamics — a futuristic asteroid
// mining and deep space exploration company. Modeled as a metro transit
// system: three lines, stations are positions, interchanges allow
// transfers between tracks.

export const COMPANY = {
  name: 'HELION DYNAMICS',
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

// Map level -> world coordinates. X advances with seniority, Y is the
// "climb" (elevation), Z separates the three line corridors.
const LEVEL_SPACING_X = 6.5
const LEVEL_SPACING_Y = 3.1
const X = (l) => (l - 1) * LEVEL_SPACING_X - 22.75
const Y = (l) => (l - 1) * LEVEL_SPACING_Y

const station = (id, title, level, tracks, z, salary, description, requirements) => ({
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
})

export const STATIONS = [
  // ── Engineering Line ────────────────────────────────────────────────
  station(
    'e1', 'Systems Technician', 1, ['eng'], -8,
    '$68k – $86k',
    'Maintain and calibrate ground-side rig hardware, drone fleets, and launch support systems at Helion ground stations.',
    ['Associate degree or trade certification', 'Mechatronics fundamentals', '0–2 years experience'],
  ),
  station(
    'e2', 'Propulsion Engineer', 2, ['eng'], -8,
    '$95k – $128k',
    'Design and test ion thruster arrays and cold-gas maneuvering systems for ore-hauler spacecraft.',
    ['BS in Aerospace/Mechanical Engineering', 'Propulsion test experience', 'Vacuum systems knowledge'],
  ),
  station(
    'e3', 'Mining Systems Engineer', 4, ['eng'], -8,
    '$142k – $176k',
    'Own the extraction stack: anchoring rigs, regolith processors, and autonomous excavation swarms on target asteroids.',
    ['5+ years spacecraft systems', 'Robotics & autonomy', 'Microgravity operations cert'],
  ),
  station(
    'e4', 'Principal Spacecraft Architect', 5, ['eng'], -8,
    '$168k – $205k',
    'Set the technical architecture for next-generation hauler and refinery vessels across the Helion fleet.',
    ['8+ years multidisciplinary design', 'Fleet-level systems thinking', 'Flight heritage on 2+ vehicles'],
  ),
  station(
    'e5', 'VP of Engineering', 7, ['eng'], -8,
    '$248k – $320k + equity',
    'Lead all engineering organizations: propulsion, structures, autonomy, and mining systems. Own the fleet roadmap.',
    ['12+ years engineering leadership', 'Org building at scale', 'Program delivery track record'],
  ),
  station(
    'e6', 'Chief Engineering Officer', 8, ['eng'], -8,
    '$390k+ · executive package',
    'Executive accountable for every vehicle, rig, and robot Helion flies. Reports to the CEO; seat on Mission Council.',
    ['15+ years, VP-level experience', 'Board-level communication', 'Deep space program leadership'],
  ),

  // ── Sciences Line ───────────────────────────────────────────────────
  station(
    's1', 'Research Analyst', 1, ['sci'], 0,
    '$64k – $80k',
    'Process spectroscopy and radar returns from prospector probes to grade candidate asteroids for ore yield.',
    ['BS in Geology/Physics/Astronomy', 'Data analysis (Python)', 'Strong scientific writing'],
  ),
  station(
    's2', 'Astrogeologist', 2, ['sci'], 0,
    '$92k – $118k',
    'Characterize asteroid composition and structural integrity; build the geological models that guide every claim.',
    ['MS in Planetary Science preferred', 'Remote sensing experience', 'Mineralogy expertise'],
  ),
  station(
    's3', 'Senior Planetary Scientist', 4, ['sci'], 0,
    '$138k – $170k',
    'Lead survey campaigns for new claim regions and author the yield forecasts the company bets its capital on.',
    ['PhD or equivalent research record', '5+ years mission science', 'Published survey methodology'],
  ),
  station(
    's4', 'Deep Space Research Director', 6, ['sci'], 1.5,
    '$196k – $245k',
    'Direct the long-horizon research portfolio: outer-belt prospecting, ISRU science, and exploration missions.',
    ['10+ years research leadership', 'Cross-agency partnerships', 'Portfolio & budget ownership'],
  ),
  station(
    's5', 'VP of Science', 7, ['sci'], 0,
    '$240k – $310k + equity',
    'Lead all science organizations and arbitrate where Helion stakes its next decade of claims.',
    ['12+ years science leadership', 'Strategic capital allocation', 'External scientific standing'],
  ),
  station(
    's6', 'Chief Science Officer', 8, ['sci'], 0,
    '$380k+ · executive package',
    'Executive owner of Helion\'s scientific edge — from prospecting algorithms to exploration strategy.',
    ['15+ years, VP-level experience', 'Recognized field authority', 'Mission Council seat'],
  ),

  // ── Medical Line ────────────────────────────────────────────────────
  station(
    'm1', 'Medical Technician', 1, ['med'], 8,
    '$62k – $78k',
    'Staff crew health screening, hyperbaric support, and launch-day medical readiness at ground stations.',
    ['EMT-P or RT certification', 'Aerospace physiology basics', 'Emergency response training'],
  ),
  station(
    'm2', 'Flight Paramedic', 2, ['med'], 8,
    '$88k – $112k',
    'Provide acute care during crewed ascent, transit, and rig rotations. First responder for orbital incidents.',
    ['Critical care paramedic cert', 'Microgravity care training', '100+ hours simulator time'],
  ),
  station(
    'm3', 'Flight Surgeon', 3, ['med'], 8,
    '$165k – $210k',
    'Physician responsible for assigned crews pre-flight through recovery; clears every miner for EVA rotation.',
    ['MD/DO with aerospace medicine residency', 'Board certification', 'Operational medicine experience'],
  ),
  station(
    'm4', 'Senior Flight Surgeon', 4, ['med'], 8,
    '$198k – $240k',
    'Lead surgeon for an entire mining campaign; sets medical go/no-go policy and supervises flight surgeons.',
    ['5+ years as flight surgeon', 'Long-duration mission support', 'Telemedicine systems fluency'],
  ),
  station(
    'm5', 'VP of Space Medicine', 7, ['med'], 8,
    '$252k – $325k + equity',
    'Lead Helion\'s medical organization: crew health, habitat medicine, and the bioastronautics research group.',
    ['12+ years medical leadership', 'Regulatory & flight certification', 'Clinical org management'],
  ),
  station(
    'm6', 'Chief Medical Officer', 8, ['med'], 8,
    '$385k+ · executive package',
    'Executive accountable for the life and health of every human Helion sends past the Kármán line.',
    ['15+ years, VP-level experience', 'Aerospace medicine authority', 'Mission Council seat'],
  ),

  // ── Interchange stations (transfer between lines) ───────────────────
  station(
    'x1', 'Mission Operations Specialist', 3, ['eng', 'sci'], -4,
    '$118k – $148k',
    'Run live mining operations from the Flight Deck — fusing engineering telemetry with survey science to steer rigs in real time. A proving ground for both Engineering and Sciences careers.',
    ['3+ years in engineering or science role', 'Console certification', 'Real-time decision making'],
  ),
  station(
    'x2', 'Bioastronautics Lead', 5, ['sci', 'med'], 4,
    '$172k – $215k',
    'Lead the human-systems research program: radiation exposure, partial-g physiology, and closed-loop life support science. Bridges the Sciences and Medical lines.',
    ['Advanced degree in life sciences or medicine', 'Human research protocols', 'Lab leadership experience'],
  ),
  station(
    'x3', 'Crew Systems Director', 6, ['eng', 'med'], -2,
    '$205k – $255k',
    'Own every system that keeps crews alive — habitats, EVA suits, and medical hardware. The interchange where Engineering and Medical careers converge.',
    ['10+ years in crewed systems', 'Safety & certification authority', 'Cross-discipline leadership'],
  ),
]

// Ordered station sequence for each line, entry → executive.
export const LINES = {
  eng: ['e1', 'e2', 'x1', 'e3', 'e4', 'x3', 'e5', 'e6'],
  sci: ['s1', 's2', 'x1', 's3', 'x2', 's4', 's5', 's6'],
  med: ['m1', 'm2', 'm3', 'm4', 'x2', 'x3', 'm5', 'm6'],
}

export const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]))

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
