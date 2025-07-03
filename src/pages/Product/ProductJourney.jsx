import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Tooltip,
} from '@nextui-org/react';
import { FaSearch, FaEye } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';

const fetchProductJourney = async () => {
  const res = await userRequest.get("/productjourney");
  return res?.data || [];
};


const ProductJourney = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ['productjourney'],
    queryFn: fetchProductJourney
  });

  const filteredJourneys = journeys.filter(journey =>
    journey.product?.name?.toLowerCase()?.includes(searchTerm.toLowerCase())
    // ||
    // journey.fromLocation?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
    // journey.toLocation?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );


  return (
    <div className="p-2 sm:p-2 md:p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">
              Product Journeys
            </h1>
          </div>
          <p className="text-gray-600">Track product movement history</p>
        </div>
        <div className="flex">
          <Chip
            color="primary"
            variant="flat"
            className="text-base font-semibold px-3 py-4 mt-1"
            startContent={
              <span role="img" aria-label="count" className="mr-1">
                📦
              </span>
            }
          >
            {
              filteredJourneys.filter((journey) => journey.action === "updated")
                .length
            }{" "}
            Journeys
          </Chip>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardBody>
          <Input
            placeholder="Search journeys by Product Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<FaSearch className="text-gray-400" />}
            variant="bordered"
          />
        </CardBody>
      </Card>

      {/* Journeys Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner color="success" size="lg" />
        </div>
      ) : journeys.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg">No journeys found</p>
        </div>
      ) : filteredJourneys.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <div className="flex flex-col items-center gap-4">
            <FaSearch className="text-gray-400 text-4xl" />
            <p className="text-lg">No journeys found</p>
            <p className="text-gray-500">
              Try searching again with different keywords
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
          {filteredJourneys
            .filter((journey) => journey.action === "updated")
            .map((journey) => (
              <Card
                key={journey._id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardBody className="p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-semibold text-gray-800">
                          Product Name :
                        </h4>
                        <h3 className="text-lg">
                          {journey?.product?.name || "N/A"}
                        </h3>
                      </div>
                    </div>

                    <div>
                      <div className="flex flex-col sm:flex-row gap-2 justify-between">
                        <p className="text-gray-600">
                          <span className="text-lg font-semibold text-gray-800">
                            Date:
                          </span>{" "}
                          {new Date(journey.updatedAt).toLocaleDateString()}
                        </p>
                        <Chip
                          color={
                            journey.action === "created" ? "success" : "warning"
                          }
                          variant="flat"
                        >
                          {journey.action}
                        </Chip>
                      </div>
                      {/* Changes Section */}
                      {journey.changes && journey.changes.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Changes Made
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                            {journey.changes.map((change, index) => (
                              <Card
                                key={index}
                                className="bg-gradient-to-r from-gray-50 to-white"
                              >
                                <CardBody className="p-4">
                                  <div className="flex flex-col gap-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      <span className="text-gray-500">
                                        Field:
                                      </span>{" "}
                                      {change.field}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      {change.field
                                        .toLowerCase()
                                        .includes("image") ? (
                                        <div className="flex flex-row gap-2">
                                          <div className="flex items-center gap-2 ">
                                            <span className="text-gray-500 text-xs">
                                              Old:
                                            </span>
                                            {(change.oldValue && (
                                              <img
                                                src={change.oldValue}
                                                alt="Old Image"
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                              />
                                            )) || (
                                              <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                <span className="text-gray-300 text-xs">
                                                  Empty
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <span className="text-gray-500 my-auto">
                                            →
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-green-500 text-xs">
                                              New:
                                            </span>
                                            {(change.newValue && (
                                              <img
                                                src={change.newValue}
                                                alt="New Image"
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                              />
                                            )) || (
                                              <span className="text-gray-500 text-xs">
                                                N/A
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <>
                                          <Chip
                                            color="warning"
                                            variant="flat"
                                            className="text-xs"
                                          >
                                            Old: {change.oldValue || "N/A"}
                                          </Chip>
                                          <span className="text-gray-500">
                                            →
                                          </span>
                                          <Chip
                                            color="success"
                                            variant="flat"
                                            className="text-xs"
                                          >
                                            New: {change.newValue || "N/A"}
                                          </Chip>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-600">
                        {" "}
                        <span className="text-lg font-semibold text-gray-800">
                          Notes:
                        </span>{" "}
                        {journey.notes}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductJourney;