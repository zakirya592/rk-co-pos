import React from "react";
import { Link } from "react-router-dom";
import { FaMoneyBill } from "react-icons/fa";

const expenseTypes = [
  {
    to: "/expenses/procurement",
    title: "Procurement Expense",
    desc: "Expenses for procurement",
    color: "blue",
  },
  // {
  //   to: "/expenses/distribution",
  //   title: "Distribution Expenses",
  //   desc: "Expenses for distribution",
  //   color: "green",
  // },
  {
    to: "/expenses/sales-distribution",
    title: "Sales Distribution Expenses",
    desc: "Commissions, marketing, promotions, discounts",
    color: "green",
  },
  {
    to: "/expenses/warehouse",
    title: "Warehouse Expenses",
    desc: "Expenses related to warehouse operations",
    color: "orange",
  },
  {
    to: "/expenses/operational",
    title: "Operational Expenses",
    desc: "Day-to-day operational expenses",
    color: "purple",
  },
  {
    to: "/expenses/miscellaneous",
    title: "Miscellaneous Expenses",
    desc: "Other uncategorized expenses",
    color: "gray",
  },
  {
    to: "/expenses/logistics",
    title: "Logistics Expenses",
    desc: "Transportation and logistics costs",
    color: "red",
  },
  {
    to: "/expenses/financial",
    title: "Financial Expenses",
    desc: "Bank charges, interest, and other financial costs",
    color: "teal",
  },
];


const ExpenseNavigation = () => (
  <div className=" mx-auto py-10 px-6">
    <h2 className="text-2xl font-bold mb-6">Expenses</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {expenseTypes.map(({ to, title, desc, color }) => (
        <Link
          key={to}
          to={to}
          className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border transition-all duration-200 transform hover:-translate-y-1`}
        >
          <div
            className={`flex items-center justify-center h-12 w-12 rounded-full bg-${color}-100`}
          >
            <FaMoneyBill className={`h-6 w-6 text-${color}-600`} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{desc}</p>
        </Link>
      ))}
    </div>
  </div>
);

export default ExpenseNavigation;
