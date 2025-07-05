import React, { useState } from 'react';
import { Card, Button, Avatar, Divider } from '@nextui-org/react';
import {
  FaBoxes,
  FaTags,
  FaChartBar,
  FaHistory,
  FaSignOutAlt,
  FaBars,
  FaStore,
  FaShoppingCart,
  FaUsers,
  FaCog,
  FaUser,
  FaMoneyBill,
} from "react-icons/fa";
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ currentPage, onPageChange, isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "products", label: "Products", icon: FaBoxes },
    { id: "categories", label: "Categories", icon: FaTags },
    { id: "currencies", label: "Currencies", icon: FaMoneyBill },
    { id: "user", label: "User", icon: FaUser },
    { id: "pos", label: "Sales", icon: FaShoppingCart },
    { id: "customers", label: "Customers", icon: FaUsers },
    { id: "reports", label: "Reports", icon: FaChartBar },
    { id: "history", label: "History", icon: FaHistory },
    { id: "settings", label: "Settings", icon: FaCog },
  ];

  return (
    <Card
      className={`h-screen ${
        isCollapsed ? "w-16" : "w-64"
      } transition-all duration-300 rounded-none border-r`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <FaStore className="text-white text-xl" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">RK & Co</h2>
                  <p className="text-xs text-gray-500">POS System</p>
                </div>
              </div>
            )}
            <Button
              isIconOnly
              variant="light"
              onClick={onToggleCollapse}
              className="min-w-8 h-8"
            >
              <FaBars />
            </Button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar
                name={user?.role ? user.role.charAt(0).toUpperCase() : "R"}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-border text-2xl text-white"
              />
              <div className="flex-1">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="flex-1 p-2">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "solid" : "light"}
                className={`w-full justify-start ${
                  currentPage === item.id
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "px-2" : "px-4"}`}
                onClick={() => onPageChange(item.id)}
              >
                <item.icon
                  className={`${isCollapsed ? "text-xl" : "text-lg mr-3"}`}
                />
                {!isCollapsed && item.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-2 border-t">
          <Button
            variant="light"
            className={`w-full justify-start text-red-600 hover:bg-red-50 ${
              isCollapsed ? "px-2" : "px-4"
            }`}
            onClick={logout}
          >
            <FaSignOutAlt
              className={`${isCollapsed ? "text-xl" : "text-lg mr-3"}`}
            />
            {!isCollapsed && "Logout"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Sidebar;
