
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Products from './Products';
import Categories from './Categories';
import Reports from './Reports';
import History from './History';

const Layout = () => {
  const [currentPage, setCurrentPage] = useState('products');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'products':
        return <Products />;
      case 'categories':
        return <Categories />;
      case 'reports':
        return <Reports />;
      case 'history':
        return <History />;
      case 'pos':
        return <div className="p-6"><h1 className="text-3xl font-bold">POS Terminal</h1><p>Point of sale interface coming soon...</p></div>;
      case 'customers':
        return <div className="p-6"><h1 className="text-3xl font-bold">Customers</h1><p>Customer management coming soon...</p></div>;
      case 'settings':
        return <div className="p-6"><h1 className="text-3xl font-bold">Settings</h1><p>System settings coming soon...</p></div>;
      default:
        return <Products />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
};

export default Layout;
