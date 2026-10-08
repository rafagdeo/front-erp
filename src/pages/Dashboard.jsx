import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { api } from "../services/api";
import { currency, dateLabel } from "../utils/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

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
  pago: "bg-[#e9f3e5] text-[#407249]",
  concluido: "bg-[#e9f3e5] text-[#407249]",
  cancelado: "bg-[#fbece8] text-[#a95a4e]",
};
const statusLabels = {
  pendente: "Pendente",
  atrasado: "Atrasado",
  processando: "Em andamento",
  pago: "Pago",
  concluido: "Pago",
  cancelado: "Cancelado",
};

function parseOrderDate(value) {
  const raw = String(value || "");
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const br = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
  return new Date(raw);
}
function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function Dashboard() {
  const [data, setData] = useState({ clients: [], products: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

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

  const lowStock = data.products.filter(
    (product) => Number(product.quantidade_estoque) <= 5,
  ).length;
  const pendingOrders = data.orders.filter((order) =>
    ["pendente", "processando", "atrasado"].includes(
      order.status_atualizado || order.status,
    ),
  ).length;
  const metrics = [
    {
      label: "Vendas registradas",
      value: currency(
        data.orders
          .filter(
            (order) =>
              (order.status_atualizado || order.status) !== "cancelado",
          )
          .reduce((sum, order) => sum + Number(order.valor_total || 0), 0),
      ),
      detail: `${data.orders.length} pedidos no total`,
      icon: CircleDollarSign,
      color: "mint",
    },
    {
      label: "Pedidos em aberto",
      value: pendingOrders,
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

  const finance = useMemo(() => {
    const today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth(), 1);
    let end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    if (period === "day")
      start = end = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
    if (period === "week") {
      const mondayOffset = (today.getDay() + 6) % 7;
      start = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - mondayOffset,
      );
      end = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + 6,
      );
    }
    if (period === "custom" && (!customStart || !customEnd))
      return {
        values: [],
        orders: [],
        total: 0,
        received: 0,
        receivable: 0,
        count: 0,
        start,
        end,
      };
    if (period === "custom") {
      start = new Date(`${customStart}T00:00:00`);
      end = new Date(`${customEnd}T00:00:00`);
      if (start > end) [start, end] = [end, start];
    }
    const startKey = isoDate(start);
    const endKey = isoDate(end);
    const orders = data.orders.filter((order) => {
      if ((order.status_atualizado || order.status) === "cancelado")
        return false;
      const date = parseOrderDate(order.data_pedido);
      const key = isoDate(date);
      return !Number.isNaN(date.getTime()) && key >= startKey && key <= endKey;
    });
    const spanDays = Math.round((end - start) / 86400000) + 1;
    const monthBuckets = period === "custom" && spanDays > 31;
    const count =
      period === "day"
        ? 1
        : period === "week"
          ? 7
          : monthBuckets
            ? (end.getFullYear() - start.getFullYear()) * 12 +
              end.getMonth() -
              start.getMonth() +
              1
            : Math.max(1, spanDays);
    const values = Array.from({ length: count }, (_, index) => ({
      label:
        period === "day"
          ? dateLabel(start)
          : period === "week"
            ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][index]
            : monthBuckets
              ? new Intl.DateTimeFormat("pt-BR", {
                  month: "short",
                  year: "2-digit",
                }).format(
                  new Date(start.getFullYear(), start.getMonth() + index, 1),
                )
              : dateLabel(
                  new Date(
                    start.getFullYear(),
                    start.getMonth(),
                    start.getDate() + index,
                  ),
                ),
      sales: 0,
      receivable: 0,
    }));
    orders.forEach((order) => {
      const date = parseOrderDate(order.data_pedido);
      const index =
        period === "day"
          ? 0
          : period === "week"
            ? (date.getDay() + 6) % 7
            : monthBuckets
              ? (date.getFullYear() - start.getFullYear()) * 12 +
                date.getMonth() -
                start.getMonth()
              : Math.min(
                  values.length - 1,
                  Math.floor((date - start) / 86400000),
                );
      if (values[index]) {
        values[index].sales += Number(order.valor_total || 0);
        values[index].receivable += Math.max(
          0,
          Number(
            order.valor_restante ??
              Number(order.valor_total || 0) - Number(order.valor_pago || 0),
          ),
        );
      }
    });
    return {
      values,
      orders,
      total: orders.reduce(
        (sum, order) => sum + Number(order.valor_total || 0),
        0,
      ),
      received: orders.reduce(
        (sum, order) => sum + Number(order.valor_pago || 0),
        0,
      ),
      receivable: orders.reduce(
        (sum, order) =>
          sum +
          Math.max(
            0,
            Number(
              order.valor_restante ??
                Number(order.valor_total || 0) - Number(order.valor_pago || 0),
            ),
            0,
          ),
        0,
      ),
      count: orders.length,
      start,
      end,
    };
  }, [data.orders, period, customStart, customEnd]);

  const chartData = {
    labels: finance.values.map((point) => point.label),
    datasets: [
      {
        label: "Vendas",
        data: finance.values.map((point) => point.sales),
        borderColor: "#315e43",
        backgroundColor: "rgba(83,126,75,.12)",
        fill: true,
        tension: 0.35,
        pointRadius: finance.values.length > 24 ? 0 : 3,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      },
      {
        label: "A receber",
        data: finance.values.map((point) => point.receivable),
        borderColor: "#d49b3f",
        backgroundColor: "rgba(212,155,63,.08)",
        fill: false,
        tension: 0.35,
        pointRadius: finance.values.length > 24 ? 0 : 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        borderDash: [5, 4],
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 7,
          boxHeight: 7,
          color: "#667268",
          padding: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${currency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#89938a", maxTicksLimit: 8, maxRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#edf0eb" },
        ticks: { color: "#89938a", callback: (value) => currency(value) },
      },
    },
  };
  const customMissingDate = period === "custom" && (!customStart || !customEnd);

  return (
    <div className="animate-[settle-in_0.35s_ease_both]">
      <div className="mb-[27px] flex items-end justify-between gap-6 max-[620px]:mb-5 max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-4">
        <div>
          <span className="mb-[9px] block text-[10px] font-bold tracking-[1px] text-[#839087]">
            SEU NEGÓCIO, AGORA
          </span>
          <h1 className="m-0 font-display text-[27px] font-bold leading-tight text-[#27342b] max-[620px]:text-2xl">
            Visão geral
          </h1>
          <p className="mb-0 mt-2 text-base text-muted">
            Acompanhe o que está acontecendo na operação.
          </p>
        </div>
        <div className="flex items-center gap-2 max-[620px]:w-full">
          <Link
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-[#dce3da] bg-white px-[15px] text-base font-bold text-[#34453a] hover:bg-[#f2f5ef] max-[620px]:flex-1"
            to="/dashboard/clients"
          >
            <Plus size={17} /> Novo cliente
          </Link>
          <Link
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] bg-nexo px-[15px] text-base font-bold text-white hover:bg-nexo-hover max-[620px]:flex-1"
            to="/dashboard/orders"
          >
            <Plus size={17} /> Criar pedido
          </Link>
        </div>
      </div>
      {error && (
        <p
          className="mb-4 rounded border border-[#f0e3c3] bg-[#fcf7e9] px-3 py-2.5 text-sm text-[#8c672b]"
          role="status"
        >
          {error}
        </p>
      )}

      <section
        className="mb-5 rounded-xl border border-[#e5e9e2] bg-white p-5 shadow-[0_4px_20px_rgba(35,55,39,.04)] max-[620px]:p-3"
        aria-label="Financeiro"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-1.5 block text-[10px] font-bold tracking-[1px] text-[#839087]">
              FINANCEIRO
            </span>
            <h2 className="m-0 font-display text-xl font-bold text-[#2d3930]">
              Resumo financeiro
            </h2>
            <p className="mb-0 mt-1 text-sm text-muted">
              Vendas, recebimentos e saldo pendente.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="finance-period">
              Período
            </label>
            <select
              id="finance-period"
              className="min-h-[38px] rounded border border-[#dfe5dd] bg-white px-3 pr-9 text-sm text-[#344238]"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
              <option value="custom">Personalizado</option>
            </select>
            {period === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <CalendarDays size={16} className="text-[#839087]" />
                <input
                  aria-label="Data inicial"
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="min-h-[38px] rounded border border-[#dfe5dd] px-2 text-sm"
                />
                <span className="text-sm text-muted">até</span>
                <input
                  aria-label="Data final"
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="min-h-[38px] rounded border border-[#dfe5dd] px-2 text-sm"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mb-5 grid grid-cols-4 gap-3 max-[850px]:grid-cols-2 max-[420px]:grid-cols-1">
          {[
            {
              label: "Vendas no período",
              value: finance.total,
              color: "text-[#315e43]",
            },
            {
              label: "Já recebido",
              value: finance.received,
              color: "text-[#5576ad]",
            },
            {
              label: "A receber",
              value: finance.receivable,
              color: "text-[#b47a22]",
            },
            {
              label: "Pedidos",
              value: finance.count,
              color: "text-[#344238]",
              isCount: true,
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-lg border border-[#edf0eb] bg-[#fbfcfa] px-4 py-3"
            >
              <span className="block text-xs font-medium text-[#7e897f]">
                {item.label}
              </span>
              <strong
                className={`mt-1 block font-display text-xl font-bold ${item.color}`}
              >
                {item.isCount ? item.value : currency(item.value)}
              </strong>
            </article>
          ))}
        </div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="m-0 text-sm font-bold text-[#344238]">
            Vendas e valores a receber
          </h3>
          <span className="text-xs text-muted">
            {customMissingDate
              ? "Selecione o período"
              : `${dateLabel(isoDate(finance.start))} — ${dateLabel(isoDate(finance.end))}`}
          </span>
        </div>
        <div className="h-[300px] w-full">
          {finance.values.length ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="grid h-full place-items-center rounded-lg border border-dashed border-[#dfe5dd] bg-[#fbfcfa] text-sm text-muted">
              {customMissingDate
                ? "Selecione a data inicial e final para consultar."
                : loading
                  ? "Carregando vendas..."
                  : "Sem vendas nesse período."}
            </div>
          )}
        </div>
      </section>

      <section
        className="grid grid-cols-[repeat(4,minmax(0,1fr))] rounded-[5px] border border-[#e5e9e2] bg-white max-[850px]:grid-cols-2"
        aria-label="Indicadores da operação"
      >
        {metrics.map(({ label, value, detail, icon: Icon, color }) => (
          <article
            className="min-h-[139px] min-w-0 border-r border-[#e5e9e2] px-[19px] pb-4 pt-[17px] max-[1100px]:px-[13px] max-[850px]:nth-[2]:border-r-0 max-[850px]:nth-[-n+2]:border-b max-[850px]:nth-[-n+2]:border-[#e5e9e2] max-[620px]:min-h-[124px] max-[620px]:px-3 max-[620px]:py-[13px]"
            key={label}
          >
            <div className="flex items-center justify-between gap-2 text-sm text-[#788278]">
              <span>{label}</span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded ${metricColors[color]}`}
              >
                <Icon size={18} />
              </span>
            </div>
            <strong className="mt-[15px] block overflow-hidden text-ellipsis whitespace-nowrap font-display text-[23px] font-bold leading-tight text-[#26352b]">
              {loading ? "—" : value}
            </strong>
            <span className="mt-[5px] block text-xs text-[#929a92]">
              {detail}
            </span>
          </article>
        ))}
      </section>

      <section className="mt-5 grid grid-cols-[minmax(0,1.8fr)_minmax(260px,0.85fr)] gap-[17px] max-[1100px]:grid-cols-[minmax(0,1.5fr)_minmax(235px,0.85fr)] max-[850px]:grid-cols-1">
        <div className="min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white px-[19px] pb-1 pt-5 max-[620px]:px-3">
          <div className="mb-[18px] flex items-center justify-between gap-3">
            <div>
              <span className="mb-1.5 block text-[10px] font-bold tracking-[1px] text-[#839087]">
                MOVIMENTAÇÃO
              </span>
              <h2 className="m-0 font-display text-xl font-bold leading-tight text-[#2d3930]">
                Pedidos recentes
              </h2>
            </div>
            <Link
              to="/dashboard/orders"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#52734e]"
            >
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? (
            <div className="grid min-h-[190px] place-items-center text-sm text-muted">
              Carregando movimentações...
            </div>
          ) : data.orders.length === 0 ? (
            <div className="grid min-h-[190px] place-items-center text-sm text-muted">
              Nenhum pedido por aqui.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="table-mobile-cards w-full border-collapse text-left whitespace-nowrap">
                <thead>
                  <tr>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold text-[#929a92]">
                      Pedido
                    </th>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold text-[#929a92]">
                      Cliente
                    </th>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold text-[#929a92]">
                      Data
                    </th>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold text-[#929a92]">
                      Status
                    </th>
                    <th className="h-[39px] border-b border-[#edf0eb] px-3 text-right text-xs font-bold text-[#929a92]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.orders]
                    .sort(
                      (a, b) =>
                        parseOrderDate(b.data_pedido) -
                        parseOrderDate(a.data_pedido),
                    )
                    .slice(0, 5)
                    .map((order) => {
                      const status = order.status_atualizado || order.status;
                      return (
                        <tr className="[&:hover]:bg-[#fbfcfa]" key={order.id}>
                          <td
                            data-label="Pedido"
                            className="h-[57px] border-b border-[#f0f2ee] px-3 font-bold text-[#3a473d]"
                          >
                            #{String(order.id).padStart(4, "0")}
                          </td>
                          <td
                            data-label="Cliente"
                            className="h-[57px] border-b border-[#f0f2ee] px-3 text-[#707b72]"
                          >
                            {order.cliente_nome ||
                              order.cliente_telefone ||
                              "Cliente"}
                          </td>
                          <td
                            data-label="Data"
                            className="h-[57px] border-b border-[#f0f2ee] px-3 text-[#707b72]"
                          >
                            {dateLabel(order.data_pedido)}
                          </td>
                          <td
                            data-label="Status"
                            className="h-[57px] border-b border-[#f0f2ee] px-3"
                          >
                            <span
                              className={`inline-flex min-h-[23px] items-center rounded-sm px-2 text-xs font-bold ${statusClasses[status] || ""}`}
                            >
                              {statusLabels[status] || status}
                            </span>
                          </td>
                          <td
                            data-label="Total"
                            className="h-[57px] border-b border-[#f0f2ee] px-3 text-right font-bold text-[#3a473d]"
                          >
                            {currency(
                              order.valor_restante ?? order.valor_total,
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <aside className="min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white px-[17px] pb-[10px] pt-5">
          <div className="mb-[18px]">
            <span className="mb-1.5 block text-[10px] font-bold tracking-[1px] text-[#839087]">
              ACESSO RÁPIDO
            </span>
            <h2 className="m-0 font-display text-xl font-bold leading-tight text-[#2d3930]">
              Atalhos úteis
            </h2>
          </div>
          <Link
            className="flex min-h-[65px] items-center gap-2.5 border-b border-[#edf0eb]"
            to="/dashboard/orders"
          >
            <span className="grid h-8 w-8 place-items-center rounded bg-[#fcebe5] text-[#bd674f]">
              <ShoppingBag size={18} />
            </span>
            <span className="grid min-w-0 flex-1 gap-1">
              <strong className="text-sm text-[#364238]">
                Gerenciar pedidos
              </strong>
              <small className="text-xs text-[#8b948b]">
                {pendingOrders} aguardando ação
              </small>
            </span>
            <ArrowUpRight className="text-[#98a198]" size={16} />
          </Link>
          <Link
            className="flex min-h-[65px] items-center gap-2.5 border-b border-[#edf0eb]"
            to="/dashboard/products"
          >
            <span className="grid h-8 w-8 place-items-center rounded bg-[#f8f0dd] text-[#ac7b31]">
              <Boxes size={18} />
            </span>
            <span className="grid min-w-0 flex-1 gap-1">
              <strong className="text-sm text-[#364238]">Ver estoque</strong>
              <small className="text-xs text-[#8b948b]">
                {lowStock
                  ? `${lowStock} itens precisam de atenção`
                  : `${data.products.length} produtos cadastrados`}
              </small>
            </span>
            {lowStock ? (
              <ArrowDownRight className="text-[#98a198]" size={16} />
            ) : (
              <ArrowUpRight className="text-[#98a198]" size={16} />
            )}
          </Link>
          <Link
            className="flex min-h-[65px] items-center gap-2.5 border-b border-[#edf0eb]"
            to="/dashboard/clients"
          >
            <span className="grid h-8 w-8 place-items-center rounded bg-[#e9eff9] text-[#5676ad]">
              <Users size={18} />
            </span>
            <span className="grid min-w-0 flex-1 gap-1">
              <strong className="text-sm text-[#364238]">
                Consultar clientes
              </strong>
              <small className="text-xs text-[#8b948b]">
                {data.clients.length} contatos na base
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
