import {createContext, useContext, useState, useEffect} from "react";

const FilterContext = createContext();

export const FilterProvider = ({children}) => {
    // const [filters, setFilters] = useState(null);
    const [filters, setFiltersState] = useState(null);

    useEffect(() => {
        const storedFilters = localStorage.getItem("filters");
        if (storedFilters) {
          setFiltersState(JSON.parse(storedFilters));
        }
      }, []);
    
      const setFilters = (newFilters) => {
        setFiltersState(newFilters);
        localStorage.setItem("filters", JSON.stringify(newFilters));
      };

    return (
        <FilterContext.Provider value = {{filters, setFilters}}>
            {children}
        </FilterContext.Provider>
    )
};

export const useFilters = () => useContext(FilterContext);