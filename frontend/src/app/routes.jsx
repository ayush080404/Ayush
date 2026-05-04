import Login from '../modules/auth/Login';

export default function Routes() {
  return <Login />;
}import DashboardEmployee from '../modules/dashboard/DashboardEmployee';
import DashboardManager from '../modules/dashboard/DashboardManager';
import DashboardAdmin from '../modules/dashboard/DashboardAdmin';
import { useSelector } from 'react-redux';

export default function Routes() {
  const role = useSelector(state => state.auth.user?.role);

  if (role === 'ADMIN') return <DashboardAdmin />;
  if (role === 'MANAGER') return <DashboardManager />;
  return <DashboardEmployee />;
}