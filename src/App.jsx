import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Delivery from './pages/Delivery';
import db from './db';
import { HiBars3 } from 'react-icons/hi2';

function App() {
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Poll pending deliveries for badge
    const updateCount = async () => {
      const count = await db.sales.where('status').equals('Pending').count();
      setPendingCount(count);
    };

    updateCount();
    const interval = setInterval(updateCount, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="flex bg-light text-gray-800 h-screen overflow-hidden font-sans">

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
        )}

        {/* Sidebar Container */}
        <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar pendingCount={pendingCount} onClose={() => setMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
          {/* Mobile Header */}
          <header className="bg-light border-b h-16 flex items-center justify-between px-6 md:hidden flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600 hover:text-dark">
                <HiBars3 className="text-2xl" />
              </button>
              <span className="font-bold text-lg">MushroomPOS</span>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/delivery" element={<Delivery />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
