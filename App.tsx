import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import About from './pages/About'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import AuthPage from './pages/AuthPage'
import Account from './pages/Account'
import RequireAuth from './components/RequireAuth'
import AuthRedirect from './components/AuthRedirect'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthRedirect />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/webinars" element={<Listings type="webinar" />} />
          <Route path="/webinars/:id" element={<ListingDetail type="webinar" />} />
          <Route path="/workshops" element={<Listings type="workshop" />} />
          <Route path="/workshops/:id" element={<ListingDetail type="workshop" />} />
          <Route path="/courses" element={<Listings type="course" />} />
          <Route path="/courses/:id" element={<ListingDetail type="course" />} />
          <Route path="/explore" element={<Navigate to="/webinars" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
