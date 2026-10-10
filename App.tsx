import { useHashRoute } from '@/lib/useHashRoute';
import { CustomerMenu } from '@/pages/CustomerMenu';
import { KitchenDashboard } from '@/pages/KitchenDashboard';
import { OwnerDashboard } from '@/pages/OwnerDashboard';

function App() {
  const { route } = useHashRoute();

  if (route === '/kitchen') {
    return <KitchenDashboard />;
  }
  if (route === '/admin') {
    return <OwnerDashboard />;
  }
  return <CustomerMenu />;
}

export default App;
