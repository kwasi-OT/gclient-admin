import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import AdminDashboard from './pages/AdminDashboard'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
