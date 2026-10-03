import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        {/* Brand */}
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          <span className="brand-compass">COMPASS</span>
          <span className="brand-sub">KJO University</span>
        </Link>

        {/* Center nav links */}
        <div className="navbar-center">
          <NavLink to="/lost-items" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={closeMenu}>
            Lost Items
          </NavLink>
          <NavLink to="/found-items" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={closeMenu}>
            Found Items
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={closeMenu}>
                Dashboard
              </NavLink>
              <NavLink to="/my-reports" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={closeMenu}>
                My Reports
              </NavLink>
              <NavLink to="/my-claims" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={closeMenu}>
                My Claims
              </NavLink>
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={closeMenu}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* Right side — auth actions */}
        <div className="navbar-right">
          {!user ? (
            <>
              <NavLink to="/login" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} onClick={closeMenu}>
                Login
              </NavLink>
              <Link to="/register" className="btn btn-accent btn-sm" onClick={closeMenu}>
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="nav-username">
                <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
                {' '}{user.name.split(' ')[0]}
              </span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/lost-items" className="mobile-link" onClick={closeMenu}>Lost Items</NavLink>
          <NavLink to="/found-items" className="mobile-link" onClick={closeMenu}>Found Items</NavLink>
          {!user ? (
            <>
              <NavLink to="/login" className="mobile-link" onClick={closeMenu}>Login</NavLink>
              <Link to="/register" className="mobile-link mobile-link-accent" onClick={closeMenu}>Register</Link>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className="mobile-link" onClick={closeMenu}>Dashboard</NavLink>
              <NavLink to="/my-reports" className="mobile-link" onClick={closeMenu}>My Reports</NavLink>
              <NavLink to="/my-claims" className="mobile-link" onClick={closeMenu}>My Claims</NavLink>
              {user.role === 'ADMIN' && (
                <NavLink to="/admin" className="mobile-link" onClick={closeMenu}>Admin</NavLink>
              )}
              <div className="mobile-user-info">
                <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
                <span>{user.name}</span>
              </div>
              <button className="mobile-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
