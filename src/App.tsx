import { useState, createContext, useContext, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { ViewerProvider } from './context/ViewerContext'
import Sidebar from './components/Sidebar'
import Viewport from './components/Viewport'
import Toolbar from './components/Toolbar'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

export type Theme = 'dark' | 'light'

interface AppContextType {
  theme: Theme
  toggleTheme: () => void
}

export const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within App')
  return ctx
}

function App() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ErrorBoundary>
      <AppContext.Provider value={{ theme, toggleTheme }}>
        <ViewerProvider>
          <div className="app">
            <Sidebar />
            <main className="main-content">
              <Toolbar />
              <div className="viewport-container">
                <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
                  <Viewport />
                </Canvas>
              </div>
            </main>
          </div>
        </ViewerProvider>
      </AppContext.Provider>
    </ErrorBoundary>
  )
}

export default App
