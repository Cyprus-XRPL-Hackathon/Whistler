import { Token, useAccountStore } from "@nice-xrpl/react-xrpl";
import { issue } from "@uiw/react-md-editor";
import { Table } from "antd";
import { useEffect, useState } from "react";

export const NftTokensPage: React.FC = () => {
  const [companyRequests, setCompanyRequests] = useState<any>();
  const [tokens, setTokens] = useState<Token[]>();

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
    let i = 0;
    const dataS = tokens?.map((x) => {
      i += 1;
      return {
        number: i,
        id: x.id,
        owner: account.address,
        issue: x.issuer,
        flags: x.flags,
        uri: x.uri,
      };
    });
    setCompanyRequests(dataS);
  }, [tokens]);

  useEffect(() => {
    console.log(account);
    if (!account) {
      return;
    }
    const t = account.tokens.getState();
    setTokens(t);
  }, [account]);
  return <Table dataSource={companyRequests} columns={columns} />;
};
