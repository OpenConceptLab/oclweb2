import React from 'react';
export const OperationsContext = React.createContext('');
export const OperationsProvider = OperationsContext.Provider;
export const OperationsConsumer = OperationsContext.Consumer;

const LayoutContext = ({ subPages }) => {
  const [openOperations, setOpenOperations] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [operationItem, setOperationItem] = React.useState(null);
  const [parentResource, setParentResource] = React.useState(null);
  const [parentItem, setParentItem] = React.useState(null);
  const [toggles, setToggles] = React.useState({});
  return (
    <OperationsProvider
      value={{
        openOperations: openOperations,
        setOpenOperations: setOpenOperations,
        menuOpen: menuOpen,
        setMenuOpen: setMenuOpen,
        operationItem: operationItem,
        setOperationItem: setOperationItem,
        parentResource: parentResource,
        setParentResource: setParentResource,
        parentItem: parentItem,
        setParentItem: setParentItem,
        setToggles: setToggles,
        toggles: toggles
      }}>
      {subPages}
    </OperationsProvider>
  )
}
export default LayoutContext;
