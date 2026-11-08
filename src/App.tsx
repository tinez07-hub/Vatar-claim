import LoginPage from '@/pages/LoginPage';
import ClaimPage from '@/pages/ClaimPage';
import AdminPage from '@/pages/AdminPage';
import { usePathname } from '@/lib/navigation';

function App() {
  const pathname = usePathname();

  if (pathname === '/claim') return <ClaimPage />;
  if (pathname === '/admin') return <AdminPage />;
  return <LoginPage />;
}

export default App;
