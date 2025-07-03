import { createContext, useContext, useState } from "react";

const GeoContext = createContext();

export function GeoProvider({ children }) {
  const [canMatch, setCanMatch] = useState(false);

  return (
    <GeoContext.Provider value={{ canMatch, setCanMatch }}>
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  return useContext(GeoContext);
}
