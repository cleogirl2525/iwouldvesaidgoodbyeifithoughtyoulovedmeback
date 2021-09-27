/* global THREE, CANNON, CyberSpace, BubbleFactory, CubeRoom */
class BubbleRoom extends CyberSpace {
  constructor (opts) {
    super(opts)
    this.color = 0x4c4c4b
    this.area = 20
    this.setupPhysicsWorld()
    this.lightScene()
    this.room = new CubeRoom(this)
    this.factory = new BubbleFactory(this)
  }

  lightScene () {
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap // ?

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
    hemiLight.position.set(0, 20, 0)
    // hemiLight.castShadow = true
    this.scene.add(hemiLight)

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    // this.dirLight.position.set(-3, 3, 4)
    this.dirLight.position.set(0, 8, 4)
    this.dirLight.castShadow = true
    const shadowSize = this.area / 2
    this.dirLight.shadow.camera.right = shadowSize
    this.dirLight.shadow.camera.left = -shadowSize
    this.dirLight.shadow.camera.top = shadowSize
    this.dirLight.shadow.camera.bottom = -shadowSize
    this.scene.add(this.dirLight)

    // const helper = new THREE.DirectionalLightHelper(this.dirLight, 5)
    // const shadowHelper = new THREE.CameraHelper(this.dirLight.shadow.camera)
    // this.scene.add(helper)
    // this.scene.add(shadowHelper)
  }

  setupPhysicsWorld () {
    this.world = new CANNON.World()
    this.world.broadphase = new CANNON.SAPBroadphase(this.world)
    this.world.allowSleep = true
    this.world.gravity.set(0, -9.82, 0)
    this.oldElapsedTime = 0
    this.defaultMat = new CANNON.Material('default')
    const defaultContact = new CANNON.ContactMaterial(
      this.defaultMat,
      this.defaultMat,
      { friction: 0.1, restitution: 0.7 }
    )
    this.world.addContactMaterial(defaultContact)
    this.world.defaultContactMaterial = defaultContact
  }

  updatePhysicsWorld () {
    if (!this.world) return
    const elapsedTime = this.clock.getElapsedTime()
    const deltaTime = elapsedTime - this.oldElapsedTime
    this.oldElapsedTime = elapsedTime
    this.world.step(1 / 60, deltaTime, 3)
  }

  update () {
    this.updatePhysicsWorld()
    if (this.factory) this.factory.update()
  }
}

// -----------------------------------------------------------------

const BR = new BubbleRoom({
  controls: false,
  log: false
})

// BR.logCamPos()
BR.camera.position.x = -0.848
BR.camera.position.y = 1.695
BR.camera.position.z = -11.653
BR.camera.rotation.x = -3.08
BR.camera.rotation.y = -0.005
BR.camera.rotation.z = -3.141
