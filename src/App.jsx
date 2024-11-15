import { Toaster } from '@/components/ui/toaster';

import { useMainContext } from '@/context/main-context';
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';

function App() {
  const { student } = useMainContext();

  if (!student) {
    return <Login />;
  }

  return (
    <>
      <Toaster />
      <Dashboard />
    </>
  );
}

export default App;
