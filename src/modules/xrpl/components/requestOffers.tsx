import { Offer, OfferStore, Token, useAccountStore } from "@nice-xrpl/react-xrpl";
import { issue } from "@uiw/react-md-editor";
import { Table } from "antd";
import { any } from "prop-types";
import { useEffect, useState } from "react";


export interface OfferInfo {
  number: number;
  amount: string; // Assuming amount is a number, change the type if it's different
  owner: string; // Change the type if the owner is not a string
}

export const RequestOffersPage: React.FC = () => {
  const [companyRequests, setCompanyRequests] = useState<OfferInfo[]>();
  const [offers, setOffer] = useState<OfferStore>();

  // Define columns
  const columns = [
    {
      title: "Number",
      dataIndex: "number",
      key: "nubmer",
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
    },
    {
      title: "Issue",
      dataIndex: "issue",
      key: "issue",
    },
    {
      title: "Flags",
      dataIndex: "flags",
      key: "flags",
    },
    {
      title: "URI",
      dataIndex: "uri",
      key: "uri",
    },
  ];

  const account = useAccountStore();
  useEffect(() => {
    if (!offers) {
      return;
    }

    let i = 0;
    const t: OfferInfo[] = []; // t is initialized here and can be used throughout the useEffect

    // Iterating over each key-value pair in the offerStore
    Object.entries(offers).forEach(([category, offers]) => {
      if (offers) { // Check if offers is not undefined
        console.log(`Category: ${category}`);
        offers.forEach(x => {
          i += 1;
          t.push({
            number: i,
            amount: x.amount,
            owner: x.owner
          });
        });
      }
    });
    setCompanyRequests(t);
}, [offers]);

  useEffect(() => {
    console.log(account);
    if (!account) {
      return;
    }
    console.log('Check sell offers from account: ', account.address)
    const t = account.buyOffers.getState();
    setOffer(t);
  }, [account]);
  return <Table dataSource={companyRequests} columns={columns} />;
};
