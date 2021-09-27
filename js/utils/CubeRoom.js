/* global THREE, CANNON */
class CubeRoom {
  constructor (cyberspace) {
    const scene = cyberspace.scene
    const world = cyberspace.world
    const a = cyberspace.area
    const debug = cyberspace.settings.controls

    const geometry = new THREE.PlaneBufferGeometry(a, a)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x4c4c4b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: debug ? 1 : 0.25
    })
    const wallMat = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: debug ? 1 : 0
    })

    const floor = new THREE.Mesh(geometry, floorMat)
    floor.receiveShadow = true
    scene.add(floor)

    const backWall = new THREE.Mesh(geometry, wallMat)
    scene.add(backWall)

    const frontWall = new THREE.Mesh(geometry, wallMat)
    scene.add(frontWall)

    const leftWall = new THREE.Mesh(geometry, wallMat)
    scene.add(leftWall)

    const rightWall = new THREE.Mesh(geometry, wallMat)
    scene.add(rightWall)

    // physics
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(new CANNON.Plane())
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0), // axis vector
      Math.PI / 2 // rotation angle
    )
    world.addBody(floorBody)

    const backWallBody = new CANNON.Body()
    backWallBody.addShape(new CANNON.Plane())
    backWallBody.mass = 0
    backWallBody.position = new CANNON.Vec3(0, a / 2, a / 2)
    backWallBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(0, -1, 0), // axis vector
      Math.PI // rotation angle
    )
    world.addBody(backWallBody)

    const frontWallBody = new CANNON.Body()
    frontWallBody.mass = 0
    frontWallBody.position = new CANNON.Vec3(0, a / 2, -a / 2)
    frontWallBody.addShape(new CANNON.Plane())
    world.addBody(frontWallBody)

    const leftWallBody = new CANNON.Body()
    leftWallBody.mass = 0
    leftWallBody.position = new CANNON.Vec3(a / 2, a / 2, 0)
    leftWallBody.addShape(new CANNON.Plane())
    leftWallBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(0, -1, 0), // axis vector
      Math.PI / 2 // rotation angle
    )
    world.addBody(leftWallBody)

    const rightWallBody = new CANNON.Body()
    rightWallBody.mass = 0
    rightWallBody.position = new CANNON.Vec3(-a / 2, a / 2, 0)
    rightWallBody.addShape(new CANNON.Plane())
    rightWallBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(0, -1, 0), // axis vector
      -Math.PI / 2 // rotation angle
    )
    world.addBody(rightWallBody)

    // position meshes to match physics bodies
    floor.quaternion.copy(floorBody.quaternion)
    backWall.quaternion.copy(backWallBody.quaternion)
    backWall.position.copy(backWallBody.position)
    frontWall.quaternion.copy(frontWallBody.quaternion)
    frontWall.position.copy(frontWallBody.position)
    leftWall.quaternion.copy(leftWallBody.quaternion)
    leftWall.position.copy(leftWallBody.position)
    rightWall.quaternion.copy(rightWallBody.quaternion)
    rightWall.position.copy(rightWallBody.position)
  }
}

window.CubeRoom = CubeRoom
