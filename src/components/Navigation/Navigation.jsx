import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBoxes,
  FaTags,
  FaChartBar,
  FaSignOutAlt,
  FaStore,
  FaShoppingCart,
  FaUsers,
  FaUser,
  FaMoneyBill,
  FaUserCircle,
  FaTruck,
  FaHistory,
  FaUniversity,
  FaDatabase,
  FaFileInvoice,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { Tooltip } from "@nextui-org/react";

const cardData = [
  {
    to: "/products",
    icon: <FaBoxes />,
    title: "Products",
    desc: "Manage products",
    color: "green",
  },
  {
    to: "/categories",
    icon: <FaTags />,
    title: "Categories",
    desc: "Product categories",
    color: "yellow",
  },
  {
    to: "/customers",
    icon: <FaUser />,
    title: "Customers",
    desc: "Manage customers",
    color: "violet",
  },
  {
    to: "/suppliers",
    icon: <FaUser />,
    title: "Suppliers",
    desc: "Manage suppliers",
    color: "orange",
  },
  {
    to: "/currencies",
    icon: <FaMoneyBill />,
    title: "Currencies",
    desc: "Currency settings",
    color: "indigo",
  },
  {
    to: "/master-data",
    icon: <FaDatabase />,
    title: "Master Data",
    desc: "Manage master data",
    color: "indigo",
    color: "teal",
  },
  {
    to: "/user",
    icon: <FaUser />,
    title: "User",
    desc: "User profile",
    color: "pink",
  },
  {
    to: "/sales",
    icon: <FaChartBar />,
    title: "Sales",
    desc: "Sales Management",
    color: "green",
  },
  {
    to: "/history",
    icon: <FaHistory />,
    title: "History",
    desc: "Sale History",
    color: "red",
  },
  {
    to: "/reports",
    icon: <FaChartBar />,
    title: "Reports",
    desc: "Sale Reports",
    color: "red",
  },
  {
    to: "/purchases",
    icon: <FaShoppingCart />,
    title: "Purchases",
    desc: "Manage purchases",
    color: "teal",
  },
  {
    to: "/warehouse",
    icon: <FaStore />,
    title: "Warehouse",
    desc: "Warehouse management",
    color: "cyan",
  },
  {
    to: "/shop",
    icon: <FaStore />,
    title: "Shop",
    desc: "Shop management",
    color: "lime",
  },
  {
    to: "/shipments",
    icon: <FaTruck />,
    title: "Shipments",
    desc: "Manage shipments",
    color: "amber",
  },
  {
    to: "/transporters",
    icon: <FaTruck />,
    title: "Transporters",
    desc: "Manage transporters",
    color: "green",
  },
  {
    to: "/expenses",
    icon: <FaMoneyBill />,
    title: "Expenses",
    desc: "Manage expenses",
    color: "rose",
  },
  {
    to: "/bank-accounts",
    icon: <FaUniversity />,
    title: "Bank Accounts",
    desc: "Manage bank accounts",
    color: "emerald",
  },
  {
    to: "/vouchers",
    icon: <FaFileInvoice />,
    title: "Vouchers",
    desc: "Manage vouchers",
    color: "sky",
  },
];

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Check if a menu item is allowed for the current user
  const isItemAllowed = (itemTo) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    // For regular users, only allow Sales, History, and User
    return ["/sales", "/history",].includes(itemTo);
  };

  // Show all items but mark unauthorized ones as disabled
  const getMenuItems = () => {
    return cardData.map((item) => ({
      ...item,
      disabled: !isItemAllowed(item.to),
    }));
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            RK <span className="text-blue-600">&</span> Co
          </h1>
          <div className="flex items-center gap-6">
            {user && (
              <Tooltip
                content={
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      {user?.role || "No role"}
                    </span>
                    <span>{user?.email || "No email"}</span>
                  </div>
                }
                placement="top"
              >
                <div className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                  <FaUserCircle className="text-2xl" />
                  <span className="text-sm font-semibold">
                    {user?.name || "User"}
                  </span>
                </div>
              </Tooltip>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md shadow"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto py-10 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map(({ to, icon, title, desc, color, disabled }) => (
            <div
              key={to}
              className={`relative ${
                disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:shadow-xl hover:-translate-y-1"
              }`}
            >
              <Link
                to={disabled ? "#" : to}
                className={`block bg-white p-6 rounded-2xl shadow-sm border transition-all duration-200 ${
                  disabled
                    ? "pointer-events-none"
                    : "hover:shadow-xl hover:-translate-y-1"
                }`}
                onClick={(e) => disabled && e.preventDefault()}
              >
                <div
                  className={`flex items-center justify-center h-12 w-12 rounded-full bg-${color}-100`}
                >
                  {React.cloneElement(icon, {
                    className: `h-6 w-6 text-${color}-600`,
                  })}
                </div>
                <h3
                  className={`mt-4 text-lg font-semibold ${
                    disabled ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {title}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    disabled ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {desc}
                </p>
              </Link>
              {disabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-black bg-opacity-60 text-white text-xs font-bold px-2 py-1 rounded">
                    Restricted
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Navigation;
