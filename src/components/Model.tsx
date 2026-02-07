import { useMemo } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import type { RenderMode } from '../types'

// Shader for normals visualization
const normalsVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const normalsFragmentShader = `
  varying vec3 vNormal;
  void main() {
    gl_FragColor = vec4(normalize(vNormal) * 0.5 + 0.5, 1.0);
  }
`

// Shader for UV checker
const uvVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const uvFragmentShader = `
  varying vec2 vUv;
  void main() {
    float check = mod(floor(vUv.x * 8.0) + floor(vUv.y * 8.0), 2.0);
    gl_FragColor = vec4(vec3(check), 1.0);
  }
`

interface ModelProps {
  model: Group
  renderMode: RenderMode
}

export default function Model({ model, renderMode }: ModelProps) {
  const clone = useMemo(() => {
    const m = model.clone()
    m.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry && child.material) {
        const mesh = child as THREE.Mesh
        const geo = mesh.geometry

        if (renderMode === 'wireframe') {
          mesh.material = new THREE.MeshBasicMaterial({
            color: 0x4488ff,
            wireframe: true,
          })
        } else if (renderMode === 'normals' && geo.hasAttribute('normal')) {
          mesh.material = new THREE.ShaderMaterial({
            vertexShader: normalsVertexShader,
            fragmentShader: normalsFragmentShader,
          })
        } else if (renderMode === 'uv-checker' && geo.hasAttribute('uv')) {
          mesh.material = new THREE.ShaderMaterial({
            vertexShader: uvVertexShader,
            fragmentShader: uvFragmentShader,
          })
        } else if (renderMode === 'unlit') {
          mesh.material = new THREE.MeshBasicMaterial({
            color: 0xcccccc,
            vertexColors: false,
          })
        }
        // default or missing attributes: keep original materials
      }
    })
    return m
  }, [model, renderMode])

  return <primitive object={clone} />
}
