import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="site-header">
      <div className="container nav-container">
        <NavLink className="brand-mark" to="/">
          <span className="brand-mark__icon">♥</span>
          <span>
            <strong>KnowMyHeart</strong>
            <small>Love quiz studio</small>
          </span>
        </NavLink>

        <nav className="nav-links" aria-label="Primary">
          <NavLink
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`.trim()
            }
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`.trim()
            }
            to="/create"
          >
            Create Quiz
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`.trim()
            }
            to="/play"
          >
            Play Quiz
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `nav-link ${isActive ? "nav-link--active" : ""}`.trim()
            }
            to="/sync"
          >
            Heart Sync
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
