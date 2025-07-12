import React, { useState, useEffect } from "react";
import { Button, Card, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { FaEye, FaFilePdf, FaFileExcel } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  exportToExcel,
  exportToPdf,
  viewPdfInNewTab,
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

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-[400px] bg-white p-5 border-r border-gray-200">
        <div className="mb-5 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Reports</h2>
        </div>
        <div className="mt-5">
          <Input
            placeholder="Search Report..."
            onValueChange={(value) => handleFilterChange("search", value)}
          />
        </div>

        <div className="mt-5">
          <h5>Stock Report</h5>
          <Button
            variant="flat"
            color="primary"
            onPress={() => {
              setShowProducts(true);
              fetchProducts();
            }}
            className="ms-10 mt-3"
          >
            Stock (Product)
          </Button>
        </div>
        <div className="mt-5">
          <h5>Sales</h5>
          <div className="flex flex-col">
            <Button
              variant="flat"
              color="primary"
              className="ms-10 mt-3 w-36"
              onClick={() => {
                setShowProducts(false);
                setSalesView('month');
              }}
            >
              Sales By Month
            </Button>
            <Button
              variant="flat"
              color="primary"
              className="ms-10 mt-3 w-36"
              onClick={() => {
                setShowProducts(false);
                setSalesView('year');
              }}
            >
              Sales By Year
            </Button>
            <Button
              variant="flat"
              color="primary"
              className="ms-10 mt-3  w-36"
              onClick={() => {
                setShowProducts(false);
                setSalesView('day');
              }}
            >
              Sales By Day
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 bg-gray-100">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-700">Stock Report</h1>
          <div className="flex gap-3">
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
          </div>
        </div>

        

        <div className="bg-white p-5 rounded shadow-sm">
          {showProducts ? (
            <>
            <Card className="bg-white p-5 rounded mb-5 shadow-sm">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm text-gray-600">Search</label>
              <Input
                placeholder="Search projects..."
                onValueChange={(value) => handleFilterChange("search", value)}
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
              ) : (
                showProducts ? (
                  <>
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
                       
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Click view report</p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
