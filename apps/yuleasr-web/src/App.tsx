import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Editor } from './pages/Editor'
import { Templates } from './pages/Templates'
import { GitSync } from './pages/GitSync'
import { Settings } from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/sync" element={<GitSync />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/editor/:configId" element={<Editor />} />
        <Route path="/editor/:configId/:moduleId" element={<Editor />} />
      </Routes>
    </Layout>
  )
}

export default App
