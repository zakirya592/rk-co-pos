import React, { useState } from 'react';
import { Tabs, Tab, Card, CardBody, Button } from '@nextui-org/react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import QuantityUnitsTable from './components/QuantityUnitsTable';
import PackingUnitsTable from './components/PackingUnitsTable';
import userRequest from '../../utils/userRequest';
import PochuesTable from './components/PochuesTable';
import AssetsTable from './components/AssetsTable';
import IncomesTable from './components/IncomesTable';
import LiabilitiesTable from './components/LiabilitiesTable';
import PartnershipAccountsTable from './components/PartnershipAccountsTable';
import CashBooksTable from './components/CashBooksTable';
import CapitalsTable from './components/CapitalsTable';
import OwnersTable from './components/OwnersTable';
import EmployeesTable from './components/EmployeesTable';
import PropertyAccountsTable from './components/PropertyAccountsTable';
import { 
  FaBoxes, 
  FaLayerGroup, 
  FaTags,
  FaDollarSign,
  FaChartLine,
  FaFileInvoice,
  FaHandshake,
  FaWallet,
  FaCoins,
  FaUserTie,
  FaUsers,
  FaBuilding,
  FaBook
} from 'react-icons/fa';

const MasterData = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("quantity-units");
  const [selectedSidebarItem, setSelectedSidebarItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data for all tables
  const { data: quantityUnitsData, refetch: refetchQuantityUnits } = useQuery(
    'quantityUnits',
    async () => {
      const { data } = await userRequest.get("/quantity-units");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch quantity units');
      },
    }
  );

  const { data: packingUnitsData, refetch: refetchPackingUnits } = useQuery(
    'packingUnits',
    async () => {
      const { data } = await userRequest.get("/packing-units");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch packing units');
      },
    }
  );

  const { data: productsData, refetch: refetchProducts } = useQuery(
    'products',
    async () => {
      const { data } = await userRequest.get("/pochues");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch products');
      },
    }
  );

  const { data: assetsData, refetch: refetchAssets } = useQuery(
    'assets',
    async () => {
      const { data } = await userRequest.get("/assets");
      // Handle nested structure: data.data.assets
      if (data?.data?.assets && Array.isArray(data.data.assets)) {
        return data.data.assets;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch assets');
      },
    }
  );

  const { data: incomesData, refetch: refetchIncomes } = useQuery(
    'incomes',
    async () => {
      const { data } = await userRequest.get("/incomes");
      // Handle nested structure: data.data.incomes
      if (data?.data?.incomes && Array.isArray(data.data.incomes)) {
        return data.data.incomes;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch incomes');
      },
    }
  );

  const { data: liabilitiesData, refetch: refetchLiabilities } = useQuery(
    'liabilities',
    async () => {
      const { data } = await userRequest.get("/liabilities");
      // Handle nested structure: data.data.liabilities
      if (data?.data?.liabilities && Array.isArray(data.data.liabilities)) {
        return data.data.liabilities;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch liabilities');
      },
    }
  );

  const { data: partnershipAccountsData, refetch: refetchPartnershipAccounts } = useQuery(
    'partnership-accounts',
    async () => {
      const { data } = await userRequest.get("/partnership-accounts");
      // Handle nested structure: data.data.partnershipAccounts
      if (data?.data?.partnershipAccounts && Array.isArray(data.data.partnershipAccounts)) {
        return data.data.partnershipAccounts;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch partnership accounts');
      },
    }
  );

  const { data: cashBooksData, refetch: refetchCashBooks } = useQuery(
    'cash-books',
    async () => {
      const { data } = await userRequest.get("/cash-books");
      // Handle nested structure: data.data.cashBooks
      if (data?.data?.cashBooks && Array.isArray(data.data.cashBooks)) {
        return data.data.cashBooks;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch cash books');
      },
    }
  );

  const { data: capitalsData, refetch: refetchCapitals } = useQuery(
    'capitals',
    async () => {
      const { data } = await userRequest.get("/capitals");
      // Handle nested structure: data.data.capitals
      if (data?.data?.capitals && Array.isArray(data.data.capitals)) {
        return data.data.capitals;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch capitals');
      },
    }
  );

  const { data: ownersData, refetch: refetchOwners } = useQuery(
    'owners',
    async () => {
      const { data } = await userRequest.get("/owners");
      // Handle nested structure: data.data.owners
      if (data?.data?.owners && Array.isArray(data.data.owners)) {
        return data.data.owners;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch owners');
      },
    }
  );

  const { data: employeesData, refetch: refetchEmployees } = useQuery(
    'employees',
    async () => {
      const { data } = await userRequest.get("/employees");
      // Handle nested structure: data.data.employees
      if (data?.data?.employees && Array.isArray(data.data.employees)) {
        return data.data.employees;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch employees');
      },
    }
  );

  const { data: propertyAccountsData, refetch: refetchPropertyAccounts } = useQuery(
    'property-accounts',
    async () => {
      const { data } = await userRequest.get("/property-accounts");
      // Handle nested structure: data.data.propertyAccounts
      if (data?.data?.propertyAccounts && Array.isArray(data.data.propertyAccounts)) {
        return data.data.propertyAccounts;
      }
      // Fallback for other response structures
      if (Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch property accounts');
      },
    }
  );

  const handleTabChange = (key) => {
    setSelectedTab(key);
  };

  const refetchAll = () => {
    refetchQuantityUnits();
    refetchPackingUnits();
    refetchProducts();
    refetchAssets();
    refetchIncomes();
    refetchLiabilities();
    refetchPartnershipAccounts();
    refetchCashBooks();
    refetchCapitals();
    refetchOwners();
    refetchEmployees();
    refetchPropertyAccounts();
  };

  const sidebarItems = [
    { key: 'assets', label: 'Assets', icon: <FaDollarSign /> },
    { key: 'income', label: 'Income', icon: <FaChartLine /> },
    { key: 'liability', label: 'Liability', icon: <FaFileInvoice /> },
    { key: 'partnership', label: 'Partnership', icon: <FaHandshake /> },
    { key: 'cashbook', label: 'Cashbook', icon: <FaWallet /> },
    { key: 'capital', label: 'Capital', icon: <FaCoins /> },
    { key: 'owner', label: 'Owner', icon: <FaUserTie /> },
    { key: 'employee', label: 'Employee', icon: <FaUsers /> },
    { key: 'property-accounts', label: 'Property Accounts', icon: <FaBuilding /> },
  ];

  const renderSidebarContent = () => {
    if (!selectedSidebarItem) {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaBook className="text-teal-600 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Master Data</h3>
              <p className="text-gray-500 mb-6">Select an option from the sidebar to view and manage your data</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">Assets</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">Income</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">Liabilities</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">Employees</span>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">And more...</span>
              </div>
            </div>
          </CardBody>
        </Card>
      );
    }

    const item = sidebarItems.find(i => i.key === selectedSidebarItem);
    
    // Render Assets table when assets is selected
    if (selectedSidebarItem === 'assets') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Manage your assets and resources</p>
              </div>
            </div>
            <AssetsTable
              data={Array.isArray(assetsData) ? assetsData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }

    // Render Incomes table when income is selected
    if (selectedSidebarItem === 'income') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Track and manage income sources</p>
              </div>
            </div>
            <IncomesTable
              data={Array.isArray(incomesData) ? incomesData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }

    // Render Liabilities table when liability is selected
    if (selectedSidebarItem === 'liability') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Manage your liabilities and debts</p>
              </div>
            </div>
            <LiabilitiesTable
              data={Array.isArray(liabilitiesData) ? liabilitiesData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }

    // Render Partnership Accounts table when partnership is selected
    if (selectedSidebarItem === 'partnership') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Manage partnership accounts and shares</p>
              </div>
            </div>
            <PartnershipAccountsTable
              data={Array.isArray(partnershipAccountsData) ? partnershipAccountsData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }

    // Render Cash Books table when cashbook is selected
    if (selectedSidebarItem === 'cashbook') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Track cash flow and transactions</p>
              </div>
            </div>
            <CashBooksTable
              data={Array.isArray(cashBooksData) ? cashBooksData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }

    // Render Capitals table when capital is selected
    if (selectedSidebarItem === 'capital') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Manage capital investments and withdrawals</p>
              </div>
            </div>
            <CapitalsTable
              data={Array.isArray(capitalsData) ? capitalsData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }

    // Render Owners table when owner is selected
    if (selectedSidebarItem === 'owner') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Manage business owners and stakeholders</p>
              </div>
            </div>
            <OwnersTable
              data={Array.isArray(ownersData) ? ownersData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }

    // Render Employees table when employee is selected
    if (selectedSidebarItem === 'employee') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Manage employee information and records</p>
              </div>
            </div>
            <EmployeesTable
              data={Array.isArray(employeesData) ? employeesData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }

    // Render Property Accounts table when property-accounts is selected
    if (selectedSidebarItem === 'property-accounts') {
      return (
        <Card className="shadow-lg border-0">
          <CardBody className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
                {item?.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
                <p className="text-sm text-gray-500">Manage property assets and accounts</p>
              </div>
            </div>
            <PropertyAccountsTable
              data={Array.isArray(propertyAccountsData) ? propertyAccountsData : []}
              onRefresh={refetchAll}
            />
          </CardBody>
        </Card>
      );
    }
    
    // For other items, show placeholder
    return (
      <Card className="shadow-lg border-0">
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-teal-500/30">
              {item?.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{item?.label}</h2>
              <p className="text-sm text-gray-500">This feature is coming soon</p>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {item?.label} management section is under development.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Sidebar */}
      <div className="w-72 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FaBook className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Master Data</h2>
              <p className="text-xs text-teal-100">Management Center</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Existing Options Section */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mb-2">
                Product Management
              </p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedTab("quantity-units");
                    setSelectedSidebarItem(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    selectedTab === "quantity-units" && !selectedSidebarItem
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 font-semibold transform scale-[1.02]"
                      : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  <div className={`${selectedTab === "quantity-units" && !selectedSidebarItem ? "text-white" : "text-teal-600"}`}>
                    <FaBoxes className="text-lg" />
                  </div>
                  <span className="font-medium">Quantity Units</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTab("packing-units");
                    setSelectedSidebarItem(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    selectedTab === "packing-units" && !selectedSidebarItem
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 font-semibold transform scale-[1.02]"
                      : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  <div className={`${selectedTab === "packing-units" && !selectedSidebarItem ? "text-white" : "text-teal-600"}`}>
                    <FaLayerGroup className="text-lg" />
                  </div>
                  <span className="font-medium">Packing Units</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTab("pochues");
                    setSelectedSidebarItem(null);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                    selectedTab === "pochues" && !selectedSidebarItem
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 font-semibold transform scale-[1.02]"
                      : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  <div className={`${selectedTab === "pochues" && !selectedSidebarItem ? "text-white" : "text-teal-600"}`}>
                    <FaTags className="text-lg" />
                  </div>
                  <span className="font-medium">Products</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* Financial Management Section */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-2 mb-2">
                Financial Management
              </p>
              <div className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setSelectedSidebarItem(item.key);
                      setSelectedTab(null);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                      selectedSidebarItem === item.key
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30 font-semibold transform scale-[1.02]"
                        : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  >
                    <div className={`${selectedSidebarItem === item.key ? "text-white" : "text-teal-600"}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="flat"
            className="w-full bg-white hover:bg-gray-100 border border-gray-200"
            onPress={() => navigate('/Navigation')}
          >
            <span className="font-medium">← Back to Dashboard</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Master Data Management</h1>
                <p className="text-sm text-gray-500">
                  {selectedSidebarItem 
                    ? `Manage ${sidebarItems.find(i => i.key === selectedSidebarItem)?.label || 'data'}`
                    : selectedTab 
                      ? `Manage ${selectedTab === 'quantity-units' ? 'Quantity Units' : selectedTab === 'packing-units' ? 'Packing Units' : 'Products'}`
                      : 'Select a category to get started'
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="flat"
                  className="bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                  onPress={refetchAll}
                >
                  <span className="font-medium">Refresh All</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {selectedSidebarItem ? (
            <div className="animate-fadeIn">
              {renderSidebarContent()}
            </div>
          ) : (
            <Card className="w-full shadow-lg border-0">
              <CardBody className="p-0">
                <Tabs
                  aria-label="Master data tabs"
                  selectedKey={selectedTab}
                  onSelectionChange={handleTabChange}
                  className="px-6 pt-4"
                  variant="underlined"
                  classNames={{
                    tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-teal-600",
                    tab: "max-w-fit px-4 h-12",
                    tabContent: "group-data-[selected=true]:text-teal-600 font-semibold"
                  }}
                >
                  <Tab key="quantity-units" title="Quantity Units">
                    <div className="p-6">
                      <QuantityUnitsTable
                        data={quantityUnitsData || []}
                        onRefresh={refetchAll}
                      />
                    </div>
                  </Tab>
                  <Tab key="packing-units" title="Packing Units">
                    <div className="p-6">
                      <PackingUnitsTable
                        data={packingUnitsData || []}
                        quantityUnits={quantityUnitsData || []}
                        onRefresh={refetchAll}
                      />
                    </div>
                  </Tab>
                  <Tab key="pochues" title="Products">
                    <div className="p-6">
                      <PochuesTable
                        data={productsData || []}
                        packingUnits={packingUnitsData || []}
                        onRefresh={refetchAll}
                      />
                    </div>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Add custom styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MasterData;
