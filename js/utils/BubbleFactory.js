/* global THREE, CANNON */
class BubbleFactory {
  constructor (cyberspace, imgPath) {
    this.cyberspace = cyberspace
    this.sph = new THREE.SphereGeometry(1, 20, 20)
    this.mat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.5
    })
    this.objs = {}

    this.imgList = []
    this.path = imgPath
    window.fetch(imgPath + 'bubble-list.txt')
      .then(res => res.text())
      .then(txt => { this.imgList = txt.split('\n') })
  }

  ranXYZ () {
    return {
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random() * 2 - 1
    }
  }

  createSprite (size) {
    const gif = this.imgList[Math.floor(Math.random() * this.imgList.length)]
    const map = new THREE.TextureLoader().load(this.path + gif)
    const material = new THREE.SpriteMaterial({ map: map })
    const sprite = new THREE.Sprite(material)
    sprite.scale.set(size, size, size)
    return sprite
  }

  createBubble (size, mass) {
    size = typeof size === 'number' ? size : 1
    mass = typeof mass === 'number' ? mass : 1
    const position = this.ranXYZ()
    position.y = this.cyberspace.area / 2
    // THREE.js mesh
    const mesh = new THREE.Mesh(this.sph, this.mat)
    mesh.scale.set(size, size, size)
    mesh.castShadow = true
    mesh.receiveShadow = true
    mesh.position.copy(position)
    this.cyberspace.scene.add(mesh)
    //
    const sprite = this.createSprite(size)
    this.cyberspace.scene.add(sprite)
    // CANNON.js body
    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(size)
    })
    body.position.copy(position)
    this.cyberspace.world.addBody(body)
    //
    this.addObj(mesh, body, sprite)
  }

  addObj (mesh, body, sprite) {
    const id = Date.now()
    const obj = { mesh, body, sprite }
    this.objs[id] = obj
    return id
  }

  deleteObj (id) {
    const obj = this.objs[id]
    this.cyberspace.scene.remove(obj.mesh)
    this.cyberspace.scene.remove(obj.sprite)
    this.cyberspace.world.removeBody(obj.body)
    delete this.objs[id]
  }

  update () {
    for (const id in this.objs) {
      const m = this.objs[id].mesh
      const s = this.objs[id].sprite
      const b = this.objs[id].body
      m.position.copy(b.position)
      s.position.copy(b.position)
      s.position.y -= 0.25
    }
  }
}

window.BubbleFactory = BubbleFactory
