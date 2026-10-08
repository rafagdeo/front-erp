import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CirclePlus,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { api } from "../services/api";
import { Modal } from "../components/Modal";
import { Notice } from "../components/Notice";
import { CurrencyInput } from "../components/CurrencyInput";
import { formatPhone } from "../utils/phone";
import { useAuth } from "../contexts/useAuth";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { Pagination } from "../components/Pagination";
import {
  apiDateTime,
  currency,
  dateLabel,
  localDateTimeValue,
} from "../utils/format";

const statuses = [
  { value: "atrasado", label: "Atrasado" },
  { value: "processando", label: "Em andamento" },
  { value: "pago", label: "Pago" },
  { value: "cancelado", label: "Cancelado" },
];

const statusClasses = {
  atrasado: "bg-[#fbece8] text-[#a95a4e]",
  processando: "bg-[#eaf0fa] text-[#4f6da5]",
  pago: "bg-[#e9f3e5] text-[#407249]",
  cancelado: "bg-[#fbece8] text-[#a95a4e]",
};

function installmentValues(total, count) {
  if (!Number.isInteger(Number(count)) || Number(count) < 1) return [];
  const cents = Math.max(0, Math.round(Number(total || 0) * 100));
  const base = Math.floor(cents / count);
  const remainder = cents % count;
  return Array.from(
    { length: count },
    (_, index) => (base + (index < remainder ? 1 : 0)) / 100,
  );
}

function paymentInstallments(order) {
  const totalCount = Math.max(1, Number(order.parcelas) || 1);
  const paidCount = Math.min(totalCount, Math.max(0, Number(order.parcelas_pagas) || 0));
  const remainingCount = totalCount - paidCount;
  return [
    ...installmentValues(Number(order.valor_pago || 0), paidCount),
    ...installmentValues(Number(order.valor_restante ?? order.valor_total), remainingCount),
  ];
}

function normalizeStatus(status) {
  if (status === "pendente") return "processando";
  if (status === "concluido") return "pago";
  return statuses.some((option) => option.value === status) ? status : "processando";
}

function initialForm() {
  const due = new Date();
  due.setDate(due.getDate() + 30);
  return {
    clienteId: "",
    data_pedido: localDateTimeValue().slice(0, 10),
    prazo_pagamento: localDateTimeValue(due).slice(0, 10),
    status: "processando",
    parcelas: "1",
    parcelas_pagas: "0",
    parcelas_restantes: "1",
    valor_pago: "0",
    observacao: "",
    itens: [{ produto_id: "", quantidade: "1", desconto: "0" }],
  };
}

function dateTimeInput(value) {
  if (!value) return "";
  const raw = String(value);
  const isoDate = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDate) return isoDate[1];
  const brDate = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brDate) return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : localDateTimeValue(date).slice(0, 10);
}

