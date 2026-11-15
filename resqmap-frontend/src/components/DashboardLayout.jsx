import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Brand from './Brand';
import { getSavedUser, logout } from '../services/api';

export default function DashboardLayout({ children, type }) {
  const navigate = useNavigate();
  const user = getSavedUser();
  const rescue = type === 'rescue';
  const links = rescue
    ? [['/rescue', 'Command overview', '▦'], ['/rescue/reports', 'Incident queue', '⌖'], ['/rescue/camps', 'Relief locations', '⌂'], ['/rescue/movement', 'Field movements', '⇢']]
    : [['/survivor', 'My home', '⌂'], ['/survivor/report', 'Send an emergency report', '+'], ['/survivor/updates', 'Local situation updates', '◉'], ['/survivor/camps', 'Find relief', '⌖']];
  const signOut = () => { logout(); navigate('/login'); };
  const displayName = user?.full_name || user?.username || (rescue ? 'Responder' : 'Community member');
  return <div className={`dashboard-shell ${rescue ? 'rescue-shell' : 'survivor-shell'}`}>
    <aside className="sidebar">
      <Brand light />
      <div className="workspace-label">{rescue ? 'FIELD OPERATIONS' : 'COMMUNITY SPACE'}</div>
      <div className="workspace-caption">{rescue ? 'Coordinate. Verify. Respond.' : 'Stay informed. Stay safer.'}</div>
      <nav aria-label="Workspace navigation">{links.map(([to, label, icon]) => <NavLink key={to} end={to === '/survivor' || to === '/rescue'} to={to} className={({isActive}) => `side-link ${isActive ? 'active' : ''}`}><span>{icon}</span>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-help"><strong>{rescue ? 'Operational reminder' : 'Emergency reminder'}</strong><p>{rescue ? 'Share verified information and follow your organisation’s response protocols.' : 'If you are in immediate danger, contact local emergency services first.'}</p></div>
        <div className="user-mini"><div className="avatar">{displayName.slice(0,1).toUpperCase()}</div><div className="user-details"><strong>{displayName}</strong><small>{rescue ? 'Authorised rescue workspace' : 'Survivor account'}</small></div></div>
        <button className="signout" onClick={signOut}>↗ <span>Sign out</span></button>
      </div>
    </aside>
    <main className="dashboard-main">
      <header className="dash-top"><div className="top-context"><span className="live-dot"/> {rescue ? 'RESQMAP RESPONSE NETWORK' : 'COMMUNITY INFORMATION NETWORK'}</div><span className="top-role">{rescue ? 'RESCUE TEAM PORTAL' : 'SURVIVOR PORTAL'}</span></header>
      {children}
    </main>
  </div>;
}
