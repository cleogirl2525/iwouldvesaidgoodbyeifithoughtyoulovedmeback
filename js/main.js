/* global dat, BubbleRoom, sestina */
const DATA = {
  debug: true, // display debug GUI controls
  // BACKGRROUND COLOR ----------------------------------------
  maxBlue: 255, // FF=255 (E6=230, CC=204)
  testDay: 0, // for debugging date
  _TODAY: new Date().getDate(),
  // TEXT DETAILS ---------------------------------------------
  scrollTextURL: window.scrollTextURL,
  flashTextURL: window.flashTextURL,
  scrollText: null, // text to scroll (loaded below)
  flashText: null, // text to flash on first of the month (loaded below)
  animationStyle: 'flash', // 'flash' or 'scroll'
  scrollSpeed: 0.75,
  flashDelay: 3000,
  _FLASH_INDEX: 0,
  // ROOM DEETZ -----------------------------------------------
  roomDepth: 1.3,
  roomWidth: 2,
  floorColor: 0xfcfcfc,
  floorOpacity: 0,
  // PHYSICS --------------------------------------------------
  bounciness: 0.55,
  gravity: -4.8,
  // BUBBLE DEETZ ---------------------------------------------
  bubbleColor: 0x35e,
  // bubbleSize: 2.3,
  bubbleOpacity: 0.56,
  metalness: 0.3,
  roughness: 0.71,
  totalBubbles: 25, // amount of bubbles to reach by end of the month
  testAmount: 0,
  createBubble: () => {
    if (DATA.testAmount < 0) DATA.initBubble(1)
    else DATA.initBubble(DATA.testAmount)
  },
  initBubble: (amount) => {
    let count = 0
    const run = () => {
      const size = 1 + Math.random() * 1.3
      BR.factory.createBubble(size)
      count++
      if (count < amount) setTimeout(run, 100)
    }
    run(amount)
  },
  _TIMES: [],
  _COUNT: 0,
  _HOLD: false,
  // CAMERA ----------------------------------------------------
  cameraCoords: {
    position: { x: 0.03, y: 17.64, z: -2.36 },
    rotation: { x: -1.7, y: 0, z: 3.13 }
  },
  cameraSettings: () => {
    const px = Math.round(BR.camera.position.x * 100) / 100
    const py = Math.round(BR.camera.position.y * 100) / 100
    const pz = Math.round(BR.camera.position.z * 100) / 100
    const rx = Math.round(BR.camera.rotation.x * 100) / 100
    const ry = Math.round(BR.camera.rotation.y * 100) / 100
    const rz = Math.round(BR.camera.rotation.z * 100) / 100
    const settings = `${px}, ${py}, ${pz}, ${rx}, ${ry}, ${rz}`
    window.alert(settings)
  },
  // MISC LOGIX -----------------------------------------------
  refreshTime: { // when should the browser refresh/reset
    hour: 0, // midnight
    minute: 0 // midnight
  }
}

// create three.js 3D bubbles
// -----------------------------------------------------------------
const BR = new BubbleRoom({ controls: false, log: false })

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

