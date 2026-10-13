import React from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Notifications } from './components/common/Notifications';
import { CameriereView } from './components/cameriere/CameriereView';
import { CapoSalaView } from './components/caposala/CapoSalaView';
import { PizzeriaView } from './components/pizzeria/PizzeriaView';
import { CucinaView } from './components/cucina/CucinaView';
import { BarView } from './components/bar/BarView';
import { AsportoView } from './components/asporto/AsportoView';
import { TurniView } from './components/turni/TurniView';
import { AdminView } from './components/admin/AdminView';

export const App: React.FC = () => {
  const { currentRole } = useApp();

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <Navbar />

      <main className="flex-1 overflow-hidden relative pb-14 md:pb-0">
        {currentRole === 'CAMERIERE' && <CameriereView />}
        {currentRole === 'CAPO_SALA' && <CapoSalaView />}
        {currentRole === 'PIZZERIA' && <PizzeriaView />}
        {currentRole === 'CUCINA' && <CucinaView />}
        {currentRole === 'BAR' && <BarView />}
        {currentRole === 'ASPORTO' && <AsportoView />}
        {currentRole === 'TURNI' && <TurniView />}
        {currentRole === 'ADMIN' && <AdminView />}
      </main>

      <Notifications />
    </div>
  );
};

export default App;
