import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { OVList } from './pages/OVList';
import { OVDetail } from './pages/OVDetail';
import { OVNew } from './pages/OVNew';
import { Agendamento } from './pages/Agendamento';
import { Clientes } from './pages/Clientes';
import { Transportes } from './pages/Transportes';
import { Itens } from './pages/Itens';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ordens-venda" element={<OVList />} />
          <Route path="/ordens-venda/nova" element={<OVNew />} />
          <Route path="/ordens-venda/:id" element={<OVDetail />} />
          <Route path="/agendamento" element={<Agendamento />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/transportes" element={<Transportes />} />
          <Route path="/itens" element={<Itens />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}