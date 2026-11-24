import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import JoinQueue from './pages/JoinQueue.jsx';
import MyStatus from './pages/MyStatus.jsx';
import Reception from './pages/Reception.jsx';
import BarberView from './pages/BarberView.jsx';
import Display from './pages/Display.jsx';
import AdminSettings from './pages/AdminSettings.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="join" element={<JoinQueue />} />
        <Route path="status/:id" element={<MyStatus />} />
        <Route path="reception" element={<Reception />} />
        <Route path="barber/:name" element={<BarberView />} />
        <Route path="display" element={<Display />} />
        <Route path="admin" element={<AdminSettings />} />
        {/* Fallback route */}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
