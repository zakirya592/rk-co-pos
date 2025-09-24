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
import Shipment from '../pages/Shipment/Shipment';
import ExpenseNavigation from './Navigation/ExpenseNavigation';
import AddShipment from '../pages/Shipment/AddShipment';
import UpdateShipment from '../pages/Shipment/UpdateShipment';
import Transporters from '../pages/Transporters/Transporters';
import AddTransporterPage from '../pages/Transporters/AddTransporterPage';
import UpdateTransporterPage from '../pages/Transporters/UpdateTransporterPage';
import TransporterDetails from '../pages/Transporters/TransporterDetails';
import { AddProcurementExpense, ProcurementExpenseDetails, ProcurementExpenses ,EditProcurementExpense } from '../pages/ProcurementExpenses';
import { WarehouseExpenses, AddWarehouseExpense, EditWarehouseExpense, WarehouseExpenseDetails } from '../pages/WarehouseExpenses';
import { LogisticsExpenses, AddLogisticsExpense, EditLogisticsExpense, LogisticsExpenseDetails } from '../pages/LogisticsExpenses';
import { SalesDistributionExpenses, AddSalesDistributionExpense, EditSalesDistributionExpense, SalesDistributionExpenseDetails } from '../pages/SalesDistributionExpenses';
import { OperationalExpenses, AddOperationalExpense, EditOperationalExpense, OperationalExpenseDetails } from '../pages/OperationalExpenses';
import { MiscellaneousExpenses, AddMiscellaneousExpense, EditMiscellaneousExpense, MiscellaneousExpenseDetails } from '../pages/MiscellaneousExpenses';
import { FinancialExpenses, AddFinancialExpense, EditFinancialExpense, FinancialExpenseDetails } from '../pages/FinancialExpenses';
import BankAccounts from '../pages/BankAccounts/BankAccounts';
import AddBankAccount from '../pages/BankAccounts/AddBankAccount';
import UpdateBankAccount from '../pages/BankAccounts/UpdateBankAccount';

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
            path="/warehousedetails/:type/:id"
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
          <Route
            path="/ShopDetails/:type/:id"
            element={
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-64">
                    <span>Loading...</span>
                  </div>
                }
              >
                {React.createElement(
                  React.lazy(() => import("../pages/Shop/ShopDetails"))
                )}
              </Suspense>
            }
          />

          <Route path="/shipments" element={<Shipment />} />
          <Route path="/shipments/add" element={<AddShipment />} />
          <Route path="/shipments/update/:id" element={<UpdateShipment />} />
          
          <Route path="/expenses" element={<ExpenseNavigation />} />
          
          {/* Transporters Routes */}
          <Route path="/transporters" element={<Transporters />} />
          <Route path="/add-transporter" element={<AddTransporterPage />} />
          <Route path="/update-transporter/:id" element={<UpdateTransporterPage />} />
          <Route path="/transporter-details/:id" element={<TransporterDetails />} />
          
          {/* Procurement Expenses Routes */}
          <Route path="/expenses/procurement" element={<ProcurementExpenses />} />
          <Route path="/expenses/procurement/add" element={<AddProcurementExpense />} />
          <Route path="/expenses/procurement/edit/:id" element={<EditProcurementExpense />} />
          <Route path="/expenses/procurement/:id" element={<ProcurementExpenseDetails />} />
          
          {/* Warehouse Expenses Routes */}
          <Route path="/expenses/warehouse" element={<WarehouseExpenses />} />
          <Route path="/expenses/warehouse/add" element={<AddWarehouseExpense />} />
          <Route path="/expenses/warehouse/edit/:id" element={<EditWarehouseExpense />} />
          <Route path="/expenses/warehouse/:id" element={<WarehouseExpenseDetails />} />
          
          {/* Logistics Expenses Routes */}
          <Route path="/expenses/logistics" element={<LogisticsExpenses />} />
          <Route path="/expenses/logistics/add" element={<AddLogisticsExpense />} />
          <Route path="/expenses/logistics/edit/:id" element={<EditLogisticsExpense />} />
          <Route path="/expenses/logistics/:id" element={<LogisticsExpenseDetails />} />

          {/* Sales Distribution Expenses Routes */}
          <Route path="/expenses/sales-distribution" element={<SalesDistributionExpenses />} />
          <Route path="/expenses/sales-distribution/add" element={<AddSalesDistributionExpense />} />
          <Route path="/expenses/sales-distribution/edit/:id" element={<EditSalesDistributionExpense />} />
          <Route path="/expenses/sales-distribution/:id" element={<SalesDistributionExpenseDetails />} />
          
          {/* Operational Expenses Routes */}
          <Route path="/expenses/operational" element={<OperationalExpenses />} />
          <Route path="/expenses/operational/add" element={<AddOperationalExpense />} />
          <Route path="/expenses/operational/edit/:id" element={<EditOperationalExpense />} />
          <Route path="/expenses/operational/:id" element={<OperationalExpenseDetails />} />

          {/* Miscellaneous Expenses Routes */}
          <Route path="/expenses/miscellaneous" element={<MiscellaneousExpenses />} />
          <Route path="/expenses/miscellaneous/add" element={<AddMiscellaneousExpense />} />
          <Route path="/expenses/miscellaneous/edit/:id" element={<EditMiscellaneousExpense />} />
          <Route path="/expenses/miscellaneous/:id" element={<MiscellaneousExpenseDetails />} />
          
          {/* Financial Expenses Routes */}
          <Route path="/expenses/financial" element={<FinancialExpenses />} />
          <Route path="/expenses/financial/add" element={<AddFinancialExpense />} />
          <Route path="/expenses/financial/edit/:id" element={<EditFinancialExpense />} />
          <Route path="/expenses/financial/:id" element={<FinancialExpenseDetails />} />
          
          {/* Bank Accounts */}
          <Route path="/bank-accounts" element={<BankAccounts />} />
          <Route path="/bank-accounts/add" element={<AddBankAccount />} />
          <Route path="/bank-accounts/update/:id" element={<UpdateBankAccount />} />
          
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
