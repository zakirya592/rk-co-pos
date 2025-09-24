import React, { useState } from "react";
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
  FaUniversity, // Add this import
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";

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
    to: "/user",
    icon: <FaUser />,
    title: "User",
    desc: "User profile",
    color: "pink",
  },
  {
    to: "/pos",
    icon: <FaShoppingCart />,
    title: "Sales",
    desc: "Customer Sale",
    color: "blue",
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
    to: "/Purchase",
    icon: <FaShoppingCart />, // You can choose a different icon if you prefer
    title: "Purchase",
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
];

const Navigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Top Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            RK <span className="text-blue-600">&</span> Co
          </h1>
          <div className="flex items-center gap-6">
            {/* <div className="flex items-center space-x-2 text-gray-600">
              <FaUserCircle className="text-2xl" />
              <span className="text-sm font-semibold">Admin</span>
            </div> */}
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
          {cardData.map(({ to, icon, title, desc, color }) => (
            <Link
              key={to}
              to={to}
              className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border transition-all duration-200 transform hover:-translate-y-1`}
            >
              <div
                className={`flex items-center justify-center h-12 w-12 rounded-full bg-${color}-100`}
              >
                {React.cloneElement(icon, {
                  className: `h-6 w-6 text-${color}-600`,
                })}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Navigation;
