import { Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </>
  )
}
