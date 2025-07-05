import React, { useMemo, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@nextui-org/react";
import { FaSearch, FaEye } from "react-icons/fa";
import { useQuery } from "react-query";
import userRequest from "../../utils/userRequest";

const fetchProductJourney = async (searchTerm) => {
  const res = await userRequest.get("/productjourney", {
    params: {
      search: searchTerm,
    },
  });
  return res?.data || [];
};

const ProductJourney = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ["productjourney", searchTerm],
    queryFn: () => fetchProductJourney(searchTerm),
  });

  const groupedJourneys = useMemo(() => {
    if (!journeys) return {};
    return journeys.reduce((acc, journey) => {
      if (journey.action === "updated" && journey.product?._id) {
        if (!acc[journey.product._id]) {
          acc[journey.product._id] = [];
        }
        acc[journey.product._id].push(journey);
      }
      return acc;
    }, {});
  }, [journeys]);

  const filteredJourneys = useMemo(() => {
    const productMap = {};

    Object.values(groupedJourneys).forEach((journeyGroup) => {
      const latestJourney = journeyGroup[journeyGroup.length - 1];
      if (
        latestJourney.product?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        !searchTerm
      ) {
        productMap[latestJourney.product._id] = latestJourney;
      }
    });

    return Object.values(productMap);
  }, [searchTerm, groupedJourneys]);

  return (
    <>
      {/* Modal for Full Change History */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        hideCloseButton={false}
        backdrop="opaque"
        isDismissable={false}
        size="4xl"
        className="h-[90vh]"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold">Change History</h3>
            <p className="text-gray-600">
              {selectedProduct &&
                groupedJourneys[selectedProduct]?.[0]?.product?.name}
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 gap-4">
              {selectedProduct &&
                groupedJourneys[selectedProduct]?.map((journey, index) => (
                  <Card key={index}>
                    <CardBody>
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-600">
                            <span className="font-semibold text-gray-800">
                              Updated Date:
                            </span>{" "}
                            {new Date(journey.updatedAt).toLocaleDateString()}
                          </p>
                          <Chip
                            color={
                              journey.action === "updated"
                                ? "success"
                                : journey.action === "created"
                                ? "warning"
                                : journey.action === "deleted"
                                ? "danger"
                                : "default"
                            }
                            variant="flat"
                          >
                            {journey.action}
                          </Chip>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                          {journey.changes.map((change, changeIndex) => (
                            <Card
                              key={changeIndex}
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
                                        <div className="flex items-center gap-2">
                                          <span className="text-gray-500 text-xs">
                                            Old:
                                          </span>
                                          {change.oldValue ? (
                                            <img
                                              src={change.oldValue}
                                              alt="Old"
                                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                            />
                                          ) : (
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
                                          {change.newValue ? (
                                            <img
                                              src={change.newValue}
                                              alt="New"
                                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                            />
                                          ) : (
                                            <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                              <span className="text-gray-300 text-xs">
                                                Empty
                                              </span>
                                            </div>
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
                                        <span className="text-gray-500">→</span>
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
                    </CardBody>
                  </Card>
                ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Product Journeys</h1>
          <Chip
            color="primary"
            variant="flat"
            className="text-base font-semibold px-3 py-4 mt-1"
          >
            {filteredJourneys.length} Products
          </Chip>
        </div>

        <Card>
          <CardBody>
            <Input
              placeholder="Search by Product Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<FaSearch className="text-gray-400" />}
              variant="bordered"
            />
          </CardBody>
        </Card>

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
              <p className="text-lg">No journeys matched your search</p>
              <p className="text-gray-500">Try using different keywords</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJourneys.map((journey) => {
              const productId = journey.product._id;
              const journeyCount = groupedJourneys[productId]?.length || 0;

              return (
                <Card
                  key={productId}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardBody className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Product:
                          </h4>
                          <h3 className="text-lg">
                            {journey?.product?.name || "N/A"}
                          </h3>
                          <Chip
                            color="primary"
                            variant="flat"
                            className="text-sm"
                          >
                            {journeyCount} Changes
                          </Chip>
                        </div>
                        {journeyCount > 1 && (
                          <Button
                            variant="flat"
                            color="primary"
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                            onPress={() => {
                              setSelectedProduct(productId);
                              setIsModalOpen(true);
                            }}
                            startContent={<FaEye className="text-white" />}
                          >
                            View Changes
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-600">
                        {" "}
                        <span className="text-lg font-semibold text-gray-800">
                          Notes:
                        </span>{" "}
                        {journey.notes}
                      </p>

                      {journey?.changes && journey.changes.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 className="text-lg font-semibold text-gray-800">
                            Latest Change
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
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-500 text-xs">
                                              Old:
                                            </span>
                                            {change.oldValue ? (
                                              <img
                                                src={change.oldValue}
                                                alt="Old"
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                              />
                                            ) : (
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
                                            {change.newValue ? (
                                              <img
                                                src={change.newValue}
                                                alt="New"
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                              />
                                            ) : (
                                              <div className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                <span className="text-gray-300 text-xs">
                                                  Empty
                                                </span>
                                              </div>
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
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ProductJourney;
