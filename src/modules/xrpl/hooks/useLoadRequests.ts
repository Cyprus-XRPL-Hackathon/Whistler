import { useCallback, useEffect, useState } from "react";
import { EsgRequest } from "../types/esg";

export const useLoadRequests = (): [
  EsgRequest[] | null,
  boolean,
  Error | null,
  () => void
] => {
  const [result, setResult] = useState<EsgRequest[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const request = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    setResult([]);
    

    setIsLoading(false);
  }, []);

  useEffect(() => {
    request();
  })

  return [result, isLoading, error, request];
};