const gui = new dat.GUI()
const setupGUI = () => {
  gui.domElement.parentElement.style.zIndex = 100
  const bg = gui.addFolder('background-color')
  bg.add(DATA, 'maxBlue', 0, 255)
  bg.add(DATA, 'testDay', 0, 31)

  const st = gui.addFolder('scroll-text')
  st.add(DATA, 'scrollSpeed', 0, 3, 0.1)
  st.add(DATA, 'flashDelay', 1000, 10000, 100)
  const CSS = {
    '--font-size': getCSSVar('--font-size'),
    '--letter-spacing': getCSSVar('--letter-spacing'),
    '--line-height': getCSSVar('--line-height'),
    '--padding': getCSSVar('--padding')
  }
  for (const prop in CSS) {
    st.add(CSS, prop, 0, 16, 0.1).onChange(v => setCSSVar(prop, v, 'vw'))
  }

  const rm = gui.addFolder('room')
  rm.add(DATA, 'roomDepth', 0, 2, 0.1)
    .onChange(v => BR.room.scale(DATA.roomWidth, 1, DATA.roomDepth))
  rm.add(DATA, 'roomWidth', 0, 2, 0.1)
    .onChange(v => BR.room.scale(DATA.roomWidth, 1, DATA.roomDepth))
  rm.add(DATA, 'floorOpacity', 0, 1, 0.01).name('floorOpacity')
    .onChange(v => { BR.room.floorMat.opacity = v })
  rm.addColor(DATA, 'floorColor')
    .onChange(v => BR.room.floorMat.color.set(v))

  const ph = gui.addFolder('physics')
  ph.add(DATA, 'bounciness', 0, 1.5, 0.01).name('bounciness')
    .onChange(v => { BR.defaultContact.restitution = v })
  ph.add(DATA, 'gravity', -20, -1, 0.1).name('gravity')
    .onChange(v => { BR.world.gravity.y = v })

  gui.add(DATA, 'createBubble')
  const bf = gui.addFolder('bubbles-settings')
  // bf.add(DATA, 'bubbleSize', 0, 3, 0.1)
  bf.add(DATA, 'bubbleOpacity', 0, 1, 0.01)
    .onChange(v => { BR.factory.mat.opacity = v })
  bf.add(DATA, 'metalness', 0, 1, 0.01)
    .onChange(v => { BR.factory.mat.metalness = v })
  bf.add(DATA, 'roughness', 0, 1, 0.01)
    .onChange(v => { BR.factory.mat.roughness = v })
  bf.addColor(DATA, 'bubbleColor')
    .onChange(v => BR.factory.mat.color.set(v))
  bf.add(DATA, 'testAmount', 0, DATA.totalBubbles, 1)

  // gui.add(DATA, 'cameraSettings')
  dat.GUI.toggleHide()
}

const getCSSVar = (prop, raw) => {
  const doc = document.documentElement
  const val = window.getComputedStyle(doc).getPropertyValue(prop)
  if (raw) return val
  else return parseFloat(val)
}

const setCSSVar = (prop, val, unit) => {
  const root = document.documentElement
  const nval = unit ? val + unit : val
  root.style.setProperty(prop, nval)
}

const totalDaysThisMonth = () => {
  const d = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const m = new Date().getMonth()
  return d[m]
}

const calculateBlueFromDay = (testDate) => {
  let blue // blue will be brightest in the middle of the month
  const today = typeof testDate === 'number' ? testDate : new Date().getDate()
  const total = totalDaysThisMonth()
  const half1 = Math.round(total / 2)
  const half2 = total - half1
  if (today <= half1) { // first half of the month
    const frac = today / half1
    blue = frac * DATA.maxBlue
  } else { // second half of the month
    const frac = (today - half1) / half2
    blue = (1 - frac) * DATA.maxBlue
  }
  return Math.round(blue)
}

const setupBubbles = () => {
  const days = totalDaysThisMonth()
  const perDay = Math.round(DATA.totalBubbles / days)
  const inc = 24 / perDay
  for (let i = inc; i < 24; i += inc) DATA._TIMES.push(i)
  //
  const today = new Date().getDate()
  const total = totalDaysThisMonth()
  const start = (today / total) * DATA.totalBubbles
  const h = new Date().getHours()
  const ts = DATA._TIMES.map(t => Math.floor(t))
  const v = ts.filter(t => t >= h)
  const i = ts.indexOf(v[0])
  DATA._COUNT = i
  DATA.initBubble(start + DATA._COUNT)
}

const checkForNewBubble = () => {
  if (DATA._HOLD) return
  const d = new Date()
  const h = d.getHours()
  const m = d.getMinutes()
  const next = DATA._TIMES[DATA._COUNT]
  const hour = Math.floor(next)
  const dec = next - hour
  const min = Math.round(dec * 60)
  if (h === hour && m === min) {
    DATA.initBubble(1)
    DATA._COUNT++
    DATA._HOLD = true
    setTimeout(() => {
      DATA._HOLD = false
    }, 1200)
    // RUN SESTINA ALGORITHM ON TEXT
    if (new Date().getDate() !== 1) {
      const ele = document.querySelector('.text')
      ele.textContent = sestina(ele.textContent)
    }
  }
}

