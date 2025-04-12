import { useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

export const useLoading = <T>() => {
  const navigation = useNavigation();
  const [loadingSlug, setLoadingSlug] = useState<T>();
  const isLoading = navigation.state !== "idle";
  const isLoadingRef = useRef(isLoading);

  const checkIsLoading = (slug: T) => {
    return isLoading && loadingSlug === slug;
  };

  useEffect(() => {
    if (!isLoading && !!isLoadingRef.current) {
      setLoadingSlug(undefined);
    }
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  return {
    isLoading,
    setLoadingSlug,
    checkIsLoading,
  };
};
