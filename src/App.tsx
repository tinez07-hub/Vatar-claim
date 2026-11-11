import LoginPage from '@/pages/LoginPage';
import ClaimPage from '@/pages/ClaimPage';
import AdminPage from '@/pages/AdminPage';
import VerifyPage from '@/pages/VerifyPage';
import { usePathname } from '@/lib/navigation';

function App() {
  const pathname = usePathname();

  if (pathname === '/claim') return <ClaimPage />;
  if (pathname === '/verify') return <VerifyPage />;
  if (pathname === '/admin') return <AdminPage />;
  return <LoginPage />;
}

export default App;
