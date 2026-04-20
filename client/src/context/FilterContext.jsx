import { createContext, useContext, useState, useEffect } from "react";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [selectedYear, setSelectedYear]  = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove("light");
      document.body.style.backgroundColor = "#000000";
    } else {
      document.documentElement.classList.add("light");
      document.body.style.backgroundColor = "#f8fafc";
    }
  }, [darkMode]);

  return (
    <FilterContext.Provider
      value={{
        selectedYear,   setSelectedYear,
        selectedState,  setSelectedState,
        selectedRegion, setSelectedRegion,
        selectedZone,   setSelectedZone,
        darkMode,       setDarkMode,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export const useFilters = () => useContext(FilterContext);
