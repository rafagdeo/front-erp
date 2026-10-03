import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  Clock3,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { currency, dateLabel } from "../utils/format";
import { metricColor, statusClasses, tw } from "../components/tw";

const statusLabels = {
  pendente: "Pendente",
  processando: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export function Dashboard() {
  const [data, setData] = useState({ clients: [], products: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.clients(), api.products(), api.orders()])
      .then((results) => {
        if (!active) return;
        const [clients, products, orders] = results.map((result) =>
          result.status === "fulfilled" ? result.value : [],
        );
        setData({ clients, products, orders });
        if (results.some((result) => result.status === "rejected"))
          setError("Algumas informações não puderam ser atualizadas.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const revenue = data.orders
    .filter((order) => order.status !== "cancelado")
    .reduce((sum, order) => sum + Number(order.valor_total || 0), 0);
  const pending = data.orders.filter(
    (order) => order.status === "pendente" || order.status === "processando",
  ).length;
  const lowStock = data.products.filter(
    (product) => Number(product.quantidade_estoque) <= 5,
  ).length;
  const metrics = [
    {
      label: "Vendas registradas",
      value: currency(revenue),
      detail: `${data.orders.length} ${data.orders.length === 1 ? "pedido no total" : "pedidos no total"}`,
      icon: CircleDollarSign,
      color: "mint",
    },
    {
      label: "Pedidos em aberto",
      value: pending,
      detail: "Aguardando andamento",
      icon: ShoppingBag,
      color: "coral",
    },
    {
      label: "Clientes ativos",
      value: data.clients.length,
      detail: "Na sua carteira",
      icon: Users,
      color: "blue",
    },
    {
      label: "Itens em estoque",
      value: data.products.reduce(
        (sum, product) => sum + Number(product.quantidade_estoque || 0),
        0,
      ),
      detail: lowStock
        ? `${lowStock} produtos com estoque baixo`
        : "Estoque saudável",
      icon: Boxes,
      color: "gold",
    },
  ];

  return (
    <div className="animate-[settle-in_0.35s_ease_both]">
      <div className={tw.pageHeading}>
        <div>
          <span className={`${tw.eyebrow} ${tw.pageHeadingEyebrow}`}>SEU NEGÓCIO, AGORA</span>
          <h1 className={tw.pageTitle}>Visão geral</h1>
          <p className={tw.pageDescription}>Acompanhe o que está acontecendo na operação.</p>
        </div>
        <div className={tw.headingActions}>
          <Link className={`${tw.button} ${tw.buttonSecondary} ${tw.headingAction}`} to="/clients">
            <Plus size={17} /> Novo cliente
          </Link>
          <Link className={`${tw.button} ${tw.buttonPrimary} ${tw.headingAction}`} to="/orders">
            <Plus size={17} /> Criar pedido
          </Link>
        </div>
      </div>
      {error && (
        <p className={tw.warning} role="status">
          {error}
        </p>
      )}
      <section className={tw.metricGrid} aria-label="Indicadores da operação">
        {metrics.map(({ label, value, detail, icon: Icon, color }) => (
          <article className={tw.metricItem} key={label}>
            <div className={tw.metricTop}>
              <span>{label}</span>
              <span className={`${tw.metricIcon} ${metricColor(color)}`}>
                <Icon size={18} />
              </span>
            </div>
            <strong className={tw.metricValue}>{loading ? "—" : value}</strong>
            <span className={tw.metricDetail}>{detail}</span>
          </article>
        ))}
      </section>
      <section className={tw.dashboardLower}>
        <div className={`${tw.panel} ${tw.recentOrders}`}>
          <div className={tw.sectionHeading}>
            <div>
              <span className={`${tw.eyebrow} ${tw.sectionEyebrow}`}>MOVIMENTAÇÃO</span>
              <h2 className={tw.sectionTitle}>Pedidos recentes</h2>
            </div>
            <Link to="/orders" className={tw.subtleLink}>
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? (
            <div className={tw.emptyState}>Carregando movimentações...</div>
          ) : data.orders.length === 0 ? (
            <div className={tw.emptyState}>
              <span className={tw.emptySymbol}>
                <ShoppingBag size={20} />
              </span>
              <strong className={tw.emptyTitle}>Nenhum pedido por aqui</strong>
              <span className={tw.emptyDescription}>Seus novos pedidos vão aparecer nesta lista.</span>
              <Link className={tw.emptyLink} to="/orders">
                Registrar pedido <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className={tw.tableWrap}>
              <table className={tw.table}>
                <thead>
                  <tr>
                    <th className={tw.th}>Pedido</th>
                    <th className={tw.th}>Cliente</th>
                    <th className={tw.th}>Data</th>
                    <th className={tw.th}>Status</th>
                    <th className={`${tw.th} ${tw.alignRight}`}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.orders]
                    .sort(
                      (a, b) =>
                        new Date(b.data_pedido) - new Date(a.data_pedido),
                    )
                    .slice(0, 5)
                    .map((order) => (
                      <tr className={tw.rowHover} key={order.id}>
                        <td data-label="Pedido" className={`${tw.td} ${tw.cellStrong}`}>
                          #{String(order.id).padStart(4, "0")}
                        </td>
                        <td data-label="Cliente" className={tw.td}>
                          {order.cliente_nome ||
                            order.cliente_telefone ||
                            "Cliente"}
                        </td>
                        <td data-label="Data" className={tw.td}>{dateLabel(order.data_pedido)}</td>
                        <td data-label="Status" className={tw.td}>
                          <span className={`${tw.statusBadge} ${statusClasses(order.status)}`}>
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>
                        <td data-label="Total" className={`${tw.td} ${tw.alignRight} ${tw.cellStrong}`}>
                          {currency(order.valor_total)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <aside className={tw.quickPanel}>
          <div className={`${tw.sectionHeading} mb-2.5`}>
            <div>
              <span className={`${tw.eyebrow} ${tw.sectionEyebrow}`}>ACESSO RÁPIDO</span>
              <h2 className={tw.sectionTitle}>Atalhos úteis</h2>
            </div>
          </div>
          <Link className={tw.quickLink} to="/orders">
            <span className={`${tw.quickIcon} bg-[#fcebe5] text-[#bd674f]`}>
              <ShoppingBag size={18} />
            </span>
            <span className={tw.quickLinkText}>
              <strong className={tw.quickLinkTitle}>Gerenciar pedidos</strong>
              <small className={tw.quickLinkDescription}>{pending} aguardando ação</small>
            </span>
            <ArrowUpRight className={tw.quickLinkArrow} size={16} />
          </Link>
          <Link className={tw.quickLink} to="/products">
            <span className={`${tw.quickIcon} bg-[#f8f0dd] text-[#ac7b31]`}>
              <Boxes size={18} />
            </span>
            <span className={tw.quickLinkText}>
              <strong className={tw.quickLinkTitle}>Ver estoque</strong>
              <small className={tw.quickLinkDescription}>
                {lowStock
                  ? `${lowStock} ${lowStock === 1 ? "item precisa" : "itens precisam"} de atenção`
                  : `${data.products.length} ${data.products.length === 1 ? "produto cadastrado" : "produtos cadastrados"}`}
              </small>
            </span>
            {lowStock ? (
              <ArrowDownRight className={tw.quickLinkArrow} size={16} />
            ) : (
              <ArrowUpRight className={tw.quickLinkArrow} size={16} />
            )}
          </Link>
          <Link className={tw.quickLink} to="/clients">
            <span className={`${tw.quickIcon} bg-[#e9eff9] text-[#5676ad]`}>
              <Users size={18} />
            </span>
            <span className={tw.quickLinkText}>
              <strong className={tw.quickLinkTitle}>Consultar clientes</strong>
              <small className={tw.quickLinkDescription}>
                {data.clients.length}{" "}
                {data.clients.length === 1
                  ? "contato na base"
                  : "contatos na base"}
              </small>
            </span>
            <ArrowUpRight className={tw.quickLinkArrow} size={16} />
          </Link>
          <div className={tw.todayNote}>
            <Clock3 size={16} />
            <span>Dados atualizados nesta sessão</span>
          </div>
        </aside>
      </section>
    </div>
  );
}
