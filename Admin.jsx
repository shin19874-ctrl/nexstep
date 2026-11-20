import { NavLink, Route, Routes } from 'react-router-dom'
import { BarChart3, Briefcase, BookOpen, FileText, Users, Video } from 'lucide-react'
import Overview from './Overview'
import Manage from './Manage'
import Applications from './Applications'
import UsersPage from './Users'

const nav = [['', 'Overview', BarChart3], ['webinars', 'Webinars', Video], ['courses', 'Courses', BookOpen], ['internships', 'Internships', Briefcase], ['applications', 'Applications', FileText], ['users', 'Users', Users]]

export default function Admin() {
  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold">Admin dashboard</h1>
      <nav className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-200">
        {nav.map(([to, l, Icon]) => (
          <NavLink key={to} to={`/admin/${to}`} end className={({ isActive }) => `inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium ${isActive ? 'border-ocean-600 text-ocean-700' : 'border-transparent text-slate-500 hover:text-navy-900'}`}>
            <Icon className="h-4 w-4" />{l}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="webinars" element={<Manage type="webinars" />} />
          <Route path="courses" element={<Manage type="courses" />} />
          <Route path="internships" element={<Manage type="internships" />} />
          <Route path="applications" element={<Applications />} />
          <Route path="users" element={<UsersPage />} />
        </Routes>
      </div>
    </div>
  )
}
