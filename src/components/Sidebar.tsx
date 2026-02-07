import { useRef } from 'react'
import { useViewer } from '../context/ViewerContext'
import { loadModel, computePerformanceMetrics } from '../utils/modelLoader'
import type { RenderMode } from '../types'
import './Sidebar.css'

const RENDER_MODES: { id: RenderMode; label: string }[] = [
  { id: 'default', label: 'PBR' },
  { id: 'wireframe', label: 'Wireframe' },
  { id: 'normals', label: 'Normals' },
  { id: 'uv-checker', label: 'UV Check' },
  { id: 'unlit', label: 'Unlit' },
]

export default function Sidebar() {
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    setModel,
    setModelStats,
    setPerformanceMetrics,
    modelStats,
    performanceMetrics,
    loadingProgress,
    setLoadingProgress,
    isLoading,
    setIsLoading,
    renderMode,
    setRenderMode,
    lighting,
    setLighting,
    setCameraPreset,
    showGrid,
    setShowGrid,
    showAxes,
    setShowAxes,
    triggerFitCamera,
  } = useViewer()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['glb', 'gltf', 'obj', 'fbx'].includes(ext || '')) {
      alert('Unsupported format. Use .glb, .gltf, .obj, or .fbx')
      return
    }

    setIsLoading(true)
    setLoadingProgress(0)

    try {
      const { model, stats } = await loadModel(file, (progress) => {
        setLoadingProgress(progress)
      })

      setModel(model)
      setModelStats(stats)

      const perf = computePerformanceMetrics(model, stats, file.size)
      setPerformanceMetrics(perf)

      triggerFitCamera()
    } catch (err) {
      console.error(err)
      alert('Failed to load model')
    } finally {
      setIsLoading(false)
      setLoadingProgress(100)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <aside className="sidebar">
      {/* Model Upload & Info */}
      <section className="panel">
        <h2 className="panel-title">
          <span className="panel-icon">📤</span>
          Model Upload & Info
        </h2>
        <div
          className={`upload-zone ${modelStats ? 'has-file' : ''}`}
          onClick={() => !isLoading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".glb,.gltf,.obj,.fbx"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
          {isLoading ? (
            <>
              <p>Loading... {Math.round(loadingProgress)}%</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${loadingProgress}%` }} />
              </div>
            </>
          ) : (
            <>
              <p>{modelStats ? 'Click to load another model' : 'Drop or click to upload'}</p>
              <span className="formats">Supports .glb, .gltf, .obj, .fbx</span>
            </>
          )}
        </div>

        {modelStats && (
          <div className="stats-grid" style={{ marginTop: 16 }}>
            <div className="stat-item">
              <div className="stat-label">Vertices</div>
              <div className="stat-value">{modelStats.vertexCount.toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Triangles</div>
              <div className="stat-value">{modelStats.triangleCount.toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Meshes</div>
              <div className="stat-value">{modelStats.meshCount}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Materials</div>
              <div className="stat-value">{modelStats.materialCount}</div>
            </div>
            <div className="stat-item" style={{ gridColumn: '1 / -1' }}>
              <div className="stat-label">Dimensions (W × H × D)</div>
              <div className="stat-value">
                {modelStats.width.toFixed(2)} × {modelStats.height.toFixed(2)} × {modelStats.depth.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Performance Analysis */}
      <section className="panel">
        <h2 className="panel-title">
          <span className="panel-icon">📊</span>
          Performance Analysis
        </h2>
        {performanceMetrics ? (
          <>
            <div className="performance-score">
              <div
                className={`score-circle ${
                  performanceMetrics.score >= 80 ? 'good' : performanceMetrics.score >= 55 ? 'moderate' : 'poor'
                }`}
              >
                {performanceMetrics.score}
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {performanceMetrics.score >= 80 ? '🟢 Good' : performanceMetrics.score >= 55 ? '🟡 Moderate' : '🔴 Poor'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Overall performance score</div>
              </div>
            </div>
            <div className="performance-metrics">
              <div className="perf-metric">
                <span>File size</span>
                <span>{performanceMetrics.fileSize}</span>
              </div>
              <div className="perf-metric">
                <span>Texture memory</span>
                <span>{performanceMetrics.textureMemory}</span>
              </div>
              <div className="perf-metric">
                <span>Triangle count</span>
                <span>{performanceMetrics.triangleCount.toLocaleString()}</span>
              </div>
            </div>
            {performanceMetrics.tips.length > 0 && (
              <div className="perf-tips">
                <strong>Tip:</strong> {performanceMetrics.tips[0]}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">Load a model to see performance metrics</div>
        )}
      </section>

      {/* Render Modes */}
      <section className="panel">
        <h2 className="panel-title">
          <span className="panel-icon">🎨</span>
          Render Modes
        </h2>
        <div className="mode-buttons">
          {RENDER_MODES.map((m) => (
            <button
              key={m.id}
              className={`mode-btn ${renderMode === m.id ? 'active' : ''}`}
              onClick={() => setRenderMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      {/* Lighting Controls */}
      <section className="panel">
        <h2 className="panel-title">
          <span className="panel-icon">💡</span>
          Lighting Controls
        </h2>
        <div className="light-control">
          <div className="light-label">Main Light</div>
          <div className="light-row">
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lighting.mainIntensity}
                onChange={(e) =>
                  setLighting((p) => ({ ...p, mainIntensity: parseFloat(e.target.value) }))
                }
              />
              <span className="slider-value">{lighting.mainIntensity.toFixed(1)}</span>
            </div>
          </div>
          <div className="light-row">
            <div className="color-picker-wrap">
              <input
                type="color"
                value={lighting.mainColor}
                onChange={(e) => setLighting((p) => ({ ...p, mainColor: e.target.value }))}
              />
              <button
                className="reset-btn"
                onClick={() => setLighting((p) => ({ ...p, mainIntensity: 1, mainColor: '#ffffff' }))}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        <div className="light-control">
          <div className="light-label">Ambient Light</div>
          <div className="light-row">
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={lighting.ambientIntensity}
                onChange={(e) =>
                  setLighting((p) => ({ ...p, ambientIntensity: parseFloat(e.target.value) }))
                }
              />
              <span className="slider-value">{lighting.ambientIntensity.toFixed(2)}</span>
            </div>
          </div>
          <div className="light-row">
            <div className="color-picker-wrap">
              <input
                type="color"
                value={lighting.ambientColor}
                onChange={(e) => setLighting((p) => ({ ...p, ambientColor: e.target.value }))}
              />
              <button
                className="reset-btn"
                onClick={() =>
                  setLighting((p) => ({ ...p, ambientIntensity: 0.4, ambientColor: '#404040' }))
                }
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Camera Controls */}
      <section className="panel">
        <h2 className="panel-title">
          <span className="panel-icon">📷</span>
          Camera Controls
        </h2>
        <div className="camera-presets">
          <button className="camera-btn" onClick={() => setCameraPreset('front')}>
            Front
          </button>
          <button className="camera-btn" onClick={() => setCameraPreset('side')}>
            Side
          </button>
          <button className="camera-btn" onClick={() => setCameraPreset('top')}>
            Top
          </button>
          <button className="camera-btn" onClick={() => setCameraPreset('three-quarter')}>
            3/4 View
          </button>
        </div>
        <div className="camera-hints">
          <strong>Mouse:</strong> Left-drag rotate • Right-drag pan • Scroll zoom
          <br />
          <strong>Touch:</strong> 1-finger rotate • 2-finger pan • Pinch zoom
        </div>
      </section>

      {/* 3D Viewport Toggles */}
      <section className="panel">
        <h2 className="panel-title">
          <span className="panel-icon">⊞</span>
          Viewport
        </h2>
        <div className="viewport-toggles">
          <button
            className={`toggle-btn ${showGrid ? 'active' : ''}`}
            onClick={() => setShowGrid(!showGrid)}
          >
            Grid
          </button>
          <button
            className={`toggle-btn ${showAxes ? 'active' : ''}`}
            onClick={() => setShowAxes(!showAxes)}
          >
            Axes
          </button>
        </div>
      </section>
    </aside>
  )
}
