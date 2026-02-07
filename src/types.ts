export type RenderMode = 'default' | 'wireframe' | 'normals' | 'uv-checker' | 'unlit'

export interface ModelStats {
  vertexCount: number
  triangleCount: number
  meshCount: number
  materialCount: number
  width: number
  height: number
  depth: number
}

export interface PerformanceMetrics {
  score: number
  fileSize: string
  textureMemory: string
  triangleCount: number
  tips: string[]
}

export interface LightingState {
  mainIntensity: number
  mainColor: string
  ambientIntensity: number
  ambientColor: string
}
