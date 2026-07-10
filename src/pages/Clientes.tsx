import { useState, useEffect } from 'react';
import { Plus, Pencil, Search, Eye } from 'lucide-react';
import { useClientes, useCriarCliente, useAtualizarCliente } from '../queries';
import { usePermissao } from '../hooks/usePermission';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clienteFormSchema } from '../schemas';
import type { ClienteInput } from '../lib/validation';
import type { Cliente } from '../domain/types';
import { FormField } from '../components/FormField';
import { Breadcrumbs } from '../components/Breadcrumbs';

function formatDocumento(val: string): string {
  const d = val.replace(/\D/g, '');
  if (d.length <= 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
  return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').slice(0, 18);
}

function formatTelefone(val: string): string {
  const d = val.replace(/\D/g, '');
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').slice(0, 14);
  return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
}

export function Clientes() {
  const { data: clientes, isLoading } = useClientes();
  const criarCliente = useCriarCliente();
  const atualizarCliente = useAtualizarCliente();
  const podeCriar = usePermissao('clientes:criar');
  const podeEditar = usePermissao('clientes:editar');
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [consultando, setConsultando] = useState<Cliente | null>(null);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);
  const ordenados = (clientes ?? []).slice().reverse();
  const filtrados = ordenados.filter((c) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return c.nome.toLowerCase().includes(q) || c.documento.includes(q) || c.email.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginados = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ClienteInput>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: { nome: '', documento: '', email: '', telefone: '', endereco: '', ativo: true },
  });

  const { field: docField } = useController({ control, name: 'documento' });
  const { field: telField } = useController({ control, name: 'telefone' });

  if (isLoading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );

  const abrirForm = (cliente?: Cliente) => {
    setEditando(cliente ?? null);
    setErro('');
    reset(cliente ?? undefined);
    setMostrarForm(true);
  };

  const fecharForm = () => {
    setMostrarForm(false);
    setEditando(null);
    setErro('');
    reset();
  };

  const onSubmit = async (data: ClienteInput) => {
    setErro('');
    try {
      if (editando) {
        await atualizarCliente.mutateAsync({ id: editando.id, data });
      } else {
        await criarCliente.mutateAsync(data);
      }
      setEditando(null);
      setMostrarForm(false);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <Breadcrumbs />
          <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1">Clientes</h1>
          <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
            Cadastre, edite e consulte a base de clientes.
          </p>
        </div>
        {podeCriar && (
          <button
            onClick={() => abrirForm()}
            className="inline-flex items-center gap-2 border border-border-strong text-[10px] uppercase tracking-widest hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-5 py-3 transition-all focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Novo Cliente
          </button>
        )}
      </div>

      <Modal open={!!consultando} title={`Cliente: ${consultando?.nome ?? ''}`} onClose={() => setConsultando(null)}>
        {consultando && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">Nome</span>
                <p className="text-text font-medium">{consultando.nome}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Documento
                </span>
                <p className="text-text font-mono">{formatDocumento(consultando.documento)}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">Email</span>
                <p className="text-text font-medium">{consultando.email}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Telefone
                </span>
                <p className="text-text font-mono">{formatTelefone(consultando.telefone)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Endereço
                </span>
                <p className="text-text">{consultando.endereco || '—'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">Ativo</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${consultando.ativo ? 'text-emerald-500' : 'text-text-faint'}`}
                >
                  {consultando.ativo ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setConsultando(null)}
                className="px-5 py-2.5 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={mostrarForm}
        title={editando ? `Editar Cliente: ${editando.nome}` : 'Novo Cliente'}
        onClose={fecharForm}
      >
        <form key={editando?.id ?? 'new'} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome" required error={errors.nome}>
              <input
                {...register('nome')}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
              />
            </FormField>
            <FormField label="Documento" required error={errors.documento}>
              <input
                value={formatDocumento(docField.value)}
                onChange={(e) => {
                  docField.onChange(e.target.value.replace(/\D/g, ''));
                }}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
              />
            </FormField>
            <FormField label="Email" required error={errors.email}>
              <input
                type="email"
                {...register('email')}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
              />
            </FormField>
            <FormField label="Telefone" required error={errors.telefone}>
              <input
                value={formatTelefone(telField.value)}
                onChange={(e) => {
                  telField.onChange(e.target.value.replace(/\D/g, ''));
                }}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
              />
            </FormField>
          </div>
          <FormField label="Endereço" error={errors.endereco}>
            <input
              {...register('endereco')}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
            />
          </FormField>
          <FormField label="Ativo" error={errors.ativo}>
            <select
              {...register('ativo', { setValueAs: (v: string) => v === 'true' })}
              className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </FormField>
          {erro && (
            <p role="alert" className="text-rose-400 text-xs">
              {erro}
            </p>
          )}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={fecharForm}
              className="px-5 py-2.5 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-surface-elevated hover:bg-accent text-text hover:text-on-accent font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-lg transition-all border border-border-strong focus-visible:outline-2 focus-visible:outline-accent"
            >
              {editando ? 'Salvar Alterações' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Busca */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-input-bg border border-border text-text text-xs rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden placeholder:text-text-faint"
        />
      </div>

      {/* Desktop table */}
      <div
        role="region"
        aria-label="Lista de clientes"
        className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl"
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <caption className="sr-only">Lista de clientes</caption>
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-4 py-4 w-[28%]">Nome</th>
                <th className="px-4 py-4 w-[18%]">Documento</th>
                <th className="px-4 py-4 w-[22%]">Email</th>
                <th className="px-4 py-4 w-[16%]">Telefone</th>
                <th className="px-4 py-4 w-[8%]">Ativo</th>
                <th className="px-4 py-4 w-[10%] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {paginados.map((c) => (
                <tr key={c.id} className="hover:bg-hover transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-bold text-text text-sm truncate">{c.nome}</div>
                    {c.endereco && (
                      <div className="text-[11px] text-text-faint mt-0.5 truncate max-w-[200px]">{c.endereco}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-text-muted font-mono font-medium truncate">
                    {c.documento ? formatDocumento(c.documento) : '—'}
                  </td>
                  <td className="px-4 py-4 text-text-muted font-medium truncate">{c.email || '—'}</td>
                  <td className="px-4 py-4 text-text-subtle font-mono truncate">
                    {c.telefone ? formatTelefone(c.telefone) : '—'}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${c.ativo ? 'text-emerald-500' : 'text-text-faint'}`}
                    >
                      {c.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setConsultando(c)}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                        title="Consultar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {podeEditar && (
                        <button
                          onClick={() => abrirForm(c)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-subtle italic">
                    {debouncedSearch ? 'Nenhum resultado encontrado.' : 'Nenhum cliente cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border-subtle">
          {filtrados.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-subtle italic">
              {debouncedSearch ? 'Nenhum resultado encontrado.' : 'Nenhum cliente cadastrado.'}
            </div>
          ) : (
            paginados.map((c) => (
              <div key={c.id} className="p-4 space-y-3 hover:bg-hover transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text text-sm">{c.nome}</p>
                    {c.endereco && <p className="text-[11px] text-text-faint mt-0.5 truncate">{c.endereco}</p>}
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${c.ativo ? 'text-emerald-500' : 'text-text-faint'}`}
                  >
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Documento</span>
                    <p className="text-text-muted font-mono mt-0.5">
                      {c.documento ? formatDocumento(c.documento) : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Telefone</span>
                    <p className="text-text-subtle font-mono mt-0.5">{c.telefone ? formatTelefone(c.telefone) : '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Email</span>
                    <p className="text-text-muted mt-0.5 truncate">{c.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 pt-2 border-t border-border-subtle">
                  <button
                    onClick={() => setConsultando(c)}
                    className="inline-flex items-center justify-center min-w-[44px] h-11 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                    title="Consultar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {podeEditar && (
                    <button
                      onClick={() => abrirForm(c)}
                      className="inline-flex items-center justify-center min-w-[44px] h-11 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
