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
const metricColors = {
  mint: "bg-[#e8f4df] text-[#42774c]",
  coral: "bg-[#fcebe5] text-[#bd674f]",
  blue: "bg-[#e9eff9] text-[#5676ad]",
  gold: "bg-[#f8f0dd] text-[#ac7b31]",
};
const statusClasses = {
  pendente: "bg-[#faf2de] text-[#956b25]",
  atrasado: "bg-[#fbece8] text-[#a95a4e]",
  processando: "bg-[#eaf0fa] text-[#4f6da5]",
  concluido: "bg-[#e9f3e5] text-[#407249]",
  cancelado: "bg-[#fbece8] text-[#a95a4e]",
};

const statusLabels = {
  pendente: "Pendente",
  atrasado: "Atrasado",
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
      <div className="mb-[27px] flex items-end justify-between gap-6 max-[620px]:mb-5 max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-4">
        <div>
          <span className={`text-[10px] font-bold tracking-[1px] text-[#839087] mb-[9px] block`}>SEU NEGÓCIO, AGORA</span>
          <h1 className="m-0 font-display text-[27px] font-bold leading-tight text-[#27342b] max-[620px]:text-2xl">Visão geral</h1>
          <p className="mb-0 mt-2 text-base text-muted">Acompanhe o que está acontecendo na operação.</p>
        </div>
        <div className="flex items-center gap-2 max-[620px]:w-full">
          <Link className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 border-[#dce3da] bg-white text-[#34453a] hover:border-[#c8d3c5] hover:bg-[#f2f5ef] max-[620px]:flex-1`} to="/clients">
            <Plus size={17} /> Novo cliente
          </Link>
          <Link className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 bg-nexo text-white hover:bg-nexo-hover max-[620px]:flex-1`} to="/orders">
            <Plus size={17} /> Criar pedido
          </Link>
        </div>
      </div>
      {error && (
        <p className="mb-4 mt-[-11px] rounded border border-[#f0e3c3] bg-[#fcf7e9] px-3 py-2.5 text-sm text-[#8c672b]" role="status">
          {error}
        </p>
      )}
      <section className="grid grid-cols-[repeat(4,minmax(0,1fr))] rounded-[5px] border border-[#e5e9e2] bg-white max-[850px]:grid-cols-2" aria-label="Indicadores da operação">
        {metrics.map(({ label, value, detail, icon: Icon, color }) => (
          <article className="min-h-[139px] min-w-0 border-r border-[#e5e9e2] px-[19px] pb-4 pt-[17px] max-[1100px]:px-[13px] max-[850px]:nth-[2]:border-r-0 max-[850px]:nth-[-n+2]:border-b max-[850px]:nth-[-n+2]:border-[#e5e9e2] max-[620px]:min-h-[124px] max-[620px]:px-3 max-[620px]:py-[13px] max-[390px]:px-[9px] max-[390px]:py-[11px]" key={label}>
            <div className="flex items-center justify-between gap-2 text-sm text-[#788278] max-[620px]:items-start max-[620px]:text-xs max-[390px]:gap-[5px]">
              <span>{label}</span>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded max-[620px]:h-7 max-[620px]:w-7 max-[390px]:h-[25px] max-[390px]:w-[25px] ${metricColors[color] || ""}`}>
                <Icon size={18} />
              </span>
            </div>
            <strong className="mt-[15px] block overflow-hidden text-ellipsis whitespace-nowrap font-display text-[23px] font-bold leading-tight text-[#26352b] max-[620px]:text-xl max-[390px]:text-lg">{loading ? "—" : value}</strong>
            <span className="mt-[5px] block text-xs text-[#929a92] max-[620px]:text-[11px]">{detail}</span>
          </article>
        ))}
      </section>
      <section className="mt-5 grid grid-cols-[minmax(0,1.8fr)_minmax(260px,0.85fr)] gap-[17px] max-[1100px]:grid-cols-[minmax(0,1.5fr)_minmax(235px,0.85fr)] max-[850px]:grid-cols-1">
        <div className={`min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white px-[19px] pb-1 pt-5 max-[620px]:px-3 max-[620px]:pb-[3px] max-[620px]:pt-[17px]`}>
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <div>
              <span className={`text-[10px] font-bold tracking-[1px] text-[#839087] mb-1.5 block`}>MOVIMENTAÇÃO</span>
              <h2 className="m-0 font-display text-xl font-bold leading-tight text-[#2d3930]">Pedidos recentes</h2>
            </div>
            <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#52734e] hover:text-[#70913f]">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? (
            <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">Carregando movimentações...</div>
          ) : data.orders.length === 0 ? (
            <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">
              <span className="grid h-[39px] w-[39px] place-items-center rounded-full border border-[#e2eadc] bg-[#f5f8f2] text-[#607e5c]">
                <ShoppingBag size={20} />
              </span>
              <strong className="mt-1 font-display text-base font-bold text-[#3e4d42]">Nenhum pedido por aqui</strong>
              <span className="max-w-[310px] text-sm leading-relaxed text-[#8a948b]">Seus novos pedidos vão aparecer nesta lista.</span>
              <Link className="mt-[5px] inline-flex items-center gap-[5px] text-sm font-bold text-[#55734d]" to="/orders">
                Registrar pedido <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="table-mobile-cards w-full border-collapse text-left whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">Pedido</th>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">Cliente</th>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">Data</th>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">Status</th>
                    <th className={`h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92] text-right`}>Total</th>
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
                      <tr className="[&:hover]:bg-[#fbfcfa]" key={order.id}>
                        <td data-label="Pedido" className={`h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72] font-bold text-[#3a473d]`}>
                          #{String(order.id).padStart(4, "0")}
                        </td>
                        <td data-label="Cliente" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                          {order.cliente_nome ||
                            order.cliente_telefone ||
                            "Cliente"}
                        </td>
                        <td data-label="Data" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">{dateLabel(order.data_pedido)}</td>
                        <td data-label="Status" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                          <span className={`inline-flex min-h-[23px] items-center rounded-sm border-0 px-2 text-xs font-bold ${statusClasses[order.status_atualizado || order.status] || ""}`}>
                            {statusLabels[order.status_atualizado || order.status] || order.status}
                          </span>
                        </td>
                        <td data-label="Total" className={`h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72] text-right font-bold text-[#3a473d]`}>
                          {currency(order.valor_restante ?? order.valor_total)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <aside className="min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white px-[17px] pb-[10px] pt-5 max-[850px]:pb-[13px] max-[620px]:px-[13px] max-[620px]:pb-[10px] max-[620px]:pt-[17px]">
          <div className={`mb-[18px] flex items-center justify-between gap-3 mb-2.5`}>
            <div>
              <span className={`text-[10px] font-bold tracking-[1px] text-[#839087] mb-1.5 block`}>ACESSO RÁPIDO</span>
              <h2 className="m-0 font-display text-xl font-bold leading-tight text-[#2d3930]">Atalhos úteis</h2>
            </div>
          </div>
          <Link className="flex min-h-[65px] items-center gap-2.5 border-b border-[#edf0eb] max-[850px]:min-h-[58px]" to="/orders">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded bg-[#fcebe5] text-[#bd674f]`}>
              <ShoppingBag size={18} />
            </span>
            <span className="grid min-w-0 flex-1 gap-1">
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#364238]">Gerenciar pedidos</strong>
              <small className="text-xs text-[#8b948b]">{pending} aguardando ação</small>
            </span>
            <ArrowUpRight className="text-[#98a198]" size={16} />
          </Link>
          <Link className="flex min-h-[65px] items-center gap-2.5 border-b border-[#edf0eb] max-[850px]:min-h-[58px]" to="/products">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded bg-[#f8f0dd] text-[#ac7b31]`}>
              <Boxes size={18} />
            </span>
            <span className="grid min-w-0 flex-1 gap-1">
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#364238]">Ver estoque</strong>
              <small className="text-xs text-[#8b948b]">
                {lowStock
                  ? `${lowStock} ${lowStock === 1 ? "item precisa" : "itens precisam"} de atenção`
                  : `${data.products.length} ${data.products.length === 1 ? "produto cadastrado" : "produtos cadastrados"}`}
              </small>
            </span>
            {lowStock ? (
              <ArrowDownRight className="text-[#98a198]" size={16} />
            ) : (
              <ArrowUpRight className="text-[#98a198]" size={16} />
            )}
          </Link>
          <Link className="flex min-h-[65px] items-center gap-2.5 border-b border-[#edf0eb] max-[850px]:min-h-[58px]" to="/clients">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded bg-[#e9eff9] text-[#5676ad]`}>
              <Users size={18} />
            </span>
            <span className="grid min-w-0 flex-1 gap-1">
              <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-[#364238]">Consultar clientes</strong>
              <small className="text-xs text-[#8b948b]">
                {data.clients.length}{" "}
                {data.clients.length === 1
                  ? "contato na base"
                  : "contatos na base"}
              </small>
            </span>
            <ArrowUpRight className="text-[#98a198]" size={16} />
          </Link>
          <div className="flex items-center gap-2 pb-[5px] pt-[14px] text-xs text-[#89938a]">
            <Clock3 size={16} />
            <span>Dados atualizados nesta sessão</span>
          </div>
        </aside>
      </section>
    </div>
  );
}
