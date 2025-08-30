import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Products from '../pages/Product/Products';
import Categories from '../pages/Categories/Categories';
import History from '../pages/History/History';
import POS from '../pages/POS/POS';
import Customers from '../pages/Customers/Customers';
import Settings from './Settings';
import User from '../pages/User/User';
import ProductJourney from '../pages/Product/ProductJourney';
import AddProductForm from '../pages/Product/AddProductForm';
import UpdateProductForm from '../pages/Product/UpdateProductForm';
import Currency from '../pages/Currency/Currency';
import Suppliers from '../pages/Suppliers/Suppliers';
import AddSupplier from '../pages/Suppliers/AddSupplier';
import UpdateSupplier from '../pages/Suppliers/UpdateSupplier';
import CustomerHistory from '../pages/History/CustomerHistory';
import Navigation from './Navigation/Navigation';
import AddCustomerPage from '../pages/Customers/AddCustomerPage';
import UpdateCustomerPage from '../pages/Customers/UpdateCustomerPage';
import Reports from '../pages/Reports/Reports';
import Purchase from '../pages/Purchase/Purchase';
import Warehouse from '../pages/WareHHouse/Wherehouse';
import Addwarahouse from '../pages/WareHHouse/Addwarahouse';
import SuppliersDetails from '../pages/Suppliers/SuppliersDetails';
import Updatewarehouse from '../pages/WareHHouse/Updatewarehouse';
import { Suspense } from 'react';
import Shop from '../pages/Shop/Shop';
import AddShopPage from '../pages/Shop/AddShopPage';
import UpdateShopPage from '../pages/Shop/UpdateShopPage';
const Layout = () => {
  
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Optional: Highlight current page in Sidebar based on URL
  const currentPage = location.pathname.replace('/', '') || '';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar
        currentPage={currentPage}
        onPageChange={(page) => navigate(`/${page}`)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      /> */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/Navigation" element={<Navigation />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/Add" element={<AddProductForm />} />
          <Route path="/products/update/:id" element={<UpdateProductForm />} />
          <Route path="/products/productjourney" element={<ProductJourney />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/currencies" element={<Currency />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/add" element={<AddSupplier />} />
          <Route path="/suppliers/:id/edit" element={<UpdateSupplier />} />
          <Route path="/suppliers/details/:id" element={<SuppliersDetails />} />
          <Route path="/user" element={<User />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/history" element={<History />} />
          <Route path="/customers/:id" element={<CustomerHistory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/add" element={<AddCustomerPage />} />
          <Route path="/customers/edit/:id" element={<UpdateCustomerPage />} />
          <Route path="/Purchase" element={<Purchase />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/add-warehouse" element={<Addwarahouse />} />
          <Route path="/update-warehouse/:id" element={<Updatewarehouse />} />
          <Route
            path="/warehousedetails/:id"
            element={
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-64">
                    <span>Loading...</span>
                  </div>
                }
              >
                {React.createElement(
                  React.lazy(() =>
                    import("../pages/WareHHouse/WarehouseDetails")
                  )
                )}
              </Suspense>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="/Shop" element={<Shop />} />
          <Route path="/add-shop" element={<AddShopPage />} />
          <Route path="/update-shop/:id" element={<UpdateShopPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
