import { useRef, useEffect, Suspense } from 'react'
import { OrbitControls, Grid } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useViewer } from '../context/ViewerContext'
import Model from './Model'

function SceneContent() {
  const { model, renderMode, lighting, showGrid, showAxes, cameraPreset, fitCameraTrigger } = useViewer()
  const controlsRef = useRef<any>(null)
  const mainLightRef = useRef<THREE.DirectionalLight>(null)
  const { camera } = useThree()

  // Optional: visualize light direction
  // useHelper(mainLightRef as any, THREE.DirectionalLightHelper, 1)

  // Camera presets
  useEffect(() => {
    if (!cameraPreset) return

    const center = new THREE.Vector3(0, 0, 0)
    let distance = 5
    if (model) {
      const box = new THREE.Box3().setFromObject(model)
      const size = new THREE.Vector3()
      box.getCenter(center)
      box.getSize(size)
      distance = Math.max(size.x, size.y, size.z, 1) * 2
    }

    switch (cameraPreset) {
      case 'front':
        camera.position.set(center.x + distance, center.y, center.z)
        camera.lookAt(center)
        break
      case 'side':
        camera.position.set(center.x + distance, center.y, center.z)
        camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2)
        camera.lookAt(center)
        break
      case 'top':
        camera.position.set(center.x, center.y + distance, center.z)
        camera.lookAt(center)
        break
      case 'three-quarter':
        camera.position.set(center.x + distance * 0.7, center.y + distance * 0.7, center.z + distance * 0.7)
        camera.lookAt(center)
        break
    }
    camera.updateProjectionMatrix()
    if (controlsRef.current?.target) {
      controlsRef.current.target.set(center.x, center.y, center.z)
    }
  }, [cameraPreset, camera])

  // Fit camera when model loads
  useEffect(() => {
    if (!model || fitCameraTrigger === 0) return
    const box = new THREE.Box3().setFromObject(model)
    const center = new THREE.Vector3()
    const size = new THREE.Vector3()
    box.getCenter(center)
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z, 1)
    const distance = maxDim * 2.5
    camera.position.set(center.x + distance * 0.7, center.y + distance * 0.7, center.z + distance * 0.7)
    camera.lookAt(center)
    camera.updateProjectionMatrix()
    if (controlsRef.current?.target) {
      controlsRef.current.target.set(center.x, center.y, center.z)
    }
  }, [model, fitCameraTrigger, camera])

  const mainColor = new THREE.Color(lighting.mainColor)
  const ambientColor = new THREE.Color(lighting.ambientColor)

  return (
    <>
      <ambientLight intensity={lighting.ambientIntensity} color={ambientColor} />
      <directionalLight
        ref={mainLightRef}
        position={[5, 8, 5]}
        intensity={lighting.mainIntensity}
        color={mainColor}
      />

      {showGrid && (
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#6b7280"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#4b5563"
          fadeDistance={25}
          fadeStrength={1}
          position={[0, 0, 0]}
        />
      )}

      {showAxes && <axesHelper args={[2]} />}

      {model && (
        <group>
          <Model model={model} renderMode={renderMode} />
        </group>
      )}

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={500}
        mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      />
    </>
  )
}

export default function Viewport() {
  return (
    <Suspense fallback={null}>
      <SceneContent />
    </Suspense>
  )
}
