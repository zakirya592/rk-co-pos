
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Products from './Products';
import Categories from './Categories';
import Reports from './Reports';
import History from './History';
import POS from './POS';
import Customers from './Customers';
import Settings from './Settings';

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
        return <POS />;
      case 'customers':
        return <Customers />;
      case 'settings':
        return <Settings />;
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
