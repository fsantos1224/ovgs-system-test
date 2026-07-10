import { useState, useEffect } from 'react';
import type { Item } from '../domain/types';
import { Plus, Search, Eye } from 'lucide-react';
import { useItens, useCriarItem } from '../queries';
import { usePermissao } from '../hooks/usePermission';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemFormSchema } from '../schemas';
import type { ItemInput } from '../lib/validation';
import { FormField } from '../components/FormField';
import { Breadcrumbs } from '../components/Breadcrumbs';

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100);
}

export function Itens() {
  const { data: itens, isLoading } = useItens();
  const criarItem = useCriarItem();
  const podeCriar = usePermissao('itens:criar');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [consultando, setConsultando] = useState<Item | null>(null);
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemInput>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: { nome: '', sku: '', categoria: '', precoUnitario: 0, unidadeMedida: 'un', ativo: true },
  });

  const filtrados = (itens ?? []).filter((i) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return i.nome.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.categoria.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginados = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading)
    return (
      <p role="status" aria-live="polite" className="text-text-muted p-6">
        Carregando...
      </p>
    );

  const onSubmit = async (data: ItemInput) => {
    setErro('');
    try {
      await criarItem.mutateAsync(data as unknown as Record<string, unknown>);
      setMostrarForm(false);
      reset();
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4 md:pb-6">
        <div>
          <Breadcrumbs />
          <h1 className="text-2xl md:text-4xl font-serif italic tracking-tight text-text mt-1">Itens</h1>
          <p className="mt-1.5 text-xs text-text-muted tracking-wide font-medium">
            Consulte o catálogo de produtos comercializáveis.
          </p>
        </div>
        {podeCriar && (
          <button
            onClick={() => {
              setMostrarForm(true);
              setErro('');
            }}
            className="inline-flex items-center gap-2 border border-border-strong text-[10px] uppercase tracking-widest hover:bg-accent hover:text-on-accent hover:border-accent text-text font-bold px-5 py-3 transition-all focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Novo Item
          </button>
        )}
      </div>

      <Modal open={!!consultando} title={`Item: ${consultando?.nome ?? ''}`} onClose={() => setConsultando(null)}>
        {consultando && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">Nome</span>
                <p className="text-text font-medium">{consultando.nome}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">SKU</span>
                <p className="text-text font-mono">{consultando.sku}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Categoria
                </span>
                <p className="text-text font-medium">{consultando.categoria}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Preço Unitário
                </span>
                <p className="text-text font-mono font-bold text-accent">{formatCurrency(consultando.precoUnitario)}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest block mb-1">
                  Unidade
                </span>
                <p className="text-text font-mono">
                  {{ un: 'Unidade', kg: 'Quilograma', m: 'Metro', l: 'Litro' }[consultando.unidadeMedida] ??
                    consultando.unidadeMedida}
                </p>
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
        title="Novo Item"
        onClose={() => {
          setMostrarForm(false);
          setErro('');
        }}
      >
        <form key="new" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome" required error={errors.nome}>
              <input
                {...register('nome')}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
              />
            </FormField>
            <FormField label="SKU" required error={errors.sku}>
              <input
                {...register('sku')}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden font-mono"
              />
            </FormField>
            <FormField label="Categoria" required error={errors.categoria}>
              <input
                {...register('categoria')}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden"
              />
            </FormField>
            <FormField label="Preço Unitário" required error={errors.precoUnitario}>
              <input
                type="number"
                step="0.01"
                {...register('precoUnitario', { valueAsNumber: true })}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden font-mono"
              />
            </FormField>
            <FormField label="Unidade" required error={errors.unidadeMedida}>
              <select
                {...register('unidadeMedida')}
                className="w-full bg-input-bg border border-border text-text text-xs rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden cursor-pointer"
              >
                <option value="un">Unidade</option>
                <option value="kg">Quilograma</option>
                <option value="m">Metro</option>
                <option value="l">Litro</option>
              </select>
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
          </div>
          {erro && (
            <p role="alert" className="text-rose-400 text-xs">
              {erro}
            </p>
          )}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setMostrarForm(false);
                setErro('');
                reset();
              }}
              className="px-5 py-2.5 border border-border rounded-lg hover:bg-hover text-[10px] uppercase tracking-wider font-bold text-text-muted focus-visible:outline-2 focus-visible:outline-accent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-surface-elevated hover:bg-accent text-text hover:text-on-accent font-bold text-[11px] uppercase tracking-wider rounded-lg shadow-lg transition-all border border-border-strong focus-visible:outline-2 focus-visible:outline-accent"
            >
              Criar Item
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
          placeholder="Buscar itens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-input-bg border border-border text-text text-xs rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-accent focus:border-transparent outline-hidden placeholder:text-text-faint"
        />
      </div>

      {/* Desktop table */}
      <div
        role="region"
        aria-label="Lista de itens"
        className="bg-surface rounded-xl border border-border overflow-hidden shadow-2xl"
      >
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <caption className="sr-only">Lista de itens</caption>
            <thead>
              <tr className="bg-surface-elevated/20 border-b border-border text-[10px] font-bold text-text-faint uppercase tracking-widest">
                <th className="px-4 py-4 w-[24%]">Nome</th>
                <th className="px-4 py-4 w-[14%]">SKU</th>
                <th className="px-4 py-4 w-[16%]">Categoria</th>
                <th className="px-4 py-4 w-[16%]">Preço Unit.</th>
                <th className="px-4 py-4 w-[10%]">Unidade</th>
                <th className="px-4 py-4 w-[10%]">Ativo</th>
                <th className="px-4 py-4 w-[10%] text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {paginados.map((i) => (
                <tr key={i.id} className="hover:bg-hover transition-colors">
                  <td className="px-4 py-4 font-bold text-text text-sm truncate">{i.nome}</td>
                  <td className="px-4 py-4 text-text-muted font-mono font-medium truncate">{i.sku}</td>
                  <td className="px-4 py-4 text-text-subtle font-medium truncate">{i.categoria}</td>
                  <td className="px-4 py-4 font-bold text-accent font-mono truncate">
                    {formatCurrency(i.precoUnitario)}
                  </td>
                  <td className="px-4 py-4 font-mono text-text-muted font-medium">{i.unidadeMedida}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${i.ativo ? 'text-emerald-500' : 'text-text-faint'}`}
                    >
                      {i.ativo ? 'Disponível' : 'Indisponível'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() => setConsultando(i)}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-text-faint hover:text-accent hover:bg-accent/10 transition-colors focus-visible:outline-2 focus-visible:outline-accent"
                      title="Consultar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-subtle italic">
                    {debouncedSearch ? 'Nenhum resultado encontrado.' : 'Nenhum item cadastrado.'}
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
              {debouncedSearch ? 'Nenhum resultado encontrado.' : 'Nenhum item cadastrado.'}
            </div>
          ) : (
            paginados.map((i) => (
              <div key={i.id} className="p-4 space-y-3 hover:bg-hover transition-colors">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-text text-sm">{i.nome}</p>
                    <p className="text-text-muted font-mono text-xs mt-0.5">{i.sku}</p>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold uppercase tracking-wider ${i.ativo ? 'text-emerald-500' : 'text-text-faint'}`}
                  >
                    {i.ativo ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Categoria</span>
                    <p className="text-text-subtle mt-0.5">{i.categoria}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Preço</span>
                    <p className="font-bold text-accent font-mono mt-0.5">{formatCurrency(i.precoUnitario)}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-text-faint">Unidade</span>
                    <p className="text-text-muted font-mono mt-0.5">{i.unidadeMedida}</p>
                  </div>
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
