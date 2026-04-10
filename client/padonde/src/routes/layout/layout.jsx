import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <div className="layout">
      <div className="navbar">
        
      </div>
      <div className="content">
        <Outlet/>
      </div>
      
    </div>
  );
}
export default Layout;