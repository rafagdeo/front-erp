import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CirclePlus,
  PackageCheck,
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
import {
  apiDateTime,
  currency,
  dateLabel,
  localDateTimeValue,
} from "../utils/format";
import { statusClasses, tw } from "../components/tw";

const statuses = [
  { value: "pendente", label: "Pendente" },
  { value: "processando", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
  { value: "cancelado", label: "Cancelado" },
];

function initialForm() {
  const due = new Date();
  due.setDate(due.getDate() + 30);
  return {
    clienteId: "",
    data_pedido: localDateTimeValue(),
    prazo_pagamento: localDateTimeValue(due),
    status: "pendente",
    observacao: "",
    itens: [{ produto_id: "", quantidade: "1", desconto: "0" }],
  };
}

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [notice, setNotice] = useState(null);

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
        return (
          text.includes(query.toLowerCase()) &&
          (statusFilter === "todos" || order.status === statusFilter)
        );
      }),
    [orders, query, statusFilter],
  );

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
      await api.createOrder({
        phone: client.telefone,
        data_pedido: apiDateTime(form.data_pedido),
        prazo_pagamento: apiDateTime(form.prazo_pagamento),
        status: form.status,
        observacao: form.observacao,
        itens: chosenItems.map((item) => ({
          produto_id: Number(item.produto_id),
          quantidade: Number(item.quantidade),
          desconto: Number(item.desconto || 0),
        })),
      });
      setCreating(false);
      setForm(initialForm());
      setNotice({ message: "Pedido criado e estoque atualizado." });
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
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
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
    <div className={tw.modulePage}>
      <div className={tw.pageHeading}>
        <div>
          <span className={`${tw.eyebrow} ${tw.pageHeadingEyebrow}`}>
            VENDAS E ACOMPANHAMENTO
          </span>
          <h1 className={tw.pageTitle}>Pedidos</h1>
          <p className={tw.pageDescription}>
            Registre vendas e acompanhe cada etapa até a conclusão.
          </p>
        </div>
        <button
          className={`${tw.button} ${tw.buttonPrimary} ${tw.fullMobileButton}`}
          onClick={() => {
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
        <div className={tw.warning}>
          Para abrir um pedido, cadastre ao menos um cliente e um produto com
          estoque.
        </div>
      )}
      <section className={`${tw.panel} ${tw.moduleSection}`}>
        <div className={tw.listToolbar}>
          <div className={tw.listCount}>
            <strong className={tw.listCountStrong}>{orders.length}</strong>{" "}
            {orders.length === 1 ? "pedido registrado" : "pedidos registrados"}
          </div>
          <div className={tw.tableFilters}>
            <label className={tw.searchField}>
              <Search size={17} />
              <input
                className={tw.searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar pedido ou cliente"
                aria-label="Buscar pedidos"
              />
            </label>
            <select
              className={tw.filterSelect}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
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
          <div className={tw.emptyState}>Carregando pedidos...</div>
        ) : visibleOrders.length === 0 ? (
          <div className={tw.emptyState}>
            <span className={tw.emptySymbol}>
              <ShoppingBag size={20} />
            </span>
            <strong className={tw.emptyTitle}>
              {query || statusFilter !== "todos"
                ? "Nenhum pedido encontrado"
                : "Nenhum pedido registrado"}
            </strong>
            <span className={tw.emptyDescription}>
              {query || statusFilter !== "todos"
                ? "Ajuste os filtros e tente novamente."
                : "Seus pedidos e vendas vão aparecer aqui."}
            </span>
          </div>
        ) : (
          <div className={tw.tableWrap}>
            <table className={tw.table}>
              <thead>
                <tr>
                  <th className={tw.th}>PEDIDO</th>
                  <th className={tw.th}>CLIENTE</th>
                  <th className={tw.th}>DATA</th>
                  <th className={tw.th}>PRAZO</th>
                  <th className={tw.th}>STATUS</th>
                  <th className={`${tw.th} ${tw.alignRight}`}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => (
                  <tr className={tw.rowHover} key={order.id}>
                    <td
                      data-label="Pedido"
                      className={`${tw.td} ${tw.cellStrong}`}
                    >
                      <button
                        type="button"
                        className={tw.orderDetailsTrigger}
                        onClick={() => openOrderDetails(order)}
                        aria-label={`Ver detalhes do pedido ${order.id}`}
                      >
                        #{String(order.id).padStart(4, "0")}
                      </button>
                    </td>
                    <td data-label="Cliente" className={tw.td}>
                      <div>
                        <span className={tw.cellStrong}>
                          {order.cliente_nome || "Cliente"}
                        </span>
                        <small className={tw.tableSubline}>
                          {order.cliente_telefone}
                        </small>
                      </div>
                    </td>
                    <td data-label="Data" className={tw.td}>
                      {dateLabel(order.data_pedido)}
                    </td>
                    <td data-label="Prazo" className={tw.td}>
                      {dateLabel(order.prazo_pagamento)}
                    </td>
                    <td data-label="Status" className={tw.td}>
                      <select
                        className={`${tw.statusSelect} ${statusClasses(order.status)}`}
                        value={order.status}
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
                      className={`${tw.td} ${tw.alignRight} ${tw.cellStrong}`}
                    >
                      {currency(order.valor_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {selectedOrder && (
        <Modal
          title={`Pedido #${String(selectedOrder.id).padStart(4, "0")}`}
          description="Detalhes da venda e produtos incluídos."
          onClose={() => setSelectedOrder(null)}
          wide
        >
          {detailError && (
            <p className={tw.warning} role="alert">
              {detailError}
            </p>
          )}
          <div className={tw.orderDetailGrid}>
            <div className={tw.orderDetailCard}>
              <span className={tw.orderDetailLabel}>Cliente</span>
              <span className={tw.orderDetailValue}>
                {selectedOrder.cliente_nome || "Cliente"}
              </span>
              {selectedOrder.cliente_telefone && (
                <small className={tw.tableSubline}>
                  {formatPhone(selectedOrder.cliente_telefone)}
                </small>
              )}
            </div>
            <div className={tw.orderDetailCard}>
              <span className={tw.orderDetailLabel}>Status</span>
              <span
                className={`${tw.statusBadge} ${statusClasses(selectedOrder.status)}`}
              >
                {statuses.find(
                  (status) => status.value === selectedOrder.status,
                )?.label ||
                  selectedOrder.status ||
                  "—"}
              </span>
            </div>
            <div className={tw.orderDetailCard}>
              <span className={tw.orderDetailLabel}>Data do pedido</span>
              <span className={tw.orderDetailValue}>
                {dateLabel(selectedOrder.data_pedido)}
              </span>
            </div>
            <div className={tw.orderDetailCard}>
              <span className={tw.orderDetailLabel}>Prazo de pagamento</span>
              <span className={tw.orderDetailValue}>
                {dateLabel(selectedOrder.prazo_pagamento)}
              </span>
            </div>
          </div>
          <h3 className={tw.orderDetailSection}>Itens do pedido</h3>
          {detailLoading ? (
            <div className={tw.emptyState}>Carregando itens...</div>
          ) : (
            (() => {
              const items =
                selectedOrder.itens ||
                selectedOrder.items ||
                selectedOrder.produtos ||
                [];
              return items.length ? (
                <div className={tw.orderDetailItems}>
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
                        className={tw.orderDetailItem}
                        key={
                          item.id ||
                          `${item.produto_id || item.product_id || index}-${index}`
                        }
                      >
                        <div>
                          <span className={tw.orderDetailItemName}>
                            {item.produto_nome ||
                              item.nome_produto ||
                              item.nome ||
                              item.produto?.nome ||
                              product?.nome ||
                              "Produto"}
                          </span>
                          <small className={tw.orderDetailItemMeta}>
                            {quantity} un. × {currency(unitPrice)}
                            {discount > 0
                              ? ` · Desconto ${currency(discount)}`
                              : ""}
                          </small>
                        </div>
                        <span className={tw.orderDetailItemTotal}>
                          {currency(lineTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={tw.emptyDescription}>
                  {detailError
                    ? "Não foi possível carregar os itens deste pedido."
                    : "Este pedido não possui itens detalhados disponíveis."}
                </p>
              );
            })()
          )}
          {selectedOrder.observacao && (
            <>
              <h3 className={tw.orderDetailSection}>Observação</h3>
              <p className={tw.modalDescription}>{selectedOrder.observacao}</p>
            </>
          )}
          <div className={tw.orderDetailFooter}>
            <span>Total do pedido</span>
            <span>{currency(selectedOrder.valor_total)}</span>
          </div>
        </Modal>
      )}
      {creating && (
        <Modal
          title="Novo pedido"
          description="Selecione um cliente e adicione os produtos da venda."
          onClose={() => setCreating(false)}
          wide
        >
          <form
            className={`${tw.modalForm} ${tw.orderForm}`}
            onSubmit={saveOrder}
          >
            <label className={tw.formLabel}>
              Cliente
              <select
                className={tw.input}
                value={form.clienteId}
                onChange={(event) =>
                  setForm({ ...form, clienteId: event.target.value })
                }
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nome} · {formatPhone(client.telefone)}
                  </option>
                ))}
              </select>
            </label>
            <div className={tw.formGrid}>
              <label className={tw.formLabel}>
                Data do pedido
                <input
                  className={tw.input}
                  type="datetime-local"
                  value={form.data_pedido}
                  onChange={(event) =>
                    setForm({ ...form, data_pedido: event.target.value })
                  }
                  required
                />
              </label>
              <label className={tw.formLabel}>
                Prazo de pagamento
                <input
                  className={tw.input}
                  type="datetime-local"
                  value={form.prazo_pagamento}
                  onChange={(event) =>
                    setForm({ ...form, prazo_pagamento: event.target.value })
                  }
                  required
                />
              </label>
            </div>
            <div className={tw.orderItemsHeading}>
              <strong>Itens do pedido</strong>
              <button
                type="button"
                className={`${tw.buttonText} max-[390px]:text-sm`}
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
            <div className={tw.orderItemList}>
              {form.itens.map((item, index) => (
                <div className={tw.orderItemRow} key={`item-${index}`}>
                  <label className={`${tw.formLabel} ${tw.orderProduct}`}>
                    Produto
                    <select
                      className={tw.input}
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
                  <label className={`${tw.formLabel} ${tw.orderItemField}`}>
                    Quantidade
                    <input
                      className={`${tw.input} ${tw.orderItemInput}`}
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
                  <label className={`${tw.formLabel} ${tw.orderItemField}`}>
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
                    className={`${tw.iconButton} ${tw.removeItem}`}
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
            <label className={tw.formLabel}>
              Status inicial
              <select
                className={tw.input}
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
            <label className={tw.formLabel}>
              Observação <span className={tw.optionalLabel}>(opcional)</span>
              <textarea
                className={tw.textarea}
                rows="2"
                maxLength="1000"
                value={form.observacao}
                onChange={(event) =>
                  setForm({ ...form, observacao: event.target.value })
                }
              />
            </label>
            <div className={tw.orderTotal}>
              <span className={tw.orderTotalLabel}>
                <PackageCheck size={17} /> Total estimado
              </span>
              <strong className={tw.orderTotalValue}>
                {currency(orderTotal)}
              </strong>
            </div>
            {lowStockProducts.length > 0 && (
              <div className="inline-warning">
                Há produtos sem estoque disponível; revise a quantidade antes de
                salvar.
              </div>
            )}
            <div className={tw.modalActions}>
              <button
                type="button"
                className={`${tw.button} ${tw.buttonSecondary}`}
                onClick={() => setCreating(false)}
              >
                Cancelar
              </button>
              <button
                className={`${tw.button} ${tw.buttonPrimary}`}
                disabled={busy}
              >
                {busy ? "Registrando..." : "Confirmar pedido"}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