const logTimes = () => {
  const times = []
  DATA._TIMES.forEach(time => {
    const hour = Math.floor(time)
    const dec = time - hour
    const min = Math.round(dec * 60)
    const z = (String(min).length === 1) ? '0' : ''
    times.push(`${hour}:${min}${z}`)
  })
  return times
}

const checkRefresh = () => {
  const d = new Date()
  const h = d.getHours()
  const m = d.getMinutes()
  const s = d.getSeconds()
  const r = (h === DATA.refreshTime.hour &&
      m === DATA.refreshTime.minute && s === 0)
  if (r) window.location.reload()
}

const scrollText = () => {
  const ele = document.querySelector('.text')
  const tfs = getCSSVar('--font-size')
  const max = ele.scrollHeight + (window.innerWidth * (tfs / 100))
  let cur = parseFloat(ele.style.top)
  cur -= DATA.scrollSpeed
  if (cur < -max) {
    ele.style.top = window.innerHeight + 'px'
  } else {
    ele.style.top = cur + 'px'
  }
}

const flashText = () => {
  DATA._FLASH_INDEX++
  if (DATA._FLASH_INDEX >= DATA.flashText.length) {
    DATA._FLASH_INDEX = 0
  }
  const next = DATA.flashText[DATA._FLASH_INDEX]
  const ele = document.querySelector('.text')
  ele.style.top = '0px'
  ele.style.width = '100vw'
  ele.style.display = 'flex'
  ele.textContent = next
  setTimeout(flashText, DATA.flashDelay)
}

const setupCameraData = () => {
  for (const prop in DATA.cameraCoords) {
    for (const axis in DATA.cameraCoords[prop]) {
      BR.camera[prop][axis] = DATA.cameraCoords[prop][axis]
    }
  }
}

const setupRoomData = () => {
  // setup room deetz
  BR.room.scale(DATA.roomWidth, 1, DATA.roomDepth)
  BR.room.scale(DATA.roomWidth, 1, DATA.roomDepth)
  BR.room.floorMat.opacity = DATA.floorOpacity
  BR.room.floorMat.color.set(DATA.floorColor)
  // setup physics deetz
  BR.defaultContact.restitution = DATA.bounciness
  BR.world.gravity.y = DATA.gravity
  // setup bubble deetz
  BR.factory.mat.opacity = DATA.bubbleOpacity
  BR.factory.mat.metalness = DATA.metalness
  BR.factory.mat.roughness = DATA.roughness
  BR.factory.mat.color.set(DATA.bubbleColor)
}

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

async function setup () {
  if (DATA.debug) setupGUI()
  // fetch text data (the poem)
  const res1 = await window.fetch(DATA.scrollTextURL)
  DATA.scrollText = await res1.text()
  const res2 = await window.fetch(DATA.flashTextURL)
  DATA.flashText = await res2.text()
  DATA.flashText = DATA.flashText.split('\n').filter(t => t !== '')
  // create section element (container for scrolling text)
  const sec = document.createElement('section')
  sec.style.top = window.innerHeight + 'px'
  sec.className = 'text'
  document.body.appendChild(sec)
  // set appropriate text && animation style
  if (new Date().getDate() === 1) {
    DATA.animationStyle = 'flash'
    sec.textContent = DATA.flashText
  } else {
    DATA.animationStyle = 'scroll'
    sec.textContent = DATA.scrollText
  }

  // match camera/room settings to DATA settings
  setupCameraData()
  setupRoomData()

  // brief delay to wait for img list
  setTimeout(setupBubbles, 1000)

  if (DATA._TODAY === 1) flashText()

  // start animation loop
  loop()
}

function loop () {
  window.requestAnimationFrame(loop)

  checkRefresh()

  checkForNewBubble()

  if (DATA._TODAY > 1) scrollText()

  const test = DATA.testDay ? DATA.testDay : null
  const blue = calculateBlueFromDay(test)
  document.body.style.backgroundColor = `rgb(0, 0, ${blue})`
}

setup()
