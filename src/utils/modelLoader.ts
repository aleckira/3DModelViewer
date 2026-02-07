import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import type { ModelStats } from '../types'

const gltfLoader = new GLTFLoader()
const objLoader = new OBJLoader()
const fbxLoader = new FBXLoader()

function getModelBounds(group: THREE.Group): { size: THREE.Vector3; center: THREE.Vector3 } {
  const box = new THREE.Box3().setFromObject(group)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  return { size, center }
}

function countGeometry(model: THREE.Object3D): { vertices: number; triangles: number; meshes: number } {
  let vertices = 0
  let triangles = 0
  let meshes = 0

  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      meshes++
      const geo = child.geometry
      if (geo.attributes.position) {
        vertices += geo.attributes.position.count
      }
      if (geo.index) {
        triangles += geo.index.count / 3
      } else if (geo.attributes.position) {
        triangles += geo.attributes.position.count / 3
      }
    }
  })

  return { vertices, triangles, meshes }
}

function countMaterials(model: THREE.Object3D): number {
  const materials = new Set<THREE.Material>()
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((m) => materials.add(m))
    }
  })
  return materials.size
}

function estimateTextureMemory(model: THREE.Object3D): number {
  let bytes = 0
  model.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      mats.forEach((mat) => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          if (mat.map) bytes += mat.map.image ? mat.map.image.width * mat.map.image.height * 4 : 0
          if (mat.normalMap)
            bytes += mat.normalMap.image
              ? mat.normalMap.image.width * mat.normalMap.image.height * 4
              : 0
        }
      })
    }
  })
  return bytes
}

export function computeModelStats(model: THREE.Group): ModelStats {
  const { vertices, triangles, meshes } = countGeometry(model)
  const materialCount = countMaterials(model)
  const { size } = getModelBounds(model)

  return {
    vertexCount: vertices,
    triangleCount: Math.round(triangles),
    meshCount: meshes,
    materialCount,
    width: size.x,
    height: size.y,
    depth: size.z,
  }
}

export function computePerformanceMetrics(
  model: THREE.Object3D,
  stats: ModelStats,
  fileSizeBytes: number
): { score: number; fileSize: string; textureMemory: string; triangleCount: number; tips: string[] } {
  const fileSizeMB = fileSizeBytes / (1024 * 1024)
  const fileSizeStr = fileSizeMB >= 1 ? `${fileSizeMB.toFixed(2)} MB` : `${(fileSizeBytes / 1024).toFixed(1)} KB`
  const textureMem = Math.round(estimateTextureMemory(model) / 1024)
  const textureMemStr = textureMem >= 1024 ? `${(textureMem / 1024).toFixed(1)} MB` : `${textureMem} KB`

  const tips: string[] = []
  let score = 100

  if (stats.triangleCount > 100000) {
    score -= 25
    tips.push('Consider reducing triangle count for better performance')
  } else if (stats.triangleCount > 50000) {
    score -= 10
  }

  if (fileSizeBytes > 5 * 1024 * 1024) {
    score -= 20
    tips.push('Reduce file size by compressing textures or using Draco compression')
  } else if (fileSizeBytes > 2 * 1024 * 1024) {
    score -= 10
  }

  if (tips.length === 0 && score >= 80) {
    tips.push('Model is well optimized for web viewing')
  } else if (tips.length === 0) {
    tips.push('Reduce texture resolution to improve performance')
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    fileSize: fileSizeStr,
    textureMemory: textureMemStr,
    triangleCount: stats.triangleCount,
    tips,
  }
}

export function loadModel(
  file: File,
  onProgress: (progress: number) => void
): Promise<{ model: THREE.Group; stats: ModelStats }> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    const url = URL.createObjectURL(file)

    const cleanup = () => URL.revokeObjectURL(url)

    const handleProgress = (xhr: ProgressEvent) => {
      if (xhr.lengthComputable) {
        onProgress((xhr.loaded / xhr.total) * 100)
      } else {
        onProgress(50)
      }
    }

    const finalize = (group: THREE.Group) => {
      onProgress(100)
      const stats = computeModelStats(group)
      cleanup()
      resolve({ model: group, stats })
    }

    if (ext === 'glb' || ext === 'gltf') {
      gltfLoader.load(
        url,
        (gltf) => {
          const group = gltf.scene
          group.name = 'Model'
          finalize(group)
        },
        handleProgress,
        () => {
          cleanup()
          reject(new Error('Failed to load GLTF/GLB'))
        }
      )
    } else if (ext === 'obj') {
      objLoader.load(
        url,
        (obj) => {
          obj.name = 'Model'
          finalize(obj)
        },
        handleProgress,
        () => {
          cleanup()
          reject(new Error('Failed to load OBJ'))
        }
      )
    } else if (ext === 'fbx') {
      fbxLoader.load(
        url,
        (fbx) => {
          fbx.name = 'Model'
          finalize(fbx)
        },
        handleProgress,
        () => {
          cleanup()
          reject(new Error('Failed to load FBX'))
        }
      )
    } else {
      cleanup()
      reject(new Error(`Unsupported format: .${ext}`))
    }
  })
}
