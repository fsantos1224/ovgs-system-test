import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { getCurrentUser } from './stores/authStore';
import { ConfirmProvider } from './hooks/ConfirmContext';
import { Login } from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const OVList = lazy(() => import('./pages/OVList').then((m) => ({ default: m.OVList })));
const OVDetail = lazy(() => import('./pages/OVDetail').then((m) => ({ default: m.OVDetail })));
const OVNew = lazy(() => import('./pages/OVNew').then((m) => ({ default: m.OVNew })));
const Agendamento = lazy(() => import('./pages/Agendamento').then((m) => ({ default: m.Agendamento })));
const Clientes = lazy(() => import('./pages/Clientes').then((m) => ({ default: m.Clientes })));
const Transportes = lazy(() => import('./pages/Transportes').then((m) => ({ default: m.Transportes })));
const Itens = lazy(() => import('./pages/Itens').then((m) => ({ default: m.Itens })));
const Auditoria = lazy(() => import('./pages/Auditoria').then((m) => ({ default: m.Auditoria })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

const Loading = () => <div className="p-6 text-slate-500">Carregando...</div>;

function PrivateOutlet() {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <ConfirmProvider>
      <AppLayout />
    </ConfirmProvider>
  );
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <PrivateOutlet />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        ),
        handle: { crumb: () => 'Dashboard' },
      },
      {
        path: 'ovs',
        element: (
          <Suspense fallback={<Loading />}>
            <OVList />
          </Suspense>
        ),
        handle: { crumb: () => 'Ordens de Venda' },
      },
      {
        path: 'ovs/nova',
        element: (
          <Suspense fallback={<Loading />}>
            <OVNew />
          </Suspense>
        ),
        handle: { crumb: () => 'Nova' },
      },
      {
        path: 'ovs/:id',
        element: (
          <Suspense fallback={<Loading />}>
            <OVDetail />
          </Suspense>
        ),
        handle: { crumb: () => 'Detalhes' },
      },
      {
        path: 'agendamento',
        element: (
          <Suspense fallback={<Loading />}>
            <Agendamento />
          </Suspense>
        ),
        handle: { crumb: () => 'Agendamento' },
      },
      {
        path: 'cadastros/clientes',
        element: (
          <Suspense fallback={<Loading />}>
            <Clientes />
          </Suspense>
        ),
        handle: { crumb: () => 'Clientes' },
      },
      {
        path: 'cadastros/transportes',
        element: (
          <Suspense fallback={<Loading />}>
            <Transportes />
          </Suspense>
        ),
        handle: { crumb: () => 'Transportes' },
      },
      {
        path: 'cadastros/itens',
        element: (
          <Suspense fallback={<Loading />}>
            <Itens />
          </Suspense>
        ),
        handle: { crumb: () => 'Itens' },
      },
      {
        path: 'auditoria',
        element: (
          <Suspense fallback={<Loading />}>
            <Auditoria />
          </Suspense>
        ),
        handle: { crumb: () => 'Auditoria' },
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<Loading />}>
            <NotFound />
          </Suspense>
        ),
        handle: { crumb: () => '404' },
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
