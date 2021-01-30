import React, { useContext, useMemo } from "react";
import { parseSchemaText } from "./Parser.js";

const SchemaContext = React.createContext();

export const SchemaProvider = ({ children, schemaText }) => {

  const schema = useMemo(
    () => parseSchemaText(schemaText),
    [schemaText]
  );

  return (
    <SchemaContext.Provider
      value={{
        schema
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
};

export const useSchema = () => {
  return useContext(SchemaContext);
};
