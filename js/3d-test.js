/* global dat, BubbleRoom */
const DATA = {
  bgColor: 100,
  floorColor: 0x4c4c4b,
  roomDepth: 1,
  roomWidth: 1,
  bubbleColor: 0xcccccc,
  bubbleSize: 1,
  createBubble: () => BR.factory.createBubble(DATA.bubbleSize),
  cameraSettings: () => {
    const px = Math.round(BR.camera.position.x * 100) / 100
    const py = Math.round(BR.camera.position.y * 100) / 100
    const pz = Math.round(BR.camera.position.z * 100) / 100
    const rx = Math.round(BR.camera.rotation.x * 100) / 100
    const ry = Math.round(BR.camera.rotation.y * 100) / 100
    const rz = Math.round(BR.camera.rotation.z * 100) / 100
    const settings = `${px}, ${py}, ${pz}, ${rx}, ${ry}, ${rz}`
    window.alert(settings)
  }
}

document.body.style.backgroundColor = `rgb(0, 0, ${DATA.bgColor})`

const BR = new BubbleRoom({
  controls: true,
  log: false
})

// BR.logCamPos()
BR.camera.position.x = -0.848
BR.camera.position.y = 1.695
BR.camera.position.z = -11.653
BR.camera.rotation.x = -3.08
BR.camera.rotation.y = -0.005
BR.camera.rotation.z = -3.141

const gui = new dat.GUI()
const setupGUI = () => {
  gui.domElement.parentElement.style.zIndex = 100

  gui.add(DATA, 'bgColor', 0, 255)
    .onChange(v => {
      document.body.style.backgroundColor = `rgb(0, 0, ${DATA.bgColor})`
    })

  const rm = gui.addFolder('room')
  rm.add(DATA, 'roomDepth', 0, 2, 0.1)
    .onChange(v => BR.room.scale(DATA.roomWidth, 1, DATA.roomDepth))
  rm.add(DATA, 'roomWidth', 0, 2, 0.1)
    .onChange(v => BR.room.scale(DATA.roomWidth, 1, DATA.roomDepth))
  rm.add(BR.room.floorMat, 'opacity', 0, 1, 0.01).name('floorOpacity')
  rm.addColor(DATA, 'floorColor')
    .onChange(v => BR.room.floorMat.color.set(v))

  const ph = gui.addFolder('physics')
  ph.add(BR.defaultContact, 'restitution', 0, 1.5, 0.01).name('bounciness')
  ph.add(BR.world.gravity, 'y', -20, -1, 0.1).name('gravity')

  gui.add(DATA, 'createBubble')
  const bf = gui.addFolder('bubbles-settings')
  bf.add(DATA, 'bubbleSize', 0, 3, 0.1)
  bf.add(BR.factory.mat, 'opacity', 0, 1, 0.01)
  bf.add(BR.factory.mat, 'metalness', 0, 1, 0.01)
  bf.add(BR.factory.mat, 'roughness', 0, 1, 0.01)
  bf.addColor(DATA, 'bubbleColor')
    .onChange(v => BR.factory.mat.color.set(v))

  gui.add(DATA, 'cameraSettings')
}

setupGUI()
