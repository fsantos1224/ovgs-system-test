import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { getCurrentUser } from './hooks/useAuth';
import { Login } from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const OVList = lazy(() => import('./pages/OVList').then(m => ({ default: m.OVList })));
const OVDetail = lazy(() => import('./pages/OVDetail').then(m => ({ default: m.OVDetail })));
const OVNew = lazy(() => import('./pages/OVNew').then(m => ({ default: m.OVNew })));
const Agendamento = lazy(() => import('./pages/Agendamento').then(m => ({ default: m.Agendamento })));
const Clientes = lazy(() => import('./pages/Clientes').then(m => ({ default: m.Clientes })));
const Transportes = lazy(() => import('./pages/Transportes').then(m => ({ default: m.Transportes })));
const Itens = lazy(() => import('./pages/Itens').then(m => ({ default: m.Itens })));
const Auditoria = lazy(() => import('./pages/Auditoria').then(m => ({ default: m.Auditoria })));
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const Loading = () => <div className="p-6 text-slate-500">Carregando...</div>;

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
          <Route path="ovs" element={<Suspense fallback={<Loading />}><OVList /></Suspense>} />
          <Route path="ovs/nova" element={<Suspense fallback={<Loading />}><OVNew /></Suspense>} />
          <Route path="ovs/:id" element={<Suspense fallback={<Loading />}><OVDetail /></Suspense>} />
          <Route path="agendamento" element={<Suspense fallback={<Loading />}><Agendamento /></Suspense>} />
          <Route path="cadastros/clientes" element={<Suspense fallback={<Loading />}><Clientes /></Suspense>} />
          <Route path="cadastros/transportes" element={<Suspense fallback={<Loading />}><Transportes /></Suspense>} />
          <Route path="cadastros/itens" element={<Suspense fallback={<Loading />}><Itens /></Suspense>} />
          <Route path="auditoria" element={<Suspense fallback={<Loading />}><Auditoria /></Suspense>} />
          <Route path="*" element={<Suspense fallback={<Loading />}><NotFound /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
