import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Products from '../pages/Product/Products';
import Categories from '../pages/Categories/Categories';
import Reports from './Reports';
import History from './History';
import POS from '../pages/POS/POS';
import Customers from '../pages/Customers/Customers';
import Settings from './Settings';
import User from '../pages/User/User';
import ProductJourney from '../pages/Product/ProductJourney';
import AddProductForm from '../pages/Product/AddProductForm';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Optional: Highlight current page in Sidebar based on URL
  const currentPage = location.pathname.replace('/', '') || '';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => navigate(`/${page}`)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/products" element={<Products />} />
          <Route path="/products/Add" element={<AddProductForm />} />
          <Route path="/products/productjourney" element={<ProductJourney />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/user" element={<User />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/history" element={<History />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          {/* <Route path="*" element={<Products />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
