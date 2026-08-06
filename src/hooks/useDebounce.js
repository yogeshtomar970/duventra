import { useEffect, useState } from "react";

// Value ko `delay` ms tak "settle" hone deta hai — jab tak user type karta
// rehta hai, debounced value update nahi hoti. Isse search filter / API
// call har keystroke par nahi, sirf typing ruk jaane ke baad chalta hai.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}