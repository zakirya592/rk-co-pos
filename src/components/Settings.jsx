
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Switch,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Divider
} from '@nextui-org/react';
import { FaSave, FaStore, FaUser, FaCog, FaPrint, FaShieldAlt } from 'react-icons/fa';

const Settings = () => {
  const [shopSettings, setShopSettings] = useState({
    shopName: 'RK & Co',
    address: 'Shop 123, Main Street, Lahore',
    contact: '+92-XXX-XXXXXXX',
    email: 'info@rkco.com',
    taxRate: 17,
    currency: 'PKR',
    receiptFooter: 'Thank you for your business!'
  });

  const [systemSettings, setSystemSettings] = useState({
    lowStockAlert: true,
    autoBackup: true,
    printReceipt: true,
    soundAlerts: true,
    darkMode: false,
    language: 'en'
  });

  const [userSettings, setUserSettings] = useState({
    username: 'admin',
    email: 'admin@rkco.com',
    role: 'admin',
    notifications: true
  });

  const handleSaveShopSettings = () => {
    console.log('Shop settings saved:', shopSettings);
    alert('Shop settings saved successfully!');
  };

  const handleSaveSystemSettings = () => {
    console.log('System settings saved:', systemSettings);
    alert('System settings saved successfully!');
  };

  const handleSaveUserSettings = () => {
    console.log('User settings saved:', userSettings);
    alert('User settings saved successfully!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600">Configure your POS system</p>
      </div>

      <Card>
        <CardBody>
          <Tabs>
            <Tab key="shop" title="Shop Settings">
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3 mb-6">
                  <FaStore className="text-2xl text-blue-500" />
                  <h3 className="text-xl font-semibold">Shop Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Shop Name"
                    value={shopSettings.shopName}
                    onChange={(e) => setShopSettings({...shopSettings, shopName: e.target.value})}
                    variant="bordered"
                  />

                  <Input
                    label="Contact Number"
                    value={shopSettings.contact}
                    onChange={(e) => setShopSettings({...shopSettings, contact: e.target.value})}
                    variant="bordered"
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={shopSettings.email}
                    onChange={(e) => setShopSettings({...shopSettings, email: e.target.value})}
                    variant="bordered"
                  />

                  <Select
                    label="Currency"
                    value={shopSettings.currency}
                    onChange={(e) => setShopSettings({...shopSettings, currency: e.target.value})}
                    variant="bordered"
                  >
                    <SelectItem key="PKR" value="PKR">PKR - Pakistani Rupee</SelectItem>
                    <SelectItem key="USD" value="USD">USD - US Dollar</SelectItem>
                    <SelectItem key="EUR" value="EUR">EUR - Euro</SelectItem>
                  </Select>

                  <Input
                    label="Default Tax Rate (%)"
                    type="number"
                    value={shopSettings.taxRate}
                    onChange={(e) => setShopSettings({...shopSettings, taxRate: parseFloat(e.target.value)})}
                    variant="bordered"
                  />
                </div>

                <Input
                  label="Shop Address"
                  value={shopSettings.address}
                  onChange={(e) => setShopSettings({...shopSettings, address: e.target.value})}
                  variant="bordered"
                  className="w-full"
                />

                <Input
                  label="Receipt Footer Message"
                  value={shopSettings.receiptFooter}
                  onChange={(e) => setShopSettings({...shopSettings, receiptFooter: e.target.value})}
                  variant="bordered"
                  className="w-full"
                />

                <Button
                  color="primary"
                  startContent={<FaSave />}
                  onClick={handleSaveShopSettings}
                  className="w-full md:w-auto"
                >
                  Save Shop Settings
                </Button>
              </div>
            </Tab>

            <Tab key="system" title="System Settings">
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3 mb-6">
                  <FaCog className="text-2xl text-green-500" />
                  <h3 className="text-xl font-semibold">System Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Low Stock Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified when products are running low</p>
                    </div>
                    <Switch
                      isSelected={systemSettings.lowStockAlert}
                      onValueChange={(value) => setSystemSettings({...systemSettings, lowStockAlert: value})}
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Auto Print Receipt</h4>
                      <p className="text-sm text-gray-600">Automatically print receipt after each sale</p>
                    </div>
                    <Switch
                      isSelected={systemSettings.printReceipt}
                      onValueChange={(value) => setSystemSettings({...systemSettings, printReceipt: value})}
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Sound Alerts</h4>
                      <p className="text-sm text-gray-600">Play sound for notifications and alerts</p>
                    </div>
                    <Switch
                      isSelected={systemSettings.soundAlerts}
                      onValueChange={(value) => setSystemSettings({...systemSettings, soundAlerts: value})}
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Auto Backup</h4>
                      <p className="text-sm text-gray-600">Automatically backup data daily</p>
                    </div>
                    <Switch
                      isSelected={systemSettings.autoBackup}
                      onValueChange={(value) => setSystemSettings({...systemSettings, autoBackup: value})}
                    />
                  </div>

                  <div className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Dark Mode</h4>
                      <p className="text-sm text-gray-600">Switch to dark theme</p>
                    </div>
                    <Switch
                      isSelected={systemSettings.darkMode}
                      onValueChange={(value) => setSystemSettings({...systemSettings, darkMode: value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Language"
                    value={systemSettings.language}
                    onChange={(e) => setSystemSettings({...systemSettings, language: e.target.value})}
                    variant="bordered"
                  >
                    <SelectItem key="en" value="en">English</SelectItem>
                    <SelectItem key="ur" value="ur">Urdu</SelectItem>
                  </Select>
                </div>

                <Button
                  color="success"
                  startContent={<FaSave />}
                  onClick={handleSaveSystemSettings}
                  className="w-full md:w-auto"
                >
                  Save System Settings
                </Button>
              </div>
            </Tab>

            <Tab key="user" title="User Settings">
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3 mb-6">
                  <FaUser className="text-2xl text-purple-500" />
                  <h3 className="text-xl font-semibold">User Account</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Username"
                    value={userSettings.username}
                    onChange={(e) => setUserSettings({...userSettings, username: e.target.value})}
                    variant="bordered"
                  />

                  <Input
                    label="Email"
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({...userSettings, email: e.target.value})}
                    variant="bordered"
                  />

                  <Select
                    label="Role"
                    value={userSettings.role}
                    onChange={(e) => setUserSettings({...userSettings, role: e.target.value})}
                    variant="bordered"
                    isDisabled
                  >
                    <SelectItem key="admin" value="admin">Administrator</SelectItem>
                    <SelectItem key="cashier" value="cashier">Cashier</SelectItem>
                    <SelectItem key="manager" value="manager">Manager</SelectItem>
                  </Select>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive email notifications for important events</p>
                  </div>
                  <Switch
                    isSelected={userSettings.notifications}
                    onValueChange={(value) => setUserSettings({...userSettings, notifications: value})}
                  />
                </div>

                <Divider />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FaShieldAlt />
                    Change Password
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Current Password"
                      type="password"
                      variant="bordered"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      variant="bordered"
                    />
                  </div>
                  <Button color="warning" variant="bordered">
                    Update Password
                  </Button>
                </div>

                <Button
                  color="primary"
                  startContent={<FaSave />}
                  onClick={handleSaveUserSettings}
                  className="w-full md:w-auto"
                >
                  Save User Settings
                </Button>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default Settings;
