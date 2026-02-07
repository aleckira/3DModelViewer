import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Group } from 'three'
import type { RenderMode, ModelStats, PerformanceMetrics, LightingState } from '../types'

interface ViewerContextType {
  model: Group | null
  setModel: (model: Group | null) => void
  modelStats: ModelStats | null
  setModelStats: (stats: ModelStats | null) => void
  performanceMetrics: PerformanceMetrics | null
  setPerformanceMetrics: (metrics: PerformanceMetrics | null) => void
  renderMode: RenderMode
  setRenderMode: (mode: RenderMode) => void
  lighting: LightingState
  setLighting: (lighting: LightingState | ((prev: LightingState) => LightingState)) => void
  loadingProgress: number
  setLoadingProgress: (progress: number) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  showGrid: boolean
  setShowGrid: (show: boolean) => void
  showAxes: boolean
  setShowAxes: (show: boolean) => void
  cameraPreset: 'front' | 'side' | 'top' | 'three-quarter' | null
  setCameraPreset: (preset: 'front' | 'side' | 'top' | 'three-quarter' | null) => void
  fitCameraTrigger: number
  triggerFitCamera: () => void
}

const defaultLighting: LightingState = {
  mainIntensity: 1,
  mainColor: '#ffffff',
  ambientIntensity: 0.4,
  ambientColor: '#404040',
}

const ViewerContext = createContext<ViewerContextType | null>(null)

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [model, setModel] = useState<Group | null>(null)
  const [modelStats, setModelStats] = useState<ModelStats | null>(null)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [renderMode, setRenderMode] = useState<RenderMode>('default')
  const [lighting, setLighting] = useState<LightingState>(defaultLighting)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showAxes, setShowAxes] = useState(true)
  const [cameraPreset, setCameraPreset] = useState<'front' | 'side' | 'top' | 'three-quarter' | null>(null)
  const [fitCameraTrigger, setFitCameraTrigger] = useState(0)

  const triggerFitCamera = useCallback(() => setFitCameraTrigger(t => t + 1), [])

  return (
    <ViewerContext.Provider
      value={{
        model,
        setModel,
        modelStats,
        setModelStats,
        performanceMetrics,
        setPerformanceMetrics,
        renderMode,
        setRenderMode,
        lighting,
        setLighting,
        loadingProgress,
        setLoadingProgress,
        isLoading,
        setIsLoading,
        showGrid,
        setShowGrid,
        showAxes,
        setShowAxes,
        cameraPreset,
        setCameraPreset,
        fitCameraTrigger,
        triggerFitCamera,
      }}
    >
      {children}
    </ViewerContext.Provider>
  )
}

export function useViewer() {
  const ctx = useContext(ViewerContext)
  if (!ctx) throw new Error('useViewer must be used within ViewerProvider')
  return ctx
}

