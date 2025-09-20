import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Button,
  Chip,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Badge,
} from '@nextui-org/react';
import { FaArrowLeft, FaEdit, FaTruck, FaRoute, FaFileInvoiceDollar } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';
import toast from 'react-hot-toast';

const TransporterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transporter, setTransporter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchTransporter = async () => {
      try {
        const response = await userRequest.get(`/transporters/${id}`);
        setTransporter(response.data.data);
      } catch (error) {
        console.error('Error fetching transporter:', error);
        toast.error('Failed to load transporter details');
        navigate('/transporters');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransporter();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!transporter) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-gray-600">Transporter not found</h2>
          <Button
            color="primary"
            variant="light"
            className="mt-4"
            onPress={() => navigate('/transporters')}
          >
            Back to Transporters
          </Button>
        </div>
      </div>
    );
  }

  const renderRatingStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <span
        key={index}
        className={`text-2xl ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => navigate('/transporters')}
            className="mr-2"
          >
            <FaArrowLeft />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{transporter.name}</h1>
            <div className="flex items-center mt-1">
              <Chip
                color={transporter.isActive ? 'success' : 'danger'}
                variant="flat"
                size="sm"
                className="mr-2"
              >
                {transporter.isActive ? 'Active' : 'Inactive'}
              </Chip>
              <div className="flex">
                {renderRatingStars(transporter.rating || 0)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            color="primary"
            variant="light"
            startContent={<FaEdit />}
            onPress={() => navigate(`/update-transporter/${transporter._id}`)}
          >
            Edit
          </Button>
        </div>
      </div>

      <Tabs 
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        aria-label="Transporter details tabs"
        className="mb-4"
      >
        <Tab key="details" title="Details" icon={<FaTruck />} />
        <Tab key="routes" title="Routes" icon={<FaRoute />} />
        {/* <Tab key="documents" title="Documents" icon={<FaFileInvoiceDollar />} /> */}
      </Tabs>

      <div className="mt-4">
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader className="font-semibold text-lg">Contact Information</CardHeader>
              <Divider />
              <CardBody className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-medium">{transporter.contactPerson || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{transporter.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{transporter.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Terms</p>
                    <p className="font-medium capitalize">
                      {transporter.paymentTerms?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {transporter.address || 'N/A'}
                    {transporter.city && `, ${transporter.city}`}
                    {transporter.country && `, ${transporter.country}`}
                  </p>
                </div>
              </CardBody>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader className="font-semibold">Vehicle Types</CardHeader>
                <Divider />
                <CardBody className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {transporter.vehicleTypes?.length > 0 ? (
                      transporter.vehicleTypes.map((type, index) => (
                        <Chip key={index} color="primary" variant="flat">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Chip>
                      ))
                    ) : (
                      <p className="text-gray-500">No vehicle types specified</p>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader className="font-semibold">Commission & Rating</CardHeader>
                <Divider />
                <CardBody className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Commission Rate</p>
                    <p className="text-2xl font-bold">
                      {transporter.commissionRate || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Rating</p>
                    <div className="flex items-center">
                      <div className="mr-2">
                        {renderRatingStars(transporter.rating || 0)}
                      </div>
                      <span className="text-gray-600">
                        {transporter.rating ? `${transporter.rating.toFixed(1)}/5` : 'Not rated'}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'routes' && (
          <Card>
            <CardHeader className="font-semibold">Routes</CardHeader>
            <Divider />
            <CardBody className="p-0">
              {transporter.routes?.length > 0 ? (
                <Table aria-label="Transporter routes">
                  <TableHeader>
                    <TableColumn>ORIGIN</TableColumn>
                    <TableColumn>DESTINATION</TableColumn>
                    <TableColumn>ESTIMATED DAYS</TableColumn>
                    <TableColumn>RATE PER KG (PKR)</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {transporter.routes.map((route, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{route.origin}</TableCell>
                        <TableCell>{route.destination}</TableCell>
                        <TableCell>{route.estimatedDays} days</TableCell>
                        <TableCell>PKR {parseFloat(route.ratePerKg).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No routes defined for this transporter
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {activeTab === 'documents' && (
          <Card>
            <CardHeader className="font-semibold">Documents & Agreements</CardHeader>
            <Divider />
            <CardBody className="p-6">
              <div className="text-center py-10 text-gray-500">
                <p className="text-lg mb-2">No documents uploaded yet</p>
                <p className="text-sm">Upload documents such as contracts, agreements, or licenses</p>
                <Button color="primary" variant="flat" className="mt-4">
                  Upload Document
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransporterDetails;
