import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search, UserPlus, Users } from "lucide-react";
import { api } from "../services/api";
import { Modal } from "../components/Modal";
import { Notice } from "../components/Notice";
import { PhoneInput } from "../components/PhoneInput";
import { formatPhone } from "../utils/phone";
import { tw } from "../components/tw";

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
    <div className={tw.modulePage}>
      <div className={tw.pageHeading}>
        <div>
          <span className={`${tw.eyebrow} ${tw.pageHeadingEyebrow}`}>RELACIONAMENTO</span>
          <h1 className={tw.pageTitle}>Clientes</h1>
          <p className={tw.pageDescription}>Uma base organizada deixa cada atendimento mais próximo.</p>
        </div>
        <button className={`${tw.button} ${tw.buttonPrimary} ${tw.fullMobileButton}`} onClick={() => openForm()}>
          <UserPlus size={17} /> Novo cliente
        </button>
      </div>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      <section className={`${tw.panel} ${tw.moduleSection}`}>
        <div className={tw.listToolbar}>
          <div className={tw.listCount}>
            <strong className={tw.listCountStrong}>{clients.length}</strong>{" "}
            {clients.length === 1
              ? "cliente cadastrado"
              : "clientes cadastrados"}
          </div>
          <label className={tw.searchField}>
            <Search size={17} />
            <input
              className={tw.searchInput}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome ou telefone"
              aria-label="Buscar clientes"
            />
          </label>
        </div>
        {error && (
          <p className={tw.warning} role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <div className={tw.emptyState}>Carregando clientes...</div>
        ) : filtered.length === 0 ? (
          <div className={tw.emptyState}>
            <span className={tw.emptySymbol}>
              <Users size={20} />
            </span>
            <strong className={tw.emptyTitle}>
              {query ? "Nenhum resultado encontrado" : "Sua base começa aqui"}
            </strong>
            <span className={tw.emptyDescription}>
              {query
                ? "Tente ajustar a busca."
                : "Cadastre o primeiro cliente para manter contatos e pedidos juntos."}
            </span>
            {!query && (
              <button className={tw.buttonText} onClick={() => openForm()}>
                Cadastrar cliente <ArrowUpRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className={tw.tableWrap}>
            <table className={tw.table}>
              <thead>
                <tr>
                  <th className={tw.th}>CLIENTE</th>
                  <th className={tw.th}>TELEFONE</th>
                  <th className={`${tw.th} ${tw.alignRight}`}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr className={tw.rowHover} key={client.id}>
                    <td data-label="Cliente">
                      <div className={tw.personCell}>
                        <span className={tw.personAvatar}>
                          {client.nome?.charAt(0)?.toUpperCase()}
                        </span>
                        <span className={tw.cellStrong}>{client.nome}</span>
                      </div>
                    </td>
                    <td data-label="Telefone" className={tw.td}>{formatPhone(client.telefone)}</td>
                    <td data-label="Ações" className={`${tw.td} ${tw.alignRight}`}>
                      <div className={tw.rowActions}>
                        <button
                          className={tw.tableAction}
                          onClick={() => openForm(client)}
                        >
                          Editar
                        </button>
                        <button
                          className={`${tw.tableAction} ${tw.dangerAction}`}
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
      </section>
      {modalOpen && (
        <Modal
          title={editing ? "Editar cliente" : "Novo cliente"}
          description="Mantenha as informações de contato atualizadas."
          onClose={() => setModalOpen(false)}
        >
          <form className={tw.modalForm} onSubmit={save}>
            <label className={tw.formLabel}>
              Nome completo
              <input
                autoFocus
                className={tw.input}
                name="nome"
                value={form.nome}
                onChange={(event) =>
                  setForm({ ...form, nome: event.target.value })
                }
                maxLength={120}
                required
              />
            </label>
            <label className={tw.formLabel}>
              Telefone
              <PhoneInput
                name="telefone"
                value={form.telefone}
                onValueChange={(telefone) => setForm({ ...form, telefone })}
                required
              />
            </label>
            <div className={tw.modalActions}>
              <button
                type="button"
                className={`${tw.button} ${tw.buttonSecondary}`}
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button className={`${tw.button} ${tw.buttonPrimary}`} disabled={busy}>
                {busy ? "Salvando..." : "Salvar cliente"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
