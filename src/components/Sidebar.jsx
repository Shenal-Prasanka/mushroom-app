import { NavLink } from 'react-router-dom';

import { FaLeaf } from 'react-icons/fa'; // Mix icons if needed, or stick to one. I will use standard react-icons for ease for everything if installed.

// Actually I installed react-icons but didn't specific heroicons. `react-icons/hi2` is good.
import { HiChartPie, HiComputerDesktop, HiArchiveBox, HiTruck } from 'react-icons/hi2';

const Sidebar = ({ pendingCount, onClose }) => {
    return (
        <aside className="w-64 bg-darker text-white flex flex-col h-full shadow-xl transition-all duration-300 z-20 flex" style={{ backgroundColor: '#000000' }}>
            <div className="p-6 flex items-center gap-3 border-b border-darker">
                <div className="p-2 bg-primary rounded-lg">
                    <FaLeaf className="text-white text-xl" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-wide">Mushroom<span className="text-primary">POS</span></h1>
                    <p className="text-xs text-gray-400">Retail & Delivery</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                <NavLink to="/" onClick={onClose} className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-darker text-white' : 'text-gray-400 hover:bg-darker hover:text-white'}`}>
                    <HiChartPie className="text-lg group-hover:text-primary transition-colors" />
                    <span className="font-medium">Dashboard</span>
                </NavLink>
                <NavLink to="/pos" onClick={onClose} className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-darker text-white' : 'text-gray-400 hover:bg-darker hover:text-white'}`}>
                    <HiComputerDesktop className="text-lg group-hover:text-primary transition-colors" />
                    <span className="font-medium">POS Terminal</span>
                </NavLink>
                <NavLink to="/inventory" onClick={onClose} className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-darker text-white' : 'text-gray-400 hover:bg-darker hover:text-white'}`}>
                    <HiArchiveBox className="text-lg group-hover:text-primary transition-colors" />
                    <span className="font-medium">Inventory</span>
                </NavLink>
                <NavLink to="/delivery" onClick={onClose} className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-darker text-white' : 'text-gray-400 hover:bg-darker hover:text-white'}`}>
                    <HiTruck className="text-lg group-hover:text-primary transition-colors" />
                    <span className="font-medium">Delivery</span>
                    {pendingCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
                    )}
                </NavLink>
            </nav>

            <div className="p-4 border-t border-darker">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-darker flex items-center justify-center text-xs font-bold text-gray-300">
                        AD
                    </div>
                    <div>
                        <p className="text-sm font-medium">Admin User</p>
                        <p className="text-xs text-gray-500">Online</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
