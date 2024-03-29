import React from "react";
import { useGetIdentity } from "@refinedev/core";

import { Row, Col, Card, Typography, Space } from "antd";

import { Account } from "@nice-xrpl/react-xrpl";
import { MakeRequest } from "../modules/xrpl/components/requests";
import { NftTokensPage } from "../modules/xrpl/components/nftTokens";
import { RequestOffersPage } from "../modules/xrpl/components/requestOffers";

const { Text } = Typography;

export const DashboardPage: React.FC = () => {
  const { data, isLoading } = useGetIdentity<{
    address: string;
    balance: string;
  }>();

  if (!data?.address) {
    return <></>;
  }

  return (
    <>
      <Row gutter={24}>
        <Col span={12}>
          <Card
            title="XRPL Address"
            style={{ height: "150px", borderRadius: "15px" }}
            headStyle={{ textAlign: "center" }}
          >
            <Space align="center" direction="horizontal">
              <Text>{isLoading ? "loading" : data?.address}</Text>
            </Space>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="Request"
            style={{ height: "150px", borderRadius: "15px" }}
            headStyle={{ textAlign: "center" }}
          >
            {data?.address && (
              <Account address={data?.address}>
                <MakeRequest />
              </Account>
            )}
          </Card>
        </Col>
      </Row>

      <Text>Your request</Text>
      <Row gutter={24}>
        {data?.address && (
          <Account address={data?.address}>
            <NftTokensPage />
          </Account>
        )}
      </Row>
      <Text>Pending offers (not implemented)</Text>
      {/* <Row gutter={24}>
        {data?.address && (
          // Hardcode for demo
          <Account address="rUNUhy8GLZAZmop2bykafBeWBa9DtX6u5U">
            <RequestOffersPage />
          </Account>
        )}
      </Row> */}
    </>
  );
};
