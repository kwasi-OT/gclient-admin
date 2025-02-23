import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import AdminDashboard from './pages/AdminDashboard'
import { Toaster } from 'react-hot-toast'


function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Toaster 
        position='top-center'
        reverseOrder={false}
        toastOptions={{
          duration: 2000 
        }}
      />
    </BrowserRouter>
  )
}

export default App
