import React, { useState } from 'react';
import { Tabs, Tab, Card, CardBody, Button } from '@nextui-org/react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import QuantityUnitsTable from './components/QuantityUnitsTable';
import PackingUnitsTable from './components/PackingUnitsTable';
import userRequest from '../../utils/userRequest';
import PochuesTable from './components/PochuesTable';

const MasterData = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("quantity-units");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data for all tables
  const { data: quantityUnitsData, refetch: refetchQuantityUnits } = useQuery(
    'quantityUnits',
    async () => {
      const { data } = await userRequest.get("/quantity-units");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch quantity units');
      },
    }
  );

  const { data: packingUnitsData, refetch: refetchPackingUnits } = useQuery(
    'packingUnits',
    async () => {
      const { data } = await userRequest.get("/packing-units");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch packing units');
      },
    }
  );

  const { data: productsData, refetch: refetchProducts } = useQuery(
    'products',
    async () => {
      const { data } = await userRequest.get("/pochues");
      return data.data;
    },
    {
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to fetch products');
      },
    }
  );

  const handleTabChange = (key) => {
    setSelectedTab(key);
  };

  const refetchAll = () => {
    refetchQuantityUnits();
    refetchPackingUnits();
    refetchProducts();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Master Data Management</h1>
        <Button
          variant="flat"
          onPress={() => navigate('/Navigation')}
        >
          Dashboard
        </Button>
      </div>

      <Card className="w-full">
        <CardBody className="p-0">
          <Tabs
            aria-label="Master data tabs"
            selectedKey={selectedTab}
            onSelectionChange={handleTabChange}
            className="px-4 pt-2"
            variant="underlined"
          >
            <Tab key="quantity-units" title="Quantity Units">
              <div className="p-4">
                <QuantityUnitsTable
                  data={quantityUnitsData || []}
                  onRefresh={refetchAll}
                />
              </div>
            </Tab>
            <Tab key="packing-units" title="Packing Units">
              <div className="p-4">
                <PackingUnitsTable
                  data={packingUnitsData || []}
                  quantityUnits={quantityUnitsData || []}
                  onRefresh={refetchAll}
                />
              </div>
            </Tab>
            <Tab key="pochues" title="Pochues">
              <div className="p-4">
                <PochuesTable
                  data={productsData || []}
                  packingUnits={packingUnitsData || []}
                  onRefresh={refetchAll}
                />
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default MasterData;
