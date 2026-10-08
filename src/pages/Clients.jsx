import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, UserPlus, Users } from "lucide-react";
import { api } from "../services/api";
import { Modal } from "../components/Modal";
import { Notice } from "../components/Notice";
import { PhoneInput } from "../components/PhoneInput";
import { formatPhone } from "../utils/phone";
import { Pagination } from "../components/Pagination";
const emptyClient = { nome: "", telefone: "" };

export function Clients() {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);
  const [page, setPage] = useState(1);

  async function refresh() {
    try {
      setClients(await api.clients());
      setError("");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api
      .clients()
      .then((rows) => {
        if (active) setClients(rows);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      clients.filter((client) =>
        `${client.nome} ${client.telefone}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [clients, query],
  );
  const pageRows = filtered.slice((page - 1) * 10, page * 10);

  function openForm(client = null) {
    setEditing(client);
    setModalOpen(true);
    setForm(
      client ? { nome: client.nome, telefone: client.telefone } : emptyClient,
    );
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    try {
      if (editing) await api.updateClient(editing.id, form);
      else await api.createClient(form);
      setModalOpen(false);
      setNotice({
        message: editing ? "Cliente atualizado." : "Cliente cadastrado.",
      });
      await refresh();
    } catch (cause) {
      setNotice({ type: "error", message: cause.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(client) {
    if (!window.confirm(`Excluir o cadastro de ${client.nome}?`)) return;
    try {
      await api.deleteClient(client.id);
      setNotice({ message: "Cliente removido." });
      await refresh();
    } catch (cause) {
      setNotice({ type: "error", message: cause.message });
    }
  }

  return (
    <div className="animate-[settle-in_0.35s_ease_both]">
      <div className="mb-[27px] flex items-end justify-between gap-6 max-[620px]:mb-5 max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-4">
        <div>
          <span
            className={`text-[10px] font-bold tracking-[1px] text-[#839087] mb-[9px] block`}
          >
            RELACIONAMENTO
          </span>
          <h1 className="m-0 font-display text-[27px] font-bold leading-tight text-[#27342b] max-[620px]:text-2xl">
            Clientes
          </h1>
          <p className="mb-0 mt-2 text-base text-muted">
            Uma base organizada deixa cada atendimento mais próximo.
          </p>
        </div>
        <button
          className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 bg-nexo text-white hover:bg-nexo-hover max-[620px]:w-full`}
          onClick={() => openForm()}
        >
          <UserPlus size={17} /> Novo cliente
        </button>
      </div>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      <section
        className={`min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white px-[18px] pb-[5px] max-[620px]:px-3`}
      >
        <div className="flex min-h-[67px] items-center justify-between gap-4 border-b border-[#edf0eb] max-[620px]:flex-col max-[620px]:items-start max-[620px]:py-[13px]">
          <div className="text-sm text-[#778178]">
            <strong className="font-display text-base font-bold text-[#334138]">
              {clients.length}
            </strong>{" "}
            {clients.length === 1
              ? "cliente cadastrado"
              : "clientes cadastrados"}
          </div>
          <label className="flex h-[35px] w-full max-w-[280px] items-center gap-2 rounded border border-[#e1e7de] bg-white px-[10px] text-[#8b958c] max-[620px]:max-w-full">
            <Search size={17} />
            <input
              className="min-w-0 w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-[#a1a9a1] focus-visible:outline-none"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1); }}
              placeholder="Buscar por nome ou telefone"
              aria-label="Buscar clientes"
            />
          </label>
        </div>
        {error && (
          <p
            className="mb-4 mt-[-11px] rounded border border-[#f0e3c3] bg-[#fcf7e9] px-3 py-2.5 text-sm text-[#8c672b]"
            role="alert"
          >
            {error}
          </p>
        )}
        {loading ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">
            Carregando clientes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">
            <span className="grid h-[39px] w-[39px] place-items-center rounded-full border border-[#e2eadc] bg-[#f5f8f2] text-[#607e5c]">
              <Users size={20} />
            </span>
            <strong className="mt-1 font-display text-base font-bold text-[#3e4d42]">
              {query ? "Nenhum resultado encontrado" : "Sua base começa aqui"}
            </strong>
            <span className="max-w-[310px] text-sm leading-relaxed text-[#8a948b]">
              {query
                ? "Tente ajustar a busca."
                : "Cadastre o primeiro cliente para manter contatos e pedidos juntos."}
            </span>
            {!query && (
              <button
                className="inline-flex items-center justify-center gap-1.5 border-0 bg-transparent p-[5px] text-base font-bold text-[#365b42] hover:text-[#70913f]"
                onClick={() => openForm()}
              >
                Cadastrar cliente <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="table-mobile-cards w-full border-collapse text-left whitespace-nowrap">
              <thead>
                <tr>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">
                    CLIENTE
                  </th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">
                    TELEFONE
                  </th>
                  <th
                    className={`h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92] text-right`}
                  >
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((client) => (
                  <tr className="border-b border-[#f0f2ee] [&:hover]:bg-[#fbfcfa]" key={client.id}>
                    <td data-label="Cliente">
                      <div className="pl-2 flex items-center gap-2.5">
                        <span className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded-full bg-[#ecf2e9] font-display text-xs font-bold text-[#46684c]">
                          {client.nome?.charAt(0)?.toUpperCase()}
                        </span>
                        <span className="font-bold text-[#3a473d]">
                          {client.nome}
                        </span>
                      </div>
                    </td>
                    <td
                      data-label="Telefone"
                      className="h-[57px] px-3 text-md text-[#707b72]"
                    >
                      {formatPhone(client.telefone)}
                    </td>
                    <td
                      data-label="Ações"
                      className={`h-[57px] px-3 text-md text-[#707b72] text-right`}
                    >
                      <div className="inline-flex items-center gap-[5px]">
                        <button
                          className="rounded-sm border-0 bg-transparent px-[7px] py-1.5 text-sm font-semibold text-[#55734d] hover:bg-[#eff5e9]"
                          onClick={() => openForm(client)}
                        >
                          Editar
                        </button>
                        <button
                          className={`rounded-sm border-0 bg-transparent px-[7px] py-1.5 text-sm font-semibold text-[#55734d] hover:bg-[#eff5e9] text-[#ae6257] hover:bg-[#fff0ec]`}
                          onClick={() => remove(client)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && <Pagination page={page} total={filtered.length} onPageChange={setPage} />}
      </section>
      {modalOpen && (
        <Modal
          title={editing ? "Editar cliente" : "Novo cliente"}
          description="Mantenha as informações de contato atualizadas."
          onClose={() => setModalOpen(false)}
        >
          <form className="grid gap-[15px]" onSubmit={save}>
            <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
              Nome completo
              <input
                autoFocus
                className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                name="nome"
                value={form.nome}
                onChange={(event) =>
                  setForm({ ...form, nome: event.target.value })
                }
                maxLength={120}
                required
              />
            </label>
            <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
              Telefone
              <PhoneInput
                name="telefone"
                value={form.telefone}
                onValueChange={(telefone) => setForm({ ...form, telefone })}
                required
              />
            </label>
            <div className="flex justify-between gap-2 pt-[7px]">
              <button
                type="button"
                className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 border-[#dce3da] bg-white text-[#34453a] hover:border-[#c8d3c5] hover:bg-[#f2f5ef]`}
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 bg-nexo text-white hover:bg-nexo-hover`}
                disabled={busy}
              >
                {busy ? "Salvando..." : "Salvar cliente"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
