import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';

export default function Layout() {
  const location = useLocation();
  const isDisplayScreen = location.pathname.startsWith('/display');

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col font-sans selection:bg-gold selection:text-charcoal">
      {!isDisplayScreen && <Header />}
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
}
