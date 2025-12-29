import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Button,
} from '@nextui-org/react';
import {
  FaFileInvoice,
  FaUniversity,
  FaMoneyBillWave,
  FaBook,
  FaBalanceScale,
  FaExchangeAlt,
  FaCoins,
  FaArrowLeft,
  FaPlus,
} from 'react-icons/fa';
import BankPaymentVoucher from './BankPaymentVoucher';
import BankPaymentVouchersList from './BankPaymentVouchersList';
import UpdateBankPaymentVoucher from './UpdateBankPaymentVoucher';
import CashPaymentVoucher from './CashPaymentVoucher';
import CashPaymentVouchersList from './CashPaymentVouchersList';
import UpdateCashPaymentVoucher from './UpdateCashPaymentVoucher';
import JournalPaymentVoucher from './JournalPaymentVoucher';
import JournalPaymentVouchersList from './JournalPaymentVouchersList';
import UpdateJournalPaymentVoucher from './UpdateJournalPaymentVoucher';
import OpeningBalanceVoucher from './OpeningBalanceVoucher';
import OpeningBalanceVouchersList from './OpeningBalanceVouchersList';
import UpdateOpeningBalanceVoucher from './UpdateOpeningBalanceVoucher';

const Vouchers = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('bank-payment');
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editVoucherId, setEditVoucherId] = useState(null);

  const voucherCategories = [
    {
      id: 'bank-payment',
      title: 'Bank Payment Voucher',
      icon: <FaUniversity />,
      description: 'Manage bank payment transactions',
      color: 'blue',
    },
    {
      id: 'cash-payment',
      title: 'Cash Payment Voucher',
      icon: <FaMoneyBillWave />,
      description: 'Handle cash payment vouchers',
      color: 'green',
    },
    {
      id: 'journal',
      title: 'Journal Payment Vouchers',
      icon: <FaBook />,
      description: 'Create and manage journal entries',
      color: 'purple',
    },
    {
      id: 'opening-balance',
      title: 'Opening Balance Vouchers',
      icon: <FaBalanceScale />,
      description: 'Set opening balances for accounts',
      color: 'orange',
    },
    {
      id: 'reconcile-bank',
      title: 'Reconcile Bank Accounts Voucher',
      icon: <FaExchangeAlt />,
      description: 'Reconcile bank account statements',
      color: 'indigo',
    },
    {
      id: 'bank-transfer',
      title: 'Bank Account Transfer Vouchers',
      icon: <FaExchangeAlt />,
      description: 'Transfer funds between bank accounts',
      color: 'teal',
    },
    {
      id: 'saraf-entry',
      title: 'Saraf Entry Voucher',
      icon: <FaCoins />,
      description: 'Manage saraf (currency exchange) entries',
      color: 'amber',
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        hover: 'hover:bg-blue-100',
        border: 'border-blue-200',
        active: 'bg-blue-100 border-blue-400',
        text: 'text-blue-700',
        icon: 'text-blue-600',
      },
      green: {
        bg: 'bg-green-50',
        hover: 'hover:bg-green-100',
        border: 'border-green-200',
        active: 'bg-green-100 border-green-400',
        text: 'text-green-700',
        icon: 'text-green-600',
      },
      purple: {
        bg: 'bg-purple-50',
        hover: 'hover:bg-purple-100',
        border: 'border-purple-200',
        active: 'bg-purple-100 border-purple-400',
        text: 'text-purple-700',
        icon: 'text-purple-600',
      },
      orange: {
        bg: 'bg-orange-50',
        hover: 'hover:bg-orange-100',
        border: 'border-orange-200',
        active: 'bg-orange-100 border-orange-400',
        text: 'text-orange-700',
        icon: 'text-orange-600',
      },
      indigo: {
        bg: 'bg-indigo-50',
        hover: 'hover:bg-indigo-100',
        border: 'border-indigo-200',
        active: 'bg-indigo-100 border-indigo-400',
        text: 'text-indigo-700',
        icon: 'text-indigo-600',
      },
      teal: {
        bg: 'bg-teal-50',
        hover: 'hover:bg-teal-100',
        border: 'border-teal-200',
        active: 'bg-teal-100 border-teal-400',
        text: 'text-teal-700',
        icon: 'text-teal-600',
      },
      amber: {
        bg: 'bg-amber-50',
        hover: 'hover:bg-amber-100',
        border: 'border-amber-200',
        active: 'bg-amber-100 border-amber-400',
        text: 'text-amber-700',
        icon: 'text-amber-600',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const selectedCategoryData = voucherCategories.find(
    (cat) => cat.id === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Enhanced */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                className="text-white hover:bg-white/20"
                onPress={() => navigate('/Navigation')}
                startContent={<FaArrowLeft />}
              >
                Back
              </Button>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaFileInvoice className="text-white text-3xl" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Vouchers Management
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base mt-1">
                    Manage and create financial vouchers • Complete financial transaction tracking
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-xs font-medium">Quick Access</p>
                <p className="text-blue-100 text-xs">All Categories</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Enhanced */}
          <aside className="lg:w-96 w-full flex-shrink-0">
            <Card className="shadow-lg border-0 h-fit sticky top-6">
              <CardBody className="p-5">
                <div className="mb-5 pb-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FaFileInvoice className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Voucher Categories
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {voucherCategories.length} categories available
                      </p>
                    </div>
                  </div>
                </div>
                <nav className="space-y-2">
                  {voucherCategories.map((category) => {
                    const colors = getColorClasses(category.color);
                    const isActive = selectedCategory === category.id;
                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowForm(false);
                          setShowList(true);
                          setShowEdit(false);
                        }}
                        className={`w-full flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                          isActive
                            ? `${colors.active} ${colors.border} shadow-md transform scale-[1.02]`
                            : `${colors.bg} ${colors.border} ${colors.hover}`
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 mt-1 ${colors.icon} text-xl`}
                        >
                          {category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold text-sm ${
                              isActive ? colors.text : 'text-gray-700'
                            }`}
                          >
                            {category.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {category.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </CardBody>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {showEdit && selectedCategory === 'bank-payment' ? (
              <UpdateBankPaymentVoucher
                voucherId={editVoucherId}
                onBack={() => {
                  setShowEdit(false);
                  setShowList(true);
                  setEditVoucherId(null);
                }}
              />
            ) : showForm && selectedCategory === 'bank-payment' ? (
              <BankPaymentVoucher
                onBack={() => {
                  setShowForm(false);
                  setShowList(true);
                }}
              />
            ) : showList && selectedCategory === 'bank-payment' ? (
              <BankPaymentVouchersList
                onAddNew={() => {
                  setShowList(false);
                  setShowForm(true);
                }}
                onView={(voucher) => {
                  // View is handled in the list component modal
                }}
                onEdit={(voucherId) => {
                  setEditVoucherId(voucherId);
                  setShowList(false);
                  setShowEdit(true);
                }}
              />
            ) : showEdit && selectedCategory === 'cash-payment' ? (
              <UpdateCashPaymentVoucher
                voucherId={editVoucherId}
                onBack={() => {
                  setShowEdit(false);
                  setShowList(true);
                  setEditVoucherId(null);
                }}
              />
            ) : showForm && selectedCategory === 'cash-payment' ? (
              <CashPaymentVoucher
                onBack={() => {
                  setShowForm(false);
                  setShowList(true);
                }}
              />
            ) : showList && selectedCategory === 'cash-payment' ? (
              <CashPaymentVouchersList
                onAddNew={() => {
                  setShowList(false);
                  setShowForm(true);
                }}
                onView={(voucher) => {
                  // View is handled in the list component modal
                }}
                onEdit={(voucherId) => {
                  setEditVoucherId(voucherId);
                  setShowList(false);
                  setShowEdit(true);
                }}
              />
            ) : showEdit && selectedCategory === 'journal' ? (
              <UpdateJournalPaymentVoucher
                voucherId={editVoucherId}
                onBack={() => {
                  setShowEdit(false);
                  setShowList(true);
                  setEditVoucherId(null);
                }}
              />
            ) : showForm && selectedCategory === 'journal' ? (
              <JournalPaymentVoucher
                onBack={() => {
                  setShowForm(false);
                  setShowList(true);
                }}
              />
            ) : showList && selectedCategory === 'journal' ? (
              <JournalPaymentVouchersList
                onAddNew={() => {
                  setShowList(false);
                  setShowForm(true);
                }}
                onView={(voucher) => {
                  // View is handled in the list component modal
                }}
                onEdit={(voucherId) => {
                  setEditVoucherId(voucherId);
                  setShowList(false);
                  setShowEdit(true);
                }}
              />
            ) : showEdit && selectedCategory === 'opening-balance' ? (
              <UpdateOpeningBalanceVoucher
                voucherId={editVoucherId}
                onBack={() => {
                  setShowEdit(false);
                  setShowList(true);
                  setEditVoucherId(null);
                }}
              />
            ) : showForm && selectedCategory === 'opening-balance' ? (
              <OpeningBalanceVoucher
                onBack={() => {
                  setShowForm(false);
                  setShowList(true);
                }}
              />
            ) : showList && selectedCategory === 'opening-balance' ? (
              <OpeningBalanceVouchersList
                onAddNew={() => {
                  setShowList(false);
                  setShowForm(true);
                }}
                onView={(voucher) => {
                  // View is handled in the list component modal
                }}
                onEdit={(voucherId) => {
                  setEditVoucherId(voucherId);
                  setShowList(false);
                  setShowEdit(true);
                }}
              />
            ) : (
              <Card className="shadow-lg border-0 min-h-[600px]">
                <CardBody className="p-6">
                  {selectedCategoryData && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div
                        className={`flex items-center justify-center w-20 h-20 rounded-full mb-6 ${getColorClasses(selectedCategoryData.color).bg}`}
                      >
                        <div
                          className={`text-4xl ${getColorClasses(selectedCategoryData.color).icon}`}
                        >
                          {selectedCategoryData.icon}
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedCategoryData.title}
                      </h2>
                      <p className="text-gray-600 text-center mb-8 max-w-md">
                        {selectedCategoryData.description}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-8 w-full max-w-2xl">
                        <p className="text-center text-gray-500 mb-6">
                          Voucher management interface for{' '}
                          <span className="font-semibold text-gray-700">
                            {selectedCategoryData.title}
                          </span>
                          .
                        </p>
                        {selectedCategory === 'bank-payment' && (
                          <div className="flex justify-center">
                            <Button
                              color="primary"
                              size="lg"
                              startContent={<FaPlus />}
                              onPress={() => setShowForm(true)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600"
                            >
                              Create Bank Payment Voucher
                            </Button>
                          </div>
                        )}
                        {selectedCategory !== 'bank-payment' && (
                          <p className="text-center text-sm text-gray-400 mt-4">
                            This section can be expanded to include voucher lists,
                            forms, and management features.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Vouchers;

