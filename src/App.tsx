import { useState } from 'react';
import Dashboard from './components/Dashboard/Dashboard';
import UserManagement from './components/UserManagement/UserManagement';
import ContentService from './components/ContentService/ContentService';
import ProductManagement from './components/ProductManagement/ProductManagement';

type ActiveModule = 'dashboard' | 'user-management' | 'content-service' | 'product-management';

function App() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');

  const handleNavigate = (module: string) => {
    setActiveModule(module as ActiveModule);
  };

  return (
    <>
      {activeModule === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {activeModule === 'user-management' && <UserManagement onNavigate={handleNavigate} />}
      {activeModule === 'content-service' && <ContentService onNavigate={handleNavigate} />}
      {activeModule === 'product-management' && <ProductManagement onNavigate={handleNavigate} />}
    </>
  );
}

export default App;
