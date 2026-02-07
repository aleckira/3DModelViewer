import { useApp } from '../App'
import './Toolbar.css'

export default function Toolbar() {
  const { theme, toggleTheme } = useApp()

  return (
    <header className="toolbar">
      <h1 className="toolbar-title">3D Model Viewer</h1>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
      </button>
    </header>
  )
}
