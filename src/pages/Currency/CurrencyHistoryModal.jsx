import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Tooltip,
  Card,
  CardBody,
} from '@nextui-org/react';
import { useQuery } from 'react-query';
import { FaArrowDown, FaArrowUp, FaHistory, FaUser } from 'react-icons/fa';
import userRequest from '../../utils/userRequest';

const fetchCurrencyHistory = async (currencyId) => {
  const res = await userRequest.get(`/currencies/${currencyId}/exchange-history`);
  return res.data?.data || [];
};

const CurrencyHistoryModal = ({ isOpen, onClose, currency }) => {
  const {
    data: history = [],
    isLoading,
    isError,
  } = useQuery(
    ['currency-exchange-history', currency?._id],
    () => fetchCurrencyHistory(currency._id),
    {
      enabled: isOpen && !!currency?._id,
      retry: 1,
    }
  );

  const latestEntry = history[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      backdrop="blur"
      scrollBehavior="inside"
      className="max-h-[calc(100vh-2rem)]"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <FaHistory className="text-amber-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Exchange History
              </p>
              <h2 className="text-xl font-bold text-gray-800">
                {currency?.name}{' '}
                {currency?.code && (
                  <span className="text-sm font-medium text-gray-500">
                    ({currency.code})
                  </span>
                )}
              </h2>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          {/* Summary */}
          <Card className="mb-4 border border-gray-100 shadow-sm">
            <CardBody className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Current Rate</p>
                <p className="text-2xl font-semibold text-green-600">
                  {currency?.exchangeRate ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Changes</p>
                <p className="text-lg font-semibold text-gray-800">
                  {history.length}
                </p>
              </div>
              {latestEntry && (
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(latestEntry.effectiveDate).toLocaleString()}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* History Table */}
          <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="px-4 py-2 border-b bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaHistory className="text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">
                  Exchange Rate Timeline
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Most recent change at the top
              </span>
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              <Table
                removeWrapper
                aria-label="Currency exchange rate history table"
                className="min-w-[800px]"
              >
                <TableHeader>
                  <TableColumn>#</TableColumn>
                  <TableColumn>DATE &amp; TIME</TableColumn>
                  <TableColumn className="text-right">
                    PREVIOUS RATE
                  </TableColumn>
                  <TableColumn className="text-right">NEW RATE</TableColumn>
                  <TableColumn>CHANGE</TableColumn>
                  <TableColumn>UPDATED BY</TableColumn>
                  <TableColumn>NOTES</TableColumn>
                </TableHeader>
                <TableBody
                  items={history}
                  isLoading={isLoading}
                  loadingContent={
                    <div className="flex justify-center items-center py-8">
                      <Spinner color="success" size="lg" />
                    </div>
                  }
                  emptyContent={
                    <div className="text-center text-gray-500 py-8">
                      No exchange history available for this currency.
                    </div>
                  }
                >
                  {(item, index) => {
                    const diff =
                      Number(item.newRate ?? 0) - Number(item.previousRate ?? 0);
                    const isIncrease = diff > 0;
                    const isDecrease = diff < 0;

                    return (
                      <TableRow key={item._id || index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">
                              {new Date(item.effectiveDate).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(item.effectiveDate).toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-gray-600">
                          {item.previousRate}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold text-gray-900">
                          {item.newRate}
                        </TableCell>
                        <TableCell>
                          {diff === 0 ? (
                            <Chip
                              size="sm"
                              className="bg-gray-100 text-gray-600"
                              variant="flat"
                            >
                              No change
                            </Chip>
                          ) : (
                            <Chip
                              size="sm"
                              color={isIncrease ? 'success' : 'danger'}
                              variant="flat"
                              startContent={
                                isIncrease ? (
                                  <FaArrowUp className="text-xs" />
                                ) : (
                                  <FaArrowDown className="text-xs" />
                                )
                              }
                            >
                              {isIncrease ? '+' : ''}
                              {diff.toFixed(6)}
                            </Chip>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.user ? (
                            <Tooltip
                              content={item.user.email}
                              placement="top"
                            >
                              <div className="flex items-center gap-2">
                                <FaUser className="text-gray-400 text-xs" />
                                <span className="text-sm text-gray-800">
                                  {item.user.name}
                                </span>
                              </div>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-gray-400">
                              System
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <Tooltip
                            content={item.notes}
                            placement="left"
                            isDisabled={!item.notes}
                          >
                            <span className="text-sm text-gray-700 line-clamp-2">
                              {item.notes || '-'}
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  }}
                </TableBody>
              </Table>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CurrencyHistoryModal;


