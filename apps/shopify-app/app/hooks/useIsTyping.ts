import { useEffect, useState } from "react";
import useDebounce from "./useDebounce";

export const useIsTyping = ({
  value,
  onTypingChange,
}: {
  value: string;
  onTypingChange?: (value: boolean) => void;
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const debouncedValue = useDebounce(value, 1000);

  useEffect(() => {
    onTypingChange?.(isTyping);
  }, [isTyping]);

  useEffect(() => {
    setIsTyping(false);
  }, [debouncedValue]);

  useEffect(() => {
    if (value.trim().length && !isTyping) {
      setIsTyping(true);
    } else if (!value.trim()) {
      setIsTyping(false);
    }
  }, [value]);

  return { isTyping, setIsTyping };
};
