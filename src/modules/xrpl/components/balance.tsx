import { useBalance } from "@nice-xrpl/react-xrpl";
import {
  Typography,
} from "antd";

const { Text } = Typography;
export const Balance: React.FC = () => {
  const balance = useBalance();

  return (<Text>{balance}</Text>);
};
