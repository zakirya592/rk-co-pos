import React, { useState, useEffect } from "react";
import { Button, Card, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { FaEye, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  exportToExcel,
  exportToPdf,
  viewPdfInNewTab,
  exportTableToExcel,
  exportTableToPdf,
  viewTablePdfInNewTab,
} from "../../utils/exportUtils";
import userRequest from "../../utils/userRequest";
import SalesReport from "../../components/SalesReport";

const Reports = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    dateRange: [],
    category: "",
    status: "",
    search: "",
    minStock: 0,
    maxStock: 10000,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showProducts, setShowProducts] = useState(false);
  const [salesView, setSalesView] = useState(null);
  // Expenses state
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState("");
  const [expenses, setExpenses] = useState([]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await userRequest.get("/products", {
        params: {
          search: filters.search,
          page: currentPage,
          min_stock: filters.minStock,
          max_stock: filters.maxStock,
        },
      });
      setProducts(res.data.data || []);      
      setTotalPages(Math.ceil(res.data.results / 10));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (category, page = 1, search = "") => {
    if (!category) return;
    try {
      setLoading(true);
      const res = await userRequest.get(`/expenses/${category}`, {
        params: { page },
      });
      console.log(res);
      // Normalize various API shapes into a simple array
      const d = res.data || {};
      let items = [];
      let pages = d.pages || d.totalPages || 1;
      if (Array.isArray(d?.data)) {
        items = d.data;
      } else if (Array.isArray(d?.data?.expenses)) {
        items = d.data.expenses;
        pages = d.pages || d.data.pages || pages;
      } else if (Array.isArray(d?.expenses)) {
        items = d.expenses;
      } else {
        items = [];
      }
      setExpenses(items);
      setTotalPages(pages || 1);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filters.search, filters.minStock, filters.maxStock]);

  const handleExport = (type) => {
    const data = products.map((product) => ({
      name: product.name,
      category: product.category?.name || "-",
      countInStock: product.countInStock,
      price: product.price,
      availableQuantity: product.availableQuantity,
      soldOutQuantity: product.soldOutQuantity,
      saleRate: product.saleRate,
    }));

    const searchValue = filters.search || "ALL";
    
    if (type === "excel") {
      exportToExcel(data, "projects_report", searchValue);
    } else if (type === "pdf") {
      const doc = exportToPdf(data, "projects_report", searchValue);
      doc.save(`projects_report_${searchValue}.pdf`);
    } else if (type === "view") {
      viewPdfInNewTab(data, "projects_report", searchValue);
    }
  };

  const handleExpenseExport = (type) => {
    // Match the visible table columns: Type, Description, Amount, Payment, Date
    const headers = ["Type", "Description", "Amount", "Payment", "Date"];
    const rows = expenses.map((e) => {
      const typeText = e.expenseSubType || e.expenseType || '-';
      const desc = e.description || e.notes || e.warehouse?.name || e.salesperson?.name || e.route || e.purchaseOrderNo || '-';
      const amountText = `${e.currency?.symbol || ''} ${(Number(e.totalCost || 0)).toLocaleString()}${e.amountInPKR ? ` | PKR ${(Number(e.amountInPKR)).toLocaleString()}` : ''}`;
      const payment = e.paymentMethod || '-';
      const dateValue = e.createdAt || e.dueDate || e.expensePeriod?.startDate || e.departureDate || e.salesPeriod?.startDate || null;
      const dateText = dateValue ? new Date(dateValue).toLocaleDateString() : '-';
      return [typeText, desc, amountText, payment, dateText];
    });

    const title = `Expenses Report — ${selectedExpenseCategory ? selectedExpenseCategory.replace('-', ' ') : ''}`.trim();
    const filename = `expenses_report_${selectedExpenseCategory || 'all'}`;

    if (type === 'excel') {
      exportTableToExcel(headers, rows, filename, 'Expenses');
    } else if (type === 'pdf') {
      const doc = exportTableToPdf(headers, rows, title);
      doc.save(`${filename}.pdf`);
    } else if (type === 'view') {
      viewTablePdfInNewTab(headers, rows, title);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-[300px] bg-white p-5 border-r border-gray-200 h-full overflow-y-scroll">
        <div className="mb-5 pb-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Reports</h2>
            <Button
              variant="flat"
              size="sm"
              onPress={() => navigate('/Navigation')}
            >
              Dashboard
            </Button>
          </div>
        </div>
        <div className="mt-5">
          <Input
            placeholder="Search Report..."
            onValueChange={(value) => handleFilterChange("search", value)}
          />
        </div>

        <div className="mt-5">
          <h5>Stock Report</h5>
          <div className="grid grid-cols-1 gap-2 ms-10 mt-3">
            <Button
              variant="flat"
              color="primary"
              size="sm"
              onPress={() => {
                setShowProducts(true);
                setSalesView(null);
                setSelectedExpenseCategory("");
                fetchProducts();
              }}
            >
              Stock (Product)
            </Button>
          </div>
        </div>
        <div className="mt-5">
          <h5>Sales</h5>
          <div className="grid grid-cols-1 gap-2 ms-10 mt-3">
            <Button
              variant="flat"
              color="primary"
              size="sm"
              onClick={() => {
                setShowProducts(false);
                setSalesView("month");
                setSelectedExpenseCategory("");
              }}
            >
              Sales 
            </Button>
          </div>
        </div>
        <div className="mt-5">
          <h5>Expenses</h5>
          <div className="grid grid-cols-1 gap-2 ms-10 mt-3">
            {[
              { key: "procurement", label: "Procurement" },
              { key: "sales-distribution", label: "Sales & Dist." },
              { key: "warehouse", label: "Warehouse" },
              { key: "operational", label: "Operational" },
              { key: "miscellaneous", label: "Miscellaneous" },
              { key: "logistics", label: "Logistics" },
              { key: "financial", label: "Financial" },
            ].map((cat) => (
              <Button
                key={cat.key}
                size="sm"
                variant={selectedExpenseCategory === cat.key ? "solid" : "flat"}
                color="primary"
                onPress={() => {
                  setShowProducts(false);
                  setSalesView(null);
                  setSelectedExpenseCategory(cat.key);
                  setCurrentPage(1);
                  fetchExpenses(cat.key, 1, filters.search);
                }}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 bg-gray-100 h-full overflow-y-scroll">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-700">
            {showProducts
              ? "Stock Report"
              : salesView
              ? ""
              : selectedExpenseCategory
              ? `Expenses Report — ${selectedExpenseCategory.replace("-", " ")}`
              : "Reports"}
          </h1>
          <div className="flex gap-3">
            {showProducts && (
              <>
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<FaEye />}
                  onPress={() => handleExport("view")}
                >
                  View
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<FaFileExcel />}
                  onPress={() => handleExport("excel")}
                >
                  Excel
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<FaFilePdf />}
                  onPress={() => handleExport("pdf")}
                >
                  PDF
                </Button>
              </>
            )}
            {selectedExpenseCategory && !salesView && !showProducts && (
              <>
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<FaEye />}
                  onPress={() => handleExpenseExport("view")}
                >
                  View
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<FaFileExcel />}
                  onPress={() => handleExpenseExport("excel")}
                >
                  Excel
                </Button>
                <Button
                  variant="flat"
                  color="primary"
                  startContent={<FaFilePdf />}
                  onPress={() => handleExpenseExport("pdf")}
                >
                  PDF
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded shadow-sm">
          {showProducts ? (
            <>
              <Card className="bg-white p-5 rounded mb-5 shadow-sm">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block mb-1 text-sm text-gray-600">
                      Search
                    </label>
                    <Input
                      placeholder="Search projects..."
                      onValueChange={(value) =>
                        handleFilterChange("search", value)
                      }
                    />
                  </div>
                </div>
              </Card>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <>
                  <Table aria-label="Products Report" className="min-w-full">
                    <TableHeader>
                      <TableColumn>Product Name</TableColumn>
                      <TableColumn>Category</TableColumn>
                      <TableColumn>Quantity</TableColumn>
                      <TableColumn>Price</TableColumn>
                      <TableColumn>Sale Rate</TableColumn>
                      <TableColumn>Available Quantity</TableColumn>
                      <TableColumn>Additional Unit</TableColumn>
                      <TableColumn>Packing Unit</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category?.name || "-"}</TableCell>
                          <TableCell>{product.countInStock}</TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell>{product.saleRate}</TableCell>
                          <TableCell>{product.availableQuantity}</TableCell>
                          <TableCell>{product.additionalUnit}</TableCell>
                          <TableCell>{product.packingUnit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {totalPages > 1 && (
                    <div className="mt-4 flex justify-center">
                      <Button.Group>
                        <Button
                          variant="flat"
                          color="default"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="flat"
                          color="default"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          Next
                        </Button>
                      </Button.Group>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {salesView ? (
                <SalesReport />
              ) : selectedExpenseCategory ? (
                <>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <>
                      <Table
                        aria-label="Expenses Report"
                        className="min-w-full"
                      >
                        <TableHeader>
                          <TableColumn>Type</TableColumn>
                          <TableColumn>Description</TableColumn>
                          <TableColumn>Amount</TableColumn>
                          <TableColumn>Payment</TableColumn>
                          <TableColumn>Date</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {expenses.map((e) => (
                            <TableRow key={e._id || e.id}>
                              <TableCell>
                                {e.expenseSubType || e.expenseType || "-"}
                              </TableCell>
                              <TableCell>
                                {e.description ||
                                  e.notes ||
                                  e.warehouse?.name ||
                                  e.salesperson?.name ||
                                  e.route ||
                                  e.purchaseOrderNo ||
                                  "-"}
                              </TableCell>
                              <TableCell>
                                {e.currency?.symbol || ""}{" "}
                                {Number(e.totalCost || 0).toLocaleString()}
                                <div className="text-xs text-gray-500">
                                  PKR{" "}
                                  {Number(e.amountInPKR || 0).toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell>{e.paymentMethod || "-"}</TableCell>
                              <TableCell>
                                {e.createdAt
                                  ? new Date(e.createdAt).toLocaleDateString()
                                  : e.dueDate
                                  ? new Date(e.dueDate).toLocaleDateString()
                                  : e.expensePeriod?.startDate
                                  ? new Date(
                                      e.expensePeriod.startDate
                                    ).toLocaleDateString()
                                  : e.departureDate
                                  ? new Date(
                                      e.departureDate
                                    ).toLocaleDateString()
                                  : e.salesPeriod?.startDate
                                  ? new Date(
                                      e.salesPeriod.startDate
                                    ).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                          <Button.Group>
                            <Button
                              variant="flat"
                              color="default"
                              disabled={currentPage === 1}
                              onClick={() => {
                                const page = Math.max(1, currentPage - 1);
                                setCurrentPage(page);
                                fetchExpenses(
                                  selectedExpenseCategory,
                                  page,
                                  filters.search
                                );
                              }}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="flat"
                              color="default"
                              disabled={currentPage === totalPages}
                              onClick={() => {
                                const page = Math.min(
                                  totalPages,
                                  currentPage + 1
                                );
                                setCurrentPage(page);
                                fetchExpenses(
                                  selectedExpenseCategory,
                                  page,
                                  filters.search
                                );
                              }}
                            >
                              Next
                            </Button>
                          </Button.Group>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Select a report to view</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

