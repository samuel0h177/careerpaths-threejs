import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import {
  TRACKS,
  STATIONS,
  LINES,
  STATION_BY_ID,
  EXTERNAL_STATIONS,
  NODE_BY_ID,
  SEGMENTS,
  LEVEL_X,
  LEVEL_SPACING_X,
} from '../data/careers'

const BG_COLOR = 0x070b14
const TUBE_RADIUS = 0.3
const EXTERNAL_TUBE_RADIUS = 0.17
const EXTERNAL_COLOR = 0x6b7280
const CORNER_RADIUS = 2.4
// Tiny per-line elevation offsets so crossing tubes never clip each other.
const LINE_Y_OFFSET = { eng: 0, sci: 0.14, med: 0.28 }

const DEFAULT_TARGET = new THREE.Vector3(0, 10, 0)
// Near-vertical: initial/reset view looks down on the map like a printed
// metro plan (slight tilt keeps OrbitControls stable and hints at depth).
const DEFAULT_CAM_DIR = new THREE.Vector3(0.05, 1, 0.22).normalize()
const MAP_RADIUS = 31 // bounding radius of the whole network

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Vertex-color gradient along a tube: track color at the root, grey at the tip. */
function applyTubeColorFade(geometry, tubularSegments, radialSegments, colorStart, colorEnd) {
  const count = geometry.attributes.position.count
  const colors = new Float32Array(count * 3)
  const a = new THREE.Color(colorStart)
  const b = new THREE.Color(colorEnd)
  const vertsPerRing = radialSegments + 1

  for (let ring = 0; ring <= tubularSegments; ring++) {
    const t = ring / tubularSegments
    const c = a.clone().lerp(b, t)
    for (let r = 0; r < vertsPerRing; r++) {
      const vi = ring * vertsPerRing + r
      if (vi >= count) continue
      colors[vi * 3] = c.r
      colors[vi * 3 + 1] = c.g
      colors[vi * 3 + 2] = c.b
    }
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
}

/** Build a metro-style path: straight runs with rounded corners. */
function roundedPath(points, radius = CORNER_RADIUS) {
  const path = new THREE.CurvePath()
  let prev = points[0].clone()
  for (let i = 1; i < points.length - 1; i++) {
    const cur = points[i]
    const next = points[i + 1]
    const inDir = cur.clone().sub(prev)
    const outDir = next.clone().sub(cur)
    const rIn = Math.min(radius, inDir.length() * 0.45)
    const rOut = Math.min(radius, outDir.length() * 0.45)
    const cornerStart = cur.clone().sub(inDir.normalize().multiplyScalar(rIn))
    const cornerEnd = cur.clone().add(outDir.normalize().multiplyScalar(rOut))
    if (cornerStart.distanceTo(prev) > 1e-4) path.add(new THREE.LineCurve3(prev, cornerStart))
    path.add(new THREE.QuadraticBezierCurve3(cornerStart, cur.clone(), cornerEnd))
    prev = cornerEnd
  }
  path.add(new THREE.LineCurve3(prev, points[points.length - 1].clone()))
  return path
}

export class MetroScene {
  constructor(container, { onSelect, onHover } = {}) {
    this.container = container
    this.onSelect = onSelect
    this.onHover = onHover

    this.selectedId = null
    this.hoveredId = null
    this.focusedTrack = null
    this.disposed = false
    this.clock = new THREE.Clock()
    this.cameraAnim = null

    this.initRenderer()
    this.initScene()
    this.buildEnvironment()
    this.buildZones()
    this.buildLines()
    this.buildExternalLinks()
    this.buildStations()
    this.buildExternalStations()
    this.buildTrains()
    this.initPostprocessing()
    this.bindEvents()

    this.renderer.setAnimationLoop(() => this.tick())
  }

  // ── Setup ─────────────────────────────────────────────────────────────

  initRenderer() {
    const { clientWidth: w, clientHeight: h } = this.container

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.1
    this.container.appendChild(this.renderer.domElement)

    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(w, h)
    Object.assign(this.labelRenderer.domElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      pointerEvents: 'none',
    })
    this.container.appendChild(this.labelRenderer.domElement)
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(BG_COLOR)
    this.scene.fog = new THREE.FogExp2(BG_COLOR, 0.0028)

    const { clientWidth: w, clientHeight: h } = this.container
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
    this.camera.position.copy(this.defaultCameraPos())

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.copy(DEFAULT_TARGET)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.rotateSpeed = 0.45
    this.controls.panSpeed = 0.55
    this.controls.zoomSpeed = 0.7
    this.controls.minDistance = 8
    this.controls.maxDistance = 130
    this.controls.maxPolarAngle = Math.PI * 0.52

    this.scene.add(new THREE.AmbientLight(0x8899bb, 0.55))
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(20, 40, 25)
    this.scene.add(key)
    const rim = new THREE.DirectionalLight(0x4466ff, 0.5)
    rim.position.set(-30, 15, -30)
    this.scene.add(rim)
  }

  buildEnvironment() {
    // Starfield shell
    const starCount = 2200
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const r = 160 + Math.random() * 240
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) - 40
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const starMat = new THREE.PointsMaterial({
      color: 0xbcd2ff,
      size: 0.9,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    })
    this.stars = new THREE.Points(starGeo, starMat)
    this.scene.add(this.stars)

    // Subtle floor grid, like a holographic projection table
    const grid = new THREE.GridHelper(220, 55, 0x1c2c4a, 0x121e36)
    grid.position.y = -3
    grid.material.transparent = true
    grid.material.opacity = 0.5
    this.scene.add(grid)

    const glowGeo = new THREE.CircleGeometry(60, 64)
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x0e1830,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.rotation.x = -Math.PI / 2
    glow.position.y = -2.98
    this.scene.add(glow)
  }

  // ── Career segment zones (metro "fare zone" bands on the floor) ──────

  buildZones() {
    const ZONE_DEPTH = 32
    const ZONE_Y = -2.92

    for (const seg of SEGMENTS) {
      const x0 = LEVEL_X(seg.levels[0]) - LEVEL_SPACING_X / 2
      const x1 = LEVEL_X(seg.levels[1]) + LEVEL_SPACING_X / 2
      const center = (x0 + x1) / 2
      const color = new THREE.Color(seg.color)

      const band = new THREE.Mesh(
        new THREE.PlaneGeometry(x1 - x0, ZONE_DEPTH),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07, depthWrite: false }),
      )
      band.rotation.x = -Math.PI / 2
      band.position.set(center, ZONE_Y, 0)
      this.scene.add(band)

      // Crisp boundary strips so bands read in the top-down view
      for (const xe of [x0, x1]) {
        const strip = new THREE.Mesh(
          new THREE.PlaneGeometry(0.14, ZONE_DEPTH),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, depthWrite: false }),
        )
        strip.rotation.x = -Math.PI / 2
        strip.position.set(xe, ZONE_Y + 0.01, 0)
        this.scene.add(strip)
      }

      const el = document.createElement('div')
      el.className = 'zone-label'
      el.style.color = seg.color
      el.textContent = `${seg.name} · L${seg.levels[0]}–L${seg.levels[1]}`
      const label = new CSS2DObject(el)
      label.position.set(center, ZONE_Y, ZONE_DEPTH / 2 + 2)
      this.scene.add(label)
    }
  }

  // ── Metro lines ───────────────────────────────────────────────────────

  buildLines() {
    this.lineMeshes = {}
    this.lineCurves = {}

    for (const [trackId, seq] of Object.entries(LINES)) {
      const yOff = LINE_Y_OFFSET[trackId]
      const pts = seq.map((id) => {
        const [x, y, z] = STATION_BY_ID[id].pos
        return new THREE.Vector3(x, y + yOff, z)
      })
      const path = roundedPath(pts)
      this.lineCurves[trackId] = path

      const geo = new THREE.TubeGeometry(path, 240, TUBE_RADIUS, 14, false)
      const color = new THREE.Color(TRACKS[trackId].color)
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.35,
        metalness: 0.1,
        transparent: true,
        opacity: 1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.userData.trackId = trackId
      this.scene.add(mesh)
      this.lineMeshes[trackId] = mesh
    }
  }

  buildExternalLinks() {
    this.externalLineMeshes = []

    for (const ext of EXTERNAL_STATIONS) {
      const linked = STATION_BY_ID[ext.linkedTo]
      const yOff = LINE_Y_OFFSET[ext.track]
      const { y: yBranch, z: zBranch } = ext.branch
      const [ix, iy, iz] = linked.pos
      const [ex, ey, ez] = ext.pos
      const internal = new THREE.Vector3(ix, iy + yOff, iz)
      // Vertical-diagonal dogleg: rise in Y, then step in Z (same X column)
      const bendY = new THREE.Vector3(ix, iy + yOff + yBranch, iz)
      const external = new THREE.Vector3(ex, ey + 0.14, ez)
      const path = roundedPath([internal, bendY, external], 0.9)

      const tubularSegments = 40
      const radialSegments = 10
      const geo = new THREE.TubeGeometry(path, tubularSegments, EXTERNAL_TUBE_RADIUS, radialSegments, false)
      const trackColor = TRACKS[ext.track].color
      applyTubeColorFade(geo, tubularSegments, radialSegments, trackColor, EXTERNAL_COLOR)

      const grey = new THREE.Color(EXTERNAL_COLOR)
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: grey,
        emissiveIntensity: 0.1,
        roughness: 0.45,
        metalness: 0.05,
        transparent: true,
        opacity: 0.7,
        vertexColors: true,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.userData.track = ext.track
      this.scene.add(mesh)
      this.externalLineMeshes.push(mesh)
    }
  }

  buildStations() {
    this.stationGroups = {}
    this.hitboxes = []

    const trackSphereMat = (hex, intensity = 0.6) => {
      const color = new THREE.Color(hex)
      return new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: intensity,
        roughness: 0.35,
        metalness: 0.08,
        transparent: true,
      })
    }

    for (const st of STATIONS) {
      const group = new THREE.Group()
      group.position.set(st.pos[0], st.pos[1] + 0.14, st.pos[2])
      const isCSuite = st.level >= 8
      const trackColor = TRACKS[st.tracks[0]].color

      if (st.interchange) {
        // Nested spheres — white shell, dark core, bright center (transfer station)
        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(1.1, 28, 28),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.2,
            roughness: 0.4,
            transparent: true,
            opacity: 0.85,
          }),
        )
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(0.72, 24, 24),
          new THREE.MeshStandardMaterial({
            color: 0x0a1020,
            emissive: 0x0a1020,
            emissiveIntensity: 0.15,
            roughness: 0.55,
            transparent: true,
          }),
        )
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 16, 16),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.35,
            roughness: 0.35,
            transparent: true,
          }),
        )
        group.add(shell, core, dot)
      } else if (isCSuite) {
        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.82, 32, 32),
          trackSphereMat(trackColor, 0.65),
        )
        const highlight = new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 20, 20),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.25,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9,
          }),
        )
        highlight.position.set(0.18, 0.22, 0.18)
        group.add(body, highlight)
      } else {
        const body = new THREE.Mesh(
          new THREE.SphereGeometry(0.55, 28, 28),
          trackSphereMat(trackColor),
        )
        const highlight = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 16, 16),
          new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.2,
            roughness: 0.35,
            transparent: true,
            opacity: 0.85,
          }),
        )
        highlight.position.set(0.12, 0.15, 0.12)
        group.add(body, highlight)
      }

      // Invisible hitbox for raycasting
      const hitR = st.interchange ? 1.9 : isCSuite ? 2.2 : 1.5
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(hitR, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      )
      hit.userData.stationId = st.id
      group.add(hit)
      this.hitboxes.push(hit)

      // Floating label
      const el = document.createElement('div')
      el.className = 'station-label'
        + (st.interchange ? ' interchange' : '')
        + (isCSuite ? ' c-suite' : '')
      el.innerHTML = `<span class="label-title">${st.title}</span><span class="label-level">L${st.level}</span>`
      const label = new CSS2DObject(el)
      // Alternate label heights between adjacent levels to reduce overlap
      label.position.set(0, isCSuite ? 2.6 : st.level % 2 === 1 ? 1.4 : 2.4, 0)
      group.add(label)

      group.userData.station = st
      group.userData.labelEl = el
      this.scene.add(group)
      this.stationGroups[st.id] = group
    }

    // Pulsing selection marker
    const selGeo = new THREE.TorusGeometry(1.7, 0.07, 12, 56)
    const selMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    this.selectionRing = new THREE.Mesh(selGeo, selMat)
    this.selectionRing.rotation.x = Math.PI / 2
    this.selectionRing.visible = false
    this.selectionRingBaseScale = 1
    this.scene.add(this.selectionRing)
  }

  buildExternalStations() {
    const greyMat = () =>
      new THREE.MeshStandardMaterial({
        color: EXTERNAL_COLOR,
        emissive: EXTERNAL_COLOR,
        emissiveIntensity: 0.15,
        roughness: 0.55,
        transparent: true,
      })
    const coreMat = () =>
      new THREE.MeshStandardMaterial({
        color: 0x3d4450,
        emissive: 0x2a3040,
        emissiveIntensity: 0.1,
        roughness: 0.6,
        transparent: true,
      })

    const logoSvg = {
      spacex: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 18 L12 4 L20 18 M7 13 L17 13" stroke="#a8b4c8" stroke-width="2.2" stroke-linecap="round"/></svg>`,
      nasa: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="11" r="7" stroke="#a8b4c8" stroke-width="1.4"/><path d="M6 13 Q12 7 18 13" stroke="#c45c5c" stroke-width="1.6" fill="none"/></svg>`,
    }

    for (const ext of EXTERNAL_STATIONS) {
      const group = new THREE.Group()
      group.position.set(ext.pos[0], ext.pos[1] + 0.14, ext.pos[2])

      // Diamond marker — visually distinct from internal round stations
      const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), greyMat())
      diamond.rotation.y = Math.PI / 4
      const core = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.5), coreMat())
      core.rotation.y = Math.PI / 4
      group.add(diamond, core)

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 8, 8),
        new THREE.MeshBasicMaterial({ visible: false }),
      )
      hit.userData.stationId = ext.id
      group.add(hit)
      this.hitboxes.push(hit)

      const el = document.createElement('div')
      el.className = 'external-label'
      el.innerHTML = `<span class="ext-logo">${logoSvg[ext.orgId]}</span><span class="ext-title">${ext.title}</span>`
      const label = new CSS2DObject(el)
      label.position.set(0, 1.3, 0)
      group.add(label)

      group.userData.station = ext
      group.userData.labelEl = el
      this.scene.add(group)
      this.stationGroups[ext.id] = group
    }
  }

  buildTrains() {
    this.trains = []
    const geo = new THREE.SphereGeometry(0.42, 18, 18)
    for (const trackId of Object.keys(LINES)) {
      const color = new THREE.Color(TRACKS[trackId].color).multiplyScalar(1.6)
      for (let k = 0; k < 2; k++) {
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true, toneMapped: false })
        const mesh = new THREE.Mesh(geo, mat)
        this.scene.add(mesh)
        this.trains.push({ mesh, trackId, offset: k * 0.5, speed: 0.018 + Math.random() * 0.006 })
      }
    }
  }

  initPostprocessing() {
    const { clientWidth: w, clientHeight: h } = this.container
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 0.38, 0.45, 0.72)
    this.composer.addPass(this.bloomPass)
    this.composer.addPass(new OutputPass())
  }

  // ── Interaction ───────────────────────────────────────────────────────

  bindEvents() {
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.pointerDownAt = null

    this.onResize = () => {
      const { clientWidth: w, clientHeight: h } = this.container
      this.camera.aspect = w / h
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(w, h)
      this.labelRenderer.setSize(w, h)
      this.composer.setSize(w, h)
    }
    window.addEventListener('resize', this.onResize)

    this.onPointerMove = (e) => {
      const rect = this.container.getBoundingClientRect()
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    this.onPointerDown = (e) => {
      this.pointerDownAt = { x: e.clientX, y: e.clientY }
    }
    this.onPointerUp = (e) => {
      if (!this.pointerDownAt) return
      const dx = e.clientX - this.pointerDownAt.x
      const dy = e.clientY - this.pointerDownAt.y
      this.pointerDownAt = null
      if (dx * dx + dy * dy > 25) return // it was a drag, not a click
      if (this.hoveredId) {
        this.selectStation(this.hoveredId)
        this.onSelect?.(this.hoveredId)
      } else {
        this.selectStation(null)
        this.onSelect?.(null)
      }
    }
    const dom = this.renderer.domElement
    dom.addEventListener('pointermove', this.onPointerMove)
    dom.addEventListener('pointerdown', this.onPointerDown)
    dom.addEventListener('pointerup', this.onPointerUp)
  }

  updateHover() {
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(this.hitboxes, false)
    const id = hits.length ? hits[0].object.userData.stationId : null
    if (id === this.hoveredId) return

    if (this.hoveredId) {
      const g = this.stationGroups[this.hoveredId]
      g.userData.labelEl.classList.remove('hovered')
    }
    this.hoveredId = id
    if (id) {
      this.stationGroups[id].userData.labelEl.classList.add('hovered')
    }
    this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
    this.onHover?.(id)
  }

  // ── Public API ────────────────────────────────────────────────────────

  selectStation(id) {
    this.selectedId = id
    for (const [sid, g] of Object.entries(this.stationGroups)) {
      g.userData.labelEl.classList.toggle('selected', sid === id)
    }
    if (id) {
      const st = NODE_BY_ID[id]
      this.selectionRing.visible = true
      this.selectionRing.position.set(st.pos[0], st.pos[1] + 0.14, st.pos[2])
      this.selectionRingBaseScale = st.external ? 0.75 : st.level >= 8 ? 1.35 : 1
      this.selectionRing.material.color.setHex(st.external ? EXTERNAL_COLOR : 0xffffff)
      this.applyFocus(null)
      this.highlightTracks(new Set(st.external ? [st.track] : st.tracks))
      this.flyTo(st)
    } else {
      this.selectionRing.visible = false
      this.applyFocus(this.focusedTrack)
    }
  }

  focusTrack(trackId) {
    this.focusedTrack = trackId
    this.selectedId = null
    this.selectionRing.visible = false
    for (const g of Object.values(this.stationGroups)) {
      g.userData.labelEl.classList.remove('selected')
    }
    this.applyFocus(trackId)
  }

  /** Dim everything that is not part of the given track (null = show all). */
  applyFocus(trackId) {
    const active = trackId ? new Set([trackId]) : new Set(Object.keys(LINES))
    this.highlightTracks(active)
  }

  highlightTracks(activeTracks) {
    for (const [tid, mesh] of Object.entries(this.lineMeshes)) {
      const on = activeTracks.has(tid)
      mesh.material.opacity = on ? 1 : 0.07
      mesh.material.emissiveIntensity = on ? 0.5 : 0.05
    }
    for (const mesh of this.externalLineMeshes) {
      const on = activeTracks.has(mesh.userData.track)
      mesh.material.opacity = on ? 0.55 : 0.05
      mesh.material.emissiveIntensity = on ? 0.12 : 0.02
    }
    for (const train of this.trains) {
      train.mesh.material.opacity = activeTracks.has(train.trackId) ? 1 : 0.05
    }
    for (const g of Object.values(this.stationGroups)) {
      const st = g.userData.station
      const on = st.external
        ? activeTracks.has(st.track)
        : st.tracks.some((t) => activeTracks.has(t))
      g.traverse((o) => {
        if (o.isMesh && o.material && o.material.visible !== false && !o.userData.stationId) {
          o.material.opacity = on ? 1 : 0.1
        }
      })
      g.userData.labelEl.classList.toggle('dim', !on)
    }
  }

  flyTo(st) {
    const stationPos = new THREE.Vector3(st.pos[0], st.pos[1], st.pos[2])
    const dir = this.camera.position.clone().sub(this.controls.target).normalize()
    // Shift the orbit target toward screen-right so the station sits left
    // of center, clear of the detail panel.
    const lookDir = dir.clone().negate()
    const screenRight = new THREE.Vector3().crossVectors(lookDir, this.camera.up).normalize()
    const target = stationPos.clone().add(screenRight.multiplyScalar(5))
    const pos = target.clone().add(dir.multiplyScalar(26)).add(new THREE.Vector3(0, 5, 0))
    this.animateCamera(pos, target)
  }

  /** Camera position that frames the whole map for the current aspect ratio. */
  defaultCameraPos() {
    const aspect = this.camera ? this.camera.aspect : this.container.clientWidth / this.container.clientHeight
    const halfV = THREE.MathUtils.degToRad(50 / 2)
    const halfH = Math.atan(Math.tan(halfV) * aspect)
    const dist = MAP_RADIUS / Math.sin(Math.min(halfV, halfH))
    return DEFAULT_TARGET.clone().add(DEFAULT_CAM_DIR.clone().multiplyScalar(dist))
  }

  resetView() {
    this.focusedTrack = null
    this.selectStation(null)
    this.applyFocus(null)
    this.animateCamera(this.defaultCameraPos(), DEFAULT_TARGET.clone())
  }

  animateCamera(toPos, toTarget, duration = 1.1) {
    this.cameraAnim = {
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos,
      toTarget,
      t: 0,
      duration,
    }
  }

  // ── Render loop ───────────────────────────────────────────────────────

  tick() {
    if (this.disposed) return
    const dt = this.clock.getDelta()
    const t = this.clock.elapsedTime

    if (this.cameraAnim) {
      const a = this.cameraAnim
      a.t += dt / a.duration
      const k = easeInOutCubic(Math.min(a.t, 1))
      this.camera.position.lerpVectors(a.fromPos, a.toPos, k)
      this.controls.target.lerpVectors(a.fromTarget, a.toTarget, k)
      if (a.t >= 1) this.cameraAnim = null
    }

    // Trains glide along their lines
    for (const train of this.trains) {
      const u = (t * train.speed + train.offset) % 1
      const p = this.lineCurves[train.trackId].getPointAt(u)
      train.mesh.position.copy(p)
      const pulse = 0.85 + 0.15 * Math.sin(t * 6 + train.offset * 10)
      train.mesh.scale.setScalar(pulse)
    }

    // Selection ring pulse
    if (this.selectionRing.visible) {
      const s = this.selectionRingBaseScale * (1 + 0.12 * Math.sin(t * 4))
      this.selectionRing.scale.setScalar(s)
      this.selectionRing.material.opacity = 0.65 + 0.3 * Math.sin(t * 4)
    }

    // Hover scale easing
    for (const [id, g] of Object.entries(this.stationGroups)) {
      const targetScale = id === this.hoveredId || id === this.selectedId ? 1.3 : 1
      g.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.18)
    }

    this.stars.rotation.y += dt * 0.004

    // Declutter: when zoomed far out, only interchange labels stay visible
    const camDist = this.camera.position.distanceTo(this.controls.target)
    this.labelRenderer.domElement.classList.toggle('labels-far', camDist > 70)

    this.updateHover()
    this.controls.update()
    this.composer.render()
    this.labelRenderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    this.renderer.setAnimationLoop(null)
    window.removeEventListener('resize', this.onResize)
    const dom = this.renderer.domElement
    dom.removeEventListener('pointermove', this.onPointerMove)
    dom.removeEventListener('pointerdown', this.onPointerDown)
    dom.removeEventListener('pointerup', this.onPointerUp)
    this.scene.traverse((o) => {
      o.geometry?.dispose?.()
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose())
    })
    this.composer.dispose()
    this.renderer.dispose()
    this.container.innerHTML = ''
  }
}
