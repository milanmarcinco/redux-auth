import { useEffect, useRef } from "react";

const useClickOutside = <T extends HTMLElement>(action: any) => {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const handler = (e: any) => {
      if (!elementRef.current) return;

      if (!elementRef.current.contains(e.target)) {
        action();
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [action]);

  return elementRef;
};

export default useClickOutside;
