import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="layout">
      <header className="navbar"><span>Pa' Dónde</span><small>Descubre planes cerca de ti</small></header>
      <div className="content">
        <Outlet/>
      </div>
      
    </div>
  );
}
export default Layout;
