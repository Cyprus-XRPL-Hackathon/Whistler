import React, { useState } from "react";
import { useGetIdentity } from "@refinedev/core";

import { useModal } from "@refinedev/antd";

import { Typography, Button, Modal, Form, Input } from "antd";
import { useMintToken } from "@nice-xrpl/react-xrpl";
import { xumm } from "../services/main-services";
import axios from "axios";
import {stringToHex} from "../../../utility/convert"

const { Text } = Typography;
export const MakeRequest: React.FC = () => {
  const { modalProps, show, close } = useModal();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // const [esgRequests] = useLoadRequests();
  const mintToken = useMintToken();
  const { data: authData, isLoading } = useGetIdentity<{
    address: string;
    balance: string;
  }>();

  // eslint-disable-next-line
  const handleModal = async (values: any) => {
    setLoading(true);

    async function uploadFile(): Promise<string | undefined> {

      if (values.message) {
        try {
          const data = new Blob([values.message], { type: 'text/plain' });

          // Create form data
          let formData = new FormData();
          formData.append('file', data);


          const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers: {
              // pinata_api_key: `4724f5bb7eb735fbba44`,
              Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0YTFkZTlmZC0zNWQ3LTQ1MDgtOGMzNy0yNzg1NDc4MmIwZGMiLCJlbWFpbCI6InBhbnR5dWtob3YucEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDcyNGY1YmI3ZWI3MzVmYmJhNDQiLCJzY29wZWRLZXlTZWNyZXQiOiI1Yjk4NzY5MjIzMWVlMzFiYTgzNmNlMmUxZjA2NTE3YWNhMWY0M2RiOTU5MTI3ZTMyYjU0MGQ2MTBjNjVkY2U5IiwiaWF0IjoxNzA1NjgxNjI2fQ.XeYtSdHawdp6l0NbSScFS-MXVO4THfSF74qwNNVSFGI`,
              'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            },
          });

          console.log(resFile);

          const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
          console.log(ImgHash);

          return ImgHash;
        } catch (error) {
          console.error("Error sending File to IPFS: ", error);
        }
      } else {
        console.error("No file provided");
      }
    }
    

    const hash = await uploadFile();

    const payload = await xumm.payload?.createAndSubscribe(
      {
        TransactionType: "NFTokenMint",
        Account: values.address,
        TransferFee: 314,
        NFTokenTaxon: 0,
        Flags: 8,
        Fee: "10",
        URI: stringToHex(hash || ''),
        Memos: [],
      },
      (event) => {
        if (event.payload.response.txid) {
          setLoading(false)
        }
        console.log(event);
      }
    );

    if (payload) {
      // setPayloadUuid(payload.created.uuid)

      if (xumm.runtime.xapp) {
        xumm.xapp?.openSignRequest(payload.created);
      } else {
        if (
          payload.created.pushed &&
          payload.created.next?.no_push_msg_received
        ) {
          // setOpenPayloadUrl(payload.created.next.no_push_msg_received)
        } else {
          window.open(payload.created.next.always);
        }
      }
    }

  };

  return (
    <>
      <Button
        style={{ maxWidth: 300, marginTop: 24 }}
        type="primary"
        size="large"
        onClick={() => show()}
      >
        Send Request
      </Button>
      <Modal
        {...modalProps}
        okText={"Send"}
        title={"Send Request to company"}
        onOk={form.submit}
        okButtonProps={{ loading: loading }}
      >
        <Form
          layout="vertical"
          onFinish={handleModal}
          form={form}
          initialValues={{ address: "rwietsevLFg8XSmG3bEZzFein1g8RBqWDZ" }}
        >
          <Form.Item name="address" label="Receiver Public Adress">
            <Input />
          </Form.Item>
          <Form.Item name="message" label="Report">
            <Input size={"large"} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};