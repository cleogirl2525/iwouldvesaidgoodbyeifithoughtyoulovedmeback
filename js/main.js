/* global dat, BR */
const DATA = {
  debug: true, // display debug GUI controls
  maxBlue: 255, // FF=255 (E6=230, CC=204)
  testDay: 0, // for debugging date
  scrollTextURL: 'texts/page2.txt',
  flashTextURL: 'texts/page2-first.txt',
  scrollText: null, // text to scroll (loaded below)
  flashText: null, // text to flash on first of the month (loaded below)
  animationStyle: 'flash', // 'flash' or 'scroll'
  scrollSpeed: 0.75,
  refreshTime: { // when should the browser refresh/reset
    hour: 0, // midnight
    minute: 0 // midnight
  }
}

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
  const CSS = {
    '--font-size': getCSSVar('--font-size'),
    '--letter-spacing': getCSSVar('--letter-spacing'),
    '--line-height': getCSSVar('--line-height'),
    '--padding': getCSSVar('--padding')
  }
  for (const prop in CSS) {
    st.add(CSS, prop, 0, 16, 0.1).onChange(v => setCSSVar(prop, v, 'vw'))
  }
  gui.add(BR.factory, 'createBubble')
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

// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*
// •.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*•.¸¸¸.•*

async function setup () {
  if (DATA.debug) setupGUI()
  // fetch text data (the poem)
  const res1 = await window.fetch(DATA.scrollTextURL)
  DATA.scrollText = await res1.text()
  const res2 = await window.fetch(DATA.flashTextURL)
  DATA.flashTextText = await res2.text()
  DATA.flashTextText = DATA.flashTextText.split('\n').filter(t => t !== '')
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
  // start animation loop
  loop()
}

function loop () {
  window.requestAnimationFrame(loop)
  checkRefresh()

  scrollText()

  const test = DATA.testDay ? DATA.testDay : null
  const blue = calculateBlueFromDay(test)
  document.body.style.backgroundColor = `rgb(0, 0, ${blue})`
}

setup()