function whatsAppUrl(order, template) {
  let phone = String(order.cliente_telefone || "").replace(/\D/g, "");
  if (phone.length === 10 || phone.length === 11) phone = `55${phone}`;
  if (phone.length < 12) return "";

  const parcelas = Number(order.parcelas) || 1;
  const parcelasPagas = Number(order.parcelas_pagas) || 0;
  const pending = parcelasPagas < parcelas
    ? `Parcela pendente: ${parcelasPagas + 1} de ${parcelas}.`
    : "Pedido quitado.";
  const variables = {
    nome_cliente: order.cliente_nome || "Cliente",
    id_pedido: String(order.id).padStart(4, "0"),
    produtos: order.produtos_lista || "produtos do pedido",
    total: currency(order.valor_restante ?? order.valor_total),
    total_pedido: currency(order.valor_total),
    valor_restante: currency(order.valor_restante ?? order.valor_total),
    parcelas: `${parcelas}x`,
    parcela_pendente: pending,
    prazo_pagamento: dateLabel(order.prazo_pagamento),
  };
  const message = (template || "Olá {nome_cliente}! Sobre o pedido #{id_pedido}: {produtos}. Total: {total}. {parcela_pendente} Obrigado!")
    .replace(/\{([a-z_]+)\}/gi, (match, key) => variables[key.toLowerCase()] ?? match);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [notice, setNotice] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.orders(), api.clients(), api.products()])
      .then((results) => {
        if (!active) return;
        const [ordersResult, clientsResult, productsResult] = results;
        if (ordersResult.status === "fulfilled") setOrders(ordersResult.value);
        if (clientsResult.status === "fulfilled")
          setClients(clientsResult.value);
        if (productsResult.status === "fulfilled")
          setProducts(productsResult.value);
        const failures = results.filter(
          (result) => result.status === "rejected",
        );
        if (failures.length)
          setNotice({ type: "error", message: failures[0].reason.message });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleOrders = useMemo(
    () =>
      orders.filter((order) => {
        const text =
          `${order.id} ${order.cliente_nome || ""} ${order.cliente_telefone || ""}`.toLowerCase();
        const normalizedStatus = (order.status_atualizado || order.status) === "concluido" ? "pago" : (order.status_atualizado || order.status) === "pendente" ? "processando" : (order.status_atualizado || order.status);
        return (
          text.includes(query.toLowerCase()) &&
          (statusFilter === "todos" || normalizedStatus === statusFilter)
        );
      }),
    [orders, query, statusFilter],
  );
  const pageOrders = visibleOrders.slice((page - 1) * 10, page * 10);

  async function refreshOrders() {
    setOrders(await api.orders());
  }

  function updateItem(index, field, value) {
    setForm((current) => ({
      ...current,
      itens: current.itens.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  async function saveOrder(event) {
    event.preventDefault();
    setBusy(true);
    const client = clients.find(
      (item) => String(item.id) === String(form.clienteId),
    );
    const chosenItems = form.itens.filter((item) => item.produto_id);
    try {
      const payload = {
        data_pedido: apiDateTime(form.data_pedido),
        prazo_pagamento: apiDateTime(form.prazo_pagamento),
        status: form.status,
        parcelas: Number(form.parcelas),
        parcelas_pagas: Number(form.parcelas_pagas),
        observacao: form.observacao,
        itens: chosenItems.map((item) => ({
          produto_id: Number(item.produto_id),
          quantidade: Number(item.quantidade),
          desconto: Number(item.desconto || 0),
        })),
      };
      if (editingOrder) {
        const updatePayload = { ...payload, cliente_id: Number(form.clienteId) };
        const paymentChanged =
          Number(form.parcelas_pagas) !== Number(editingOrder.parcelas_pagas) ||
          Number(form.parcelas_restantes) !==
            Number(editingOrder.parcelas) - Number(editingOrder.parcelas_pagas) ||
          Number(form.valor_pago) !== Number(editingOrder.valor_pago);
        delete updatePayload.parcelas;
        if (paymentChanged) {
          updatePayload.parcelas_pagas = Number(form.parcelas_pagas);
          updatePayload.parcelas_restantes = Number(form.parcelas_restantes);
          updatePayload.valor_pago = Number(form.valor_pago);
        }
        else {
          delete updatePayload.parcelas_pagas;
        }
        await api.updateOrder(editingOrder.id, updatePayload);
      } else {
        await api.createOrder({ ...payload, phone: client.telefone });
      }
      setCreating(false);
      setEditingOrder(null);
      setForm(initialForm());
      setNotice({
        message: editingOrder
          ? "Pedido atualizado e estoque revisado."
          : "Pedido criado e estoque atualizado.",
      });
      await refreshOrders();
      const updatedProducts = await api.products();
      setProducts(updatedProducts);
    } catch (cause) {
      setNotice({ type: "error", message: cause.message });
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(orderId, status) {
    try {
      await api.updateOrder(orderId, { status });
      await refreshOrders();
      setNotice({ message: "Status do pedido atualizado." });
    } catch (cause) {
      setNotice({ type: "error", message: cause.message });
    }
  }

  async function openOrderDetails(order) {
    setSelectedOrder(order);
    setDetailLoading(true);
    setDetailError("");
    try {
      const response = await api.order(order.id);
      const details = response?.pedido || response?.order || response;
      setSelectedOrder({
        ...order,
        ...details,
        itens:
          response?.itens ||
          response?.items ||
          details?.itens ||
          details?.items ||
          order.itens ||
          order.items,
      });
    } catch (cause) {
      setDetailError(cause.message);
    } finally {
      setDetailLoading(false);
    }
  }

  async function openOrderEdit(order) {
    setBusy(true);
    try {
      const response = await api.order(order.id);
      const details = response?.order || response?.pedido || response;
      const items = response?.itens || details?.itens || [];
      setSelectedOrder(null);
      setEditingOrder(order);
      setForm({
        clienteId: String(details.cliente_id || order.cliente_id || ""),
        data_pedido: dateTimeInput(details.data_pedido),
        prazo_pagamento: dateTimeInput(details.prazo_pagamento),
        status: normalizeStatus(details.status_atualizado || details.status),
        parcelas: String(details.parcelas || 1),
        parcelas_pagas: String(details.parcelas_pagas || 0),
        parcelas_restantes: String(Math.max(
          0,
          Number(details.parcelas || 1) - Number(details.parcelas_pagas || 0),
        )),
        valor_pago: String(Number(details.valor_pago || 0)),
        observacao: details.observacao || "",
        itens: items.map((item) => ({
          produto_id: String(item.produto_id),
          quantidade: String(item.quantidade),
          desconto: String(item.desconto || 0),
        })),
      });
      setCreating(true);
    } catch (cause) {
      setNotice({ type: "error", message: cause.message });
    } finally {
      setBusy(false);
    }
  }

  const lowStockProducts = products.filter(
    (product) => Number(product.quantidade_estoque) <= 0,
  );
  const orderTotal = form.itens.reduce((total, item) => {
    const product = products.find(
      (entry) => String(entry.id) === String(item.produto_id),
    );
    return (
      total +
      (product
        ? Number(product.preco_venda) * Number(item.quantidade || 0) -
          Number(item.desconto || 0)
        : 0)
    );
  }, 0);

  return (
    <div className="animate-[settle-in_0.35s_ease_both]">
      <div className="mb-[27px] flex items-end justify-between gap-6 max-[620px]:mb-5 max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-4">
        <div>
          <span className={`text-[10px] font-bold tracking-[1px] text-[#839087] mb-[9px] block`}>
            VENDAS E ACOMPANHAMENTO
          </span>
          <h1 className="m-0 font-display text-[27px] font-bold leading-tight text-[#27342b] max-[620px]:text-2xl">Pedidos</h1>
          <p className="mb-0 mt-2 text-base text-muted">
            Registre vendas e acompanhe os pagamentos de cada pedido.
          </p>
        </div>
        <button
          className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 bg-nexo text-white hover:bg-nexo-hover max-[620px]:w-full`}
          onClick={() => {
            setEditingOrder(null);
            setForm(initialForm());
            setCreating(true);
          }}
          disabled={!clients.length || !products.length}
        >
          <Plus size={17} /> Novo pedido
        </button>
      </div>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      {!loading && (!clients.length || !products.length) && (
        <div className="mb-4 mt-[-11px] rounded border border-[#f0e3c3] bg-[#fcf7e9] px-3 py-2.5 text-sm text-[#8c672b]">
          Para abrir um pedido, cadastre ao menos um cliente e um produto com
          estoque.
        </div>
      )}
      <section className={`min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white px-[18px] pb-[5px] max-[620px]:px-3`}>
        <div className="flex min-h-[67px] items-center justify-between gap-4 border-b border-[#edf0eb] max-[620px]:flex-col max-[620px]:items-start max-[620px]:py-[13px]">
          <div className="text-sm text-[#778178]">
            <strong className="font-display text-base font-bold text-[#334138]">{orders.length}</strong>{" "}
            {orders.length === 1 ? "pedido registrado" : "pedidos registrados"}
          </div>
          <div className="flex items-center gap-2 max-[820px]:w-full max-[820px]:flex-col max-[820px]:items-stretch">
            <label className="flex h-[35px] w-full max-w-[550px] items-center gap-2 rounded border border-[#e1e7de] bg-white px-[10px] text-[#8b958c] max-[820px]:max-w-full">
              <Search size={17} />
              <input
                className="w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-[#a1a9a1] focus-visible:outline-none"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setPage(1); }}
                placeholder="Buscar pedido ou cliente"
                aria-label="Buscar pedidos"
              />
            </label>
            <select
              className="min-h-[35px] rounded border border-[#e1e7de] bg-white px-[10px] pr-[27px] text-sm text-[#546056] max-[620px]:w-full"
              value={statusFilter}
              onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}
              aria-label="Filtrar por status"
            >
              <option value="todos">Todos os status</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">Carregando pedidos...</div>
        ) : visibleOrders.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">
            <span className="grid h-[39px] w-[39px] place-items-center rounded-full border border-[#e2eadc] bg-[#f5f8f2] text-[#607e5c]">
              <ShoppingBag size={20} />
            </span>
            <strong className="mt-1 font-display text-base font-bold text-[#3e4d42]">
              {query || statusFilter !== "todos"
                ? "Nenhum pedido encontrado"
                : "Nenhum pedido registrado"}
            </strong>
            <span className="max-w-[310px] text-sm leading-relaxed text-[#8a948b]">
              {query || statusFilter !== "todos"
                ? "Ajuste os filtros e tente novamente."
                : "Seus pedidos e vendas vão aparecer aqui."}
            </span>
          </div>
        ) : (
          <>
          <div className="hidden w-full overflow-x-auto min-[851px]:block">
            <table className="w-full min-w-[990px] border-collapse text-left whitespace-nowrap">
              <thead>
                <tr>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">PEDIDO</th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">CLIENTE</th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">DATA</th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">PRAZO</th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">PARCELA</th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">STATUS</th>
                  <th className={`h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92] text-right`}>PENDENTE</th>
                  <th className={`h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92] text-right`}>VALOR TOTAL</th>
                  <th className={`h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92] text-right`}>EFETUAR COBRANÇA</th>
                </tr>
              </thead>
              <tbody>
                {pageOrders.map((order) => (
                  <tr className="[&:hover]:bg-[#fbfcfa]" key={order.id}>
                    <td
                      data-label="Pedido"
                      className={`h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72] font-bold text-[#3a473d]`}
                    >
                      <button
                        type="button"
                        className="rounded-sm border-0 bg-transparent p-0 text-left font-bold text-[#3a473d] hover:text-[#55734d] hover:underline"
                        onClick={() => openOrderDetails(order)}
                        aria-label={`Ver detalhes do pedido ${order.id}`}
                      >
                        #{String(order.id).padStart(4, "0")}
                      </button>
                    </td>
                    <td data-label="Cliente" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                      <div>
                        <span className="font-bold text-[#3a473d]">
                          {order.cliente_nome || "Cliente"}
                        </span>
                        <small className="mt-1 block text-xs text-[#959d95]">
                          {formatPhone(order.cliente_telefone)}
                        </small>
                      </div>
                    </td>
                    <td data-label="Data" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                      {dateLabel(order.data_pedido)}
                    </td>
                    <td data-label="Prazo" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                      {dateLabel(order.prazo_pagamento)}
                    </td>
                    <td data-label="Parcela" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                      {Number(order.parcelas_pagas) >= Number(order.parcelas) ? (
                        <span>Quitado</span>
                      ) : (
                        <span>
                          Parcela {Number(order.parcelas_pagas || 0) + 1}/{Number(order.parcelas) || 1}
                        </span>
                      )}
                    </td>
                    <td data-label="Status" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                      <select
                        className={`inline-flex h-[30px] min-h-[23px] max-w-[185px] cursor-pointer items-center rounded-sm border-0 px-2 pr-[23px] text-xs font-bold ${statusClasses[order.status_atualizado || order.status] || ""}`}
                        value={order.status_atualizado || order.status}
                        onChange={(event) =>
                          updateStatus(order.id, event.target.value)
                        }
                        aria-label={`Status do pedido ${order.id}`}
                      >
                        {statuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      data-label="Total"
                      className={`h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72] text-right font-bold text-[#3a473d]`}
                    >
                      {currency(order.valor_restante)}
                    </td>
                    <td
                      data-label="Total"
                      className={`h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72] text-right font-bold text-[#3a473d]`}
                    >
                      {currency(order.valor_total)}
                    </td>
                    <td data-label="Efetuar cobrança" className={`h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72] text-right`}>
                      <div className="flex justify-end">
                        <a
                          className={`inline-grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#25D366] bg-[#25D366] transition hover:border-[#1da851] hover:bg-[#1da851] ${String(order.cliente_telefone || "").replace(/\D/g, "").length < 10 ? "pointer-events-none opacity-40" : ""}`}
                          href={whatsAppUrl(order, user?.whatsapp_message) || undefined}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Efetuar cobrança pelo WhatsApp para ${order.cliente_nome || "cliente"} sobre o pedido ${order.id}`}
                          title="Efetuar cobrança pelo WhatsApp"
                          onClick={(event) => {
                            if (!whatsAppUrl(order, user?.whatsapp_message)) event.preventDefault();
                          }}
                        >
                          <WhatsAppIcon size={20} />
                        </a>
                        {String(order.cliente_telefone || "").replace(/\D/g, "").length < 10 && (
                          <span className="ml-2 text-xs font-normal text-[#9a7560]">Telefone inválido</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 py-3 min-[851px]:hidden">
            {pageOrders.map((order) => {
              const status = normalizeStatus(order.status_atualizado || order.status);
              const installments = Number(order.parcelas) || 1;
              const paidInstallments = Number(order.parcelas_pagas) || 0;
              const whatsappUrl = whatsAppUrl(order, user?.whatsapp_message);
              return (
                <article className="grid min-w-0 gap-3 rounded-lg border border-[#e5e9e2] bg-white p-3" key={`mobile-${order.id}`}>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <button
                      type="button"
                      className="rounded-sm border-0 bg-transparent p-0 text-left font-bold text-[#3a473d] hover:text-[#55734d] hover:underline"
                      onClick={() => openOrderDetails(order)}
                    >
                      Pedido #{String(order.id).padStart(4, "0")}
                    </button>
                    <select
                      className={`min-h-8 max-w-[145px] rounded-sm border-0 px-2 pr-6 text-xs font-bold ${statusClasses[status] || ""}`}
                      value={status}
                      onChange={(event) => updateStatus(order.id, event.target.value)}
                      aria-label={`Status do pedido ${order.id}`}
                    >
                      {statuses.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0 border-t border-[#f0f2ee] pt-2">
                    <strong className="block break-words text-sm text-[#344238]">{order.cliente_nome || "Cliente"}</strong>
                    <span className="mt-1 block text-xs text-[#778178]">{formatPhone(order.cliente_telefone)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                      <span className="block text-xs text-[#89938a]">Data do pedido</span>
                      <span className="font-medium text-[#344238]">{dateLabel(order.data_pedido)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#89938a]">Prazo de pagamento</span>
                      <span className="font-medium text-[#344238]">{dateLabel(order.prazo_pagamento)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#89938a]">Parcela</span>
                      <span className="font-medium text-[#344238]">
                        {paidInstallments >= installments ? "Quitado" : `${paidInstallments + 1}ª de ${installments}`}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#89938a]">Total do pedido</span>
                      <strong className="font-display text-sm text-[#344238]">{currency(order.valor_total)}</strong>
                    </div>
                    <div>
                      <span className="block text-xs text-[#89938a]">Recebido</span>
                      <span className="font-medium text-[#407249]">{currency(order.valor_pago)}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-[#89938a]">Saldo em aberto</span>
                      <strong className="font-display text-sm text-[#344238]">{currency(order.valor_restante ?? order.valor_total)}</strong>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[#f0f2ee] pt-2">
                    <span className="text-xs font-semibold text-[#89938a]">Efetuar cobrança</span>
                    <a
                      className={`inline-grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#25D366] bg-[#25D366] transition hover:border-[#1da851] hover:bg-[#1da851] ${whatsappUrl ? "" : "pointer-events-none opacity-40"}`}
                      href={whatsappUrl || undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Efetuar cobrança pelo WhatsApp para ${order.cliente_nome || "cliente"} sobre o pedido ${order.id}`}
                      title="Efetuar cobrança pelo WhatsApp"
                    >
                      <WhatsAppIcon size={21} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination page={page} total={visibleOrders.length} onPageChange={setPage} />
          </>
        )}
      </section>
      {selectedOrder && (
        <Modal
          title={`Pedido #${String(selectedOrder.id).padStart(4, "0")}`}
          description="Detalhes da venda e produtos incluídos."
          onClose={() => setSelectedOrder(null)}
          headerActions={
            <button
              className="inline-flex min-h-9 items-center gap-2 rounded-md bg-[#1b382c] px-3 text-sm font-semibold text-white transition hover:bg-[#285441]"
              onClick={() => openOrderEdit(selectedOrder)}
              disabled={busy || detailLoading}
            >
              <Pencil size={15} /> Editar
            </button>
          }
          wide
        >
          {detailError && (
            <p className="mb-4 mt-[-11px] rounded border border-[#f0e3c3] bg-[#fcf7e9] px-3 py-2.5 text-sm text-[#8c672b]" role="alert">
              {detailError}
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
            <div className="rounded border border-[#e5e9e2] bg-[#fafbf9] px-3 py-2.5">
              <span className="block text-xs font-semibold text-[#89938a]">Cliente</span>
              <span className="mt-1 block text-sm font-semibold text-[#344238]">
                {selectedOrder.cliente_nome || "Cliente"}
              </span>
              {selectedOrder.cliente_telefone && (
                <small className="mt-1 block text-xs text-[#959d95]">
                  {formatPhone(selectedOrder.cliente_telefone)}
                </small>
              )}
            </div>
            <div className="rounded border border-[#e5e9e2] bg-[#fafbf9] px-3 py-2.5">
              <span className="block text-xs font-semibold text-[#89938a]">Status</span>
              <span
                className={`inline-flex min-h-[23px] items-center rounded-sm border-0 px-2 text-xs font-bold ${statusClasses[selectedOrder.status_atualizado || selectedOrder.status] || ""}`}
              >
                {statuses.find(
                  (status) => status.value === (selectedOrder.status_atualizado || selectedOrder.status),
                )?.label ||
                  selectedOrder.status_atualizado ||
                  selectedOrder.status ||
                  "—"}
              </span>
            </div>
            <div className="rounded border border-[#e5e9e2] bg-[#fafbf9] px-3 py-2.5">
              <span className="block text-xs font-semibold text-[#89938a]">Data do pedido</span>
              <span className="mt-1 block text-sm font-semibold text-[#344238]">
                {dateLabel(selectedOrder.data_pedido)}
              </span>
            </div>
            <div className="rounded border border-[#e5e9e2] bg-[#fafbf9] px-3 py-2.5">
              <span className="block text-xs font-semibold text-[#89938a]">Prazo de pagamento</span>
              <span className="mt-1 block text-sm font-semibold text-[#344238]">
                {dateLabel(selectedOrder.prazo_pagamento)}
              </span>
            </div>
          </div>
          <h3 className="mt-5 font-display text-base font-bold text-[#344238]">Itens do pedido</h3>
          {detailLoading ? (
            <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">Carregando itens...</div>
          ) : (
            (() => {
              const items =
                selectedOrder.itens ||
                selectedOrder.items ||
                selectedOrder.produtos ||
                [];
              return items.length ? (
                <div className="mt-2 grid gap-2">
                  {items.map((item, index) => {
                    const product = products.find(
                      (entry) =>
                        String(entry.id) ===
                        String(
                          item.produto_id ||
                            item.product_id ||
                            item.produto?.id,
                        ),
                    );
                    const quantity = Number(
                      item.quantidade ?? item.quantity ?? 0,
                    );
                    const unitPrice = Number(
                      item.preco_unitario ??
                        item.valor_unitario ??
                        item.preco_venda ??
                        item.produto?.preco_venda ??
                        product?.preco_venda ??
                        0,
                    );
                    const discount = Number(item.desconto || 0);
                    const lineTotal = Number(
                      item.subtotal ??
                        item.valor_total ??
                        unitPrice * quantity - discount,
                    );
                    return (
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 rounded border border-[#e9eee6] px-3 py-2.5"
                        key={
                          item.id ||
                          `${item.produto_id || item.product_id || index}-${index}`
                        }
                      >
                        <div>
                          <span className="font-semibold text-[#344238]">
                            {item.produto_nome ||
                              item.nome_produto ||
                              item.nome ||
                              item.produto?.nome ||
                              product?.nome ||
                              "Produto"}
                          </span>
                          <small className="mt-1 block text-xs text-[#89938a]">
                            {quantity} un. × {currency(unitPrice)}
                            {discount > 0
                              ? ` · Desconto ${currency(discount)}`
                              : ""}
                          </small>
                        </div>
                        <span className="font-semibold text-[#344238]">
                          {currency(lineTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="max-w-[310px] text-sm leading-relaxed text-[#8a948b]">
                  {detailError
                    ? "Não foi possível carregar os itens deste pedido."
                    : "Este pedido não possui itens detalhados disponíveis."}
                </p>
              );
            })()
          )}
          {selectedOrder.observacao && (
            <>
              <h3 className="mt-5 font-display text-base font-bold text-[#344238]">Observação</h3>
              <p className="mb-0 mt-1.5 text-sm text-[#858f86]">{selectedOrder.observacao}</p>
            </>
          )}
          <section className="mt-5 rounded-lg border border-[#e5e9e2] bg-[#fafbf9] p-4">
            <div className="flex items-center justify-between gap-3 border-b border-[#e5e9e2] pb-3">
              <div>
                <h3 className="m-0 font-display text-base font-bold text-[#344238]">Parcelas</h3>
                <p className="m-0 text-xs text-[#89938a]">O valor recebido é descontado do saldo em aberto.</p>
              </div>
              <div className="text-right">
                <span className="block text-xs text-[#89938a]">Total do pedido</span>
                <strong className="text-sm text-[#344238]">{currency(selectedOrder.valor_total)}</strong>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {paymentInstallments(selectedOrder).map((amount, index) => {
                const paid = index < Number(selectedOrder.parcelas_pagas || 0);
                return (
                  <div className={`grid gap-1 rounded-md border p-3 ${paid ? "border-[#cfe4c9] bg-[#f0f8ed]" : "border-[#e5e9e2] bg-white"}`} key={`installment-${index}`}>
                    <span className="text-xs font-semibold text-[#788278]">Parcela {index + 1}</span>
                    <strong className="text-sm text-[#344238]">{currency(amount)}</strong>
                    <span className={`text-xs font-semibold ${paid ? "text-[#407249]" : "text-[#956b25]"}`}>{paid ? "Pago" : "Em aberto"}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#e5e9e2] pt-3 sm:grid-cols-3">
              <div><span className="block text-xs text-[#89938a]">Recebido</span><strong className="text-sm text-[#407249]">{currency(selectedOrder.valor_pago)}</strong></div>
              <div><span className="block text-xs text-[#89938a]">Saldo em aberto</span><strong className="text-sm text-[#a95a4e]">{currency(selectedOrder.valor_restante)}</strong></div>
              <div><span className="block text-xs text-[#89938a]">Parcelas quitadas</span><strong className="text-sm text-[#344238]">{Number(selectedOrder.parcelas_pagas || 0)} de {Number(selectedOrder.parcelas) || 1}</strong></div>
            </div>
          </section>
        </Modal>
      )}
      {creating && (
        <Modal
          title={editingOrder ? `Editar pedido #${String(editingOrder.id).padStart(4, "0")}` : "Novo pedido"}
          description={editingOrder ? "Atualize os dados e os itens da venda." : "Selecione um cliente e adicione os produtos da venda."}
          onClose={() => {
            setCreating(false);
            setEditingOrder(null);
          }}
          wide
        >
          <form
            className={`grid gap-[15px] grid gap-[13px]`}
            onSubmit={saveOrder}
          >
            <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
              Cliente
              <select
                className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                value={form.clienteId}
                onChange={(event) =>
                  setForm({ ...form, clienteId: event.target.value })
                }
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nome}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-[620px]:grid-cols-1">
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Data do pedido
                <input
                  className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                  type="date"
                  value={form.data_pedido}
                  onChange={(event) =>
                    setForm({ ...form, data_pedido: event.target.value })
                  }
                  required
                />
              </label>
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Prazo de pagamento
                <input
                  className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                  type="date"
                  value={form.prazo_pagamento}
                  onChange={(event) =>
                    setForm({ ...form, prazo_pagamento: event.target.value })
                  }
                  required
                />
              </label>
            </div>
            {!editingOrder ? (
              <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
                <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                  Número de parcelas
                  <select
                    className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                    value={form.parcelas}
                    onChange={(event) => {
                      const parcelas = event.target.value;
                      setForm({
                        ...form,
                        parcelas,
                        parcelas_pagas: String(Math.min(Number(form.parcelas_pagas), Number(parcelas))),
                      });
                    }}
                    required
                  >
                    {Array.from({ length: 12 }, (_, index) => index + 1).map((count) => (
                      <option key={count} value={count}>{count}x</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                  Parcelas já pagas
                  <select
                    className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                    value={form.parcelas_pagas}
                    onChange={(event) => setForm({ ...form, parcelas_pagas: event.target.value })}
                    required
                  >
                    {Array.from({ length: Number(form.parcelas) + 1 }, (_, count) => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <div className="grid gap-4 rounded-lg border border-[#e5e9e2] bg-[#fafbf9] p-4">
                <div className="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1">
                  <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                    Parcelas já pagas
                    <select
                      className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                      value={form.parcelas_pagas}
                      onChange={(event) => setForm({ ...form, parcelas_pagas: event.target.value })}
                    >
                      {Array.from({ length: 13 - Number(form.parcelas_restantes) }, (_, count) => (
                        <option key={count} value={count}>{count}</option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                    Parcelas restantes
                    <select
                      className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                      value={form.parcelas_restantes}
                      onChange={(event) => setForm({ ...form, parcelas_restantes: event.target.value })}
                    >
                      {Array.from({ length: 13 - Number(form.parcelas_pagas) }, (_, count) => (
                        <option
                          key={count}
                          value={count}
                          disabled={count === 0 && Number(form.valor_pago) < Number(editingOrder.valor_total)}
                        >
                          {count}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="m-0 text-xs text-[#89938a]">
                  Total do cronograma: {Number(form.parcelas_pagas) + Number(form.parcelas_restantes)} parcelas (máximo 12).
                  Ajuste as parcelas restantes conforme o valor que o cliente consegue pagar.
                </p>
                <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                  Valor total recebido
                  <CurrencyInput
                    value={form.valor_pago}
                    onValueChange={(value) => {
                      const total = Number(editingOrder.valor_total || 0);
                      const received = Math.min(total, Number(value) || 0);
                      const totalInstallments =
                        Number(form.parcelas_pagas) + Number(form.parcelas_restantes);
                      const paidCount = received >= total
                        ? totalInstallments
                        : received === 0
                          ? 0
                          : Math.max(1, Number(form.parcelas_pagas));
                      setForm({
                        ...form,
                        valor_pago: String(received),
                        parcelas_pagas: String(paidCount),
                        parcelas_restantes: String(totalInstallments - paidCount),
                        status: received >= total && total > 0
                          ? "pago"
                          : form.status === "pago"
                            ? "processando"
                            : form.status,
                      });
                    }}
                    required
                  />
                  <span className="text-xs font-normal text-[#89938a]">
                    O saldo restante será dividido igualmente entre as parcelas em aberto.
                  </span>
                </label>
              </div>
            )}
            {editingOrder && (
              <div className="grid gap-2">
                <span className="text-sm font-semibold text-[#344238]">Confirmar parcelas pagas</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {paymentInstallments({
                    valor_total: editingOrder.valor_total,
                    valor_pago: Number(form.valor_pago),
                    valor_restante: Math.max(0, Number(editingOrder.valor_total) - Number(form.valor_pago)),
                    parcelas: Number(form.parcelas_pagas) + Number(form.parcelas_restantes),
                    parcelas_pagas: Number(form.parcelas_pagas),
                  }).map((amount, index) => {
                    const paid = index < Number(form.parcelas_pagas);
                    return (
                      <button
                        type="button"
                        key={`edit-installment-${index}`}
                        className={`grid gap-1 rounded-md border p-3 text-left transition ${paid ? "border-[#cfe4c9] bg-[#f0f8ed] text-[#407249]" : "border-[#e5e9e2] bg-white text-[#59655c] hover:border-[#bfd2ba]"}`}
                        onClick={() => {
                          const totalCount = Number(form.parcelas_pagas) + Number(form.parcelas_restantes);
                          const paidCount = Number(form.parcelas_pagas);
                          const currentPaid = Number(form.valor_pago || 0);
                          const due = Math.max(0, Number(editingOrder.valor_total) - currentPaid);
                          const paidValues = installmentValues(currentPaid, paidCount);
                          const dueValues = installmentValues(due, totalCount - paidCount);
                          const nextPaid = paid ? index : index + 1;
                          const nextRemaining = Math.max(0, totalCount - nextPaid);
                          const nextValue = paid
                            ? Math.max(0, currentPaid - (paidValues[index] || 0))
                            : Math.min(
                              Number(editingOrder.valor_total),
                              currentPaid + dueValues
                                .slice(0, Math.max(1, index + 1 - paidCount))
                                .reduce((sum, installment) => sum + installment, 0),
                            );
                          setForm({
                            ...form,
                            parcelas_pagas: String(nextPaid),
                            parcelas_restantes: String(nextRemaining),
                            valor_pago: nextRemaining === 0
                              ? String(Number(editingOrder.valor_total))
                              : String(nextValue),
                            status: nextRemaining === 0
                              ? "pago"
                              : form.status === "pago"
                                ? "processando"
                                : form.status,
                          });
                        }}
                      >
                        <span className="text-xs font-semibold">Parcela {index + 1}</span>
                        <strong className="text-sm">{currency(amount)}</strong>
                        <span className="text-xs font-semibold">{paid ? "Pago · clique para desfazer" : "Marcar como pago"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between gap-1 pt-1 text-base text-[#3b493e] max-[390px]:items-start max-[390px]:gap-1 max-[390px]:text-sm">
              <strong>Itens do pedido</strong>
              <button
                type="button"
                className={`inline-flex items-center justify-center gap-1.5 border-0 bg-transparent p-[5px] text-base font-bold text-[#365b42] hover:text-[#70913f] max-[390px]:text-sm`}
                onClick={() =>
                  setForm({
                    ...form,
                    itens: [
                      ...form.itens,
                      { produto_id: "", quantidade: "1", desconto: "0" },
                    ],
                  })
                }
              >
                <CirclePlus size={16} /> Adicionar item
              </button>
            </div>
            <div className="grid gap-2">
              {form.itens.map((item, index) => (
                <div className="grid grid-cols-[minmax(190px,1fr)_92px_105px_30px] items-end gap-[9px] rounded border border-[#e9eee6] bg-[#fafbf9] p-[11px] max-[620px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_28px] max-[620px]:gap-1.5 max-[620px]:p-2 max-[390px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_26px] max-[390px]:gap-1" key={`item-${index}`}>
                  <label className={`grid gap-2 text-base font-semibold text-[#3e4941] min-w-0 max-[620px]:col-span-full`}>
                    Produto
                    <select
                      className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                      value={item.produto_id}
                      onChange={(event) =>
                        updateItem(index, "produto_id", event.target.value)
                      }
                      required
                    >
                      <option value="">Selecione um produto</option>
                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                          disabled={Number(product.quantidade_estoque) <= 0}
                        >
                          {product.nome} · {currency(product.preco_venda)} ·
                          estoque {product.quantidade_estoque}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={`grid gap-2 text-base font-semibold text-[#3e4941] min-w-0 max-[620px]:text-sm`}>
                    Quantidade
                    <input
                      className={`min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none max-[620px]:px-[5px] max-[620px]:text-sm`}
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantidade}
                      onChange={(event) =>
                        updateItem(index, "quantidade", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label className={`grid gap-2 text-base font-semibold text-[#3e4941] min-w-0 max-[620px]:text-sm`}>
                    Desconto
                    <CurrencyInput
                      value={item.desconto}
                      onValueChange={(desconto) =>
                        updateItem(index, "desconto", desconto)
                      }
                      required
                    />
                  </label>
                  <button
                    type="button"
                    className={`inline-grid h-[34px] w-[34px] place-items-center rounded border border-transparent bg-transparent text-[#647067] hover:border-[#e5e9e2] hover:bg-[#f8faf6] hover:text-nexo mb-0.5 text-[#a65c50] disabled:text-[#c0c7c0] max-[620px]:col-[3] max-[620px]:row-[2]`}
                    aria-label="Remover item"
                    disabled={form.itens.length === 1}
                    onClick={() =>
                      setForm({
                        ...form,
                        itens: form.itens.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      })
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
            <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
              Status inicial
              <select
                className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
              Observação <span className="font-normal text-[#9ba39b]">(opcional)</span>
              <textarea
                className="min-h-[72px] w-full resize-y rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                rows="2"
                maxLength="1000"
                value={form.observacao}
                onChange={(event) =>
                  setForm({ ...form, observacao: event.target.value })
                }
              />
            </label>
            <div className="flex items-center justify-between rounded bg-[#f0f5eb] px-[14px] py-[13px] text-[#4f6453]">
              <span className="inline-flex items-center gap-2 text-sm">
                <PackageCheck size={17} /> Total estimado
              </span>
              <strong className="font-display text-[17px] font-bold text-[#2d4534]">
                {currency(orderTotal)}
              </strong>
            </div>
            {lowStockProducts.length > 0 && (
              <div className="inline-warning">
                Há produtos sem estoque disponível; revise a quantidade antes de
                salvar.
              </div>
            )}
            <div className="flex justify-between gap-2 pt-[7px]">
              <button
                type="button"
                className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 border-[#dce3da] bg-white text-[#34453a] hover:border-[#c8d3c5] hover:bg-[#f2f5ef]`}
                onClick={() => setCreating(false)}
              >
                Cancelar
              </button>
              <button
                className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 bg-nexo text-white hover:bg-nexo-hover`}
                disabled={busy}
              >
                {busy
                  ? editingOrder ? "Salvando..." : "Registrando..."
                  : editingOrder ? "Salvar alterações" : "Confirmar pedido"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
