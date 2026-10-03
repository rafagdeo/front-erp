import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Boxes, PackagePlus, Search } from "lucide-react";
import { api } from "../services/api";
import { Modal } from "../components/Modal";
import { Notice } from "../components/Notice";
import { CurrencyInput } from "../components/CurrencyInput";
import { currency } from "../utils/format";
const emptyProduct = {
  nome: "",
  quantidade_estoque: "0",
  preco_venda: "",
  custo_produto: "",
};

export function Products() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  async function refresh() {
    try {
      setProducts(await api.products());
    } catch (cause) {
      setNotice({ type: "error", message: cause.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api
      .products()
      .then((rows) => {
        if (active) setProducts(rows);
      })
      .catch((cause) => {
        if (active) setNotice({ type: "error", message: cause.message });
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
      products.filter((product) =>
        product.nome.toLowerCase().includes(query.toLowerCase()),
      ),
    [products, query],
  );

  function openForm(product = null) {
    setEditing(product);
    setModalOpen(true);
    setForm(
      product
        ? {
            nome: product.nome,
            quantidade_estoque: String(product.quantidade_estoque),
            preco_venda: String(product.preco_venda),
            custo_produto: String(product.custo_produto),
          }
        : emptyProduct,
    );
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    const product = {
      nome: form.nome.trim(),
      quantidade_estoque: Number(form.quantidade_estoque),
      preco_venda: Number(form.preco_venda),
      custo_produto: Number(form.custo_produto),
    };
    try {
      if (editing) await api.updateProduct(editing.id, product);
      else await api.createProduct(product);
      setModalOpen(false);
      setNotice({
        message: editing ? "Produto atualizado." : "Produto cadastrado.",
      });
      await refresh();
    } catch (cause) {
      setNotice({ type: "error", message: cause.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(product) {
    if (!window.confirm(`Excluir ${product.nome} do catálogo?`)) return;
    try {
      await api.deleteProduct(product.id);
      setNotice({ message: "Produto removido." });
      await refresh();
    } catch (cause) {
      setNotice({ type: "error", message: cause.message });
    }
  }

  const totalUnits = products.reduce(
    (sum, product) => sum + Number(product.quantidade_estoque || 0),
    0,
  );
  const lowStock = products.filter(
    (product) => Number(product.quantidade_estoque) <= 5,
  ).length;

  return (
    <div className="animate-[settle-in_0.35s_ease_both]">
      <div className="mb-[27px] flex items-end justify-between gap-6 max-[620px]:mb-5 max-[620px]:flex-col max-[620px]:items-start max-[620px]:gap-4">
        <div>
          <span className={`text-[10px] font-bold tracking-[1px] text-[#839087] mb-[9px] block`}>
            CATÁLOGO E ESTOQUE
          </span>
          <h1 className="m-0 font-display text-[27px] font-bold leading-tight text-[#27342b] max-[620px]:text-2xl">Produtos</h1>
          <p className="mb-0 mt-2 text-base text-muted">
            Preço, custo e disponibilidade em uma visão só.
          </p>
        </div>
        <button
          className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-[5px] border border-transparent px-[15px] text-base font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 bg-nexo text-white hover:bg-nexo-hover max-[620px]:w-full`}
          onClick={() => openForm()}
        >
          <PackagePlus size={17} /> Novo produto
        </button>
      </div>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      <div className="mb-[17px] grid grid-cols-3 rounded-[5px] border border-[#e5e9e2] bg-white max-[620px]:grid-cols-1">
        <div className="flex min-h-[78px] items-center gap-[11px] border-r border-[#e5e9e2] px-[17px] py-[13px] last:border-r-0 max-[620px]:min-h-[65px] max-[620px]:border-b max-[620px]:border-r-0 max-[620px]:last:border-b-0">
          <span className="grid h-[33px] w-[33px] place-items-center rounded bg-[#edf4e7] text-[#56734c]">
            <Boxes size={18} />
          </span>
          <span className="grid gap-[5px]">
            <small className="text-[11px] font-bold tracking-[.6px] text-[#929b92]">PRODUTOS NO CATÁLOGO</small>
            <strong className="font-display text-lg font-bold text-[#344238]">{products.length}</strong>
          </span>
        </div>
        <div className="flex min-h-[78px] items-center gap-[11px] border-r border-[#e5e9e2] px-[17px] py-[13px] last:border-r-0 max-[620px]:min-h-[65px] max-[620px]:border-b max-[620px]:border-r-0 max-[620px]:last:border-b-0">
          <span className={`grid h-[33px] w-[33px] place-items-center rounded bg-[#edf4e7] text-[#56734c] bg-[#eaf0f9] text-[#5976a9]`}>
            <PackagePlus size={18} />
          </span>
          <span className="grid gap-[5px]">
            <small className="text-[11px] font-bold tracking-[.6px] text-[#929b92]">UNIDADES DISPONÍVEIS</small>
            <strong className="font-display text-lg font-bold text-[#344238]">{totalUnits}</strong>
          </span>
        </div>
        <div className="flex min-h-[78px] items-center gap-[11px] border-r border-[#e5e9e2] px-[17px] py-[13px] last:border-r-0 max-[620px]:min-h-[65px] max-[620px]:border-b max-[620px]:border-r-0 max-[620px]:last:border-b-0">
          <span
            className={`grid h-[33px] w-[33px] place-items-center rounded bg-[#edf4e7] text-[#56734c] ${lowStock ? "bg-[#faf1df] text-[#ac7632]" : "bg-[#eaf3e5] text-[#44714a]"}`}
          >
            {lowStock ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
          </span>
          <span className="grid gap-[5px]">
            <small className="text-[11px] font-bold tracking-[.6px] text-[#929b92]">ESTOQUE BAIXO (ATÉ 5)</small>
            <strong className="font-display text-lg font-bold text-[#344238]">{lowStock}</strong>
          </span>
        </div>
      </div>
      <section className={`min-w-0 rounded-[5px] border border-[#e5e9e2] bg-white px-[18px] pb-[5px] max-[620px]:px-3`}>
        <div className="flex min-h-[67px] items-center justify-between gap-4 border-b border-[#edf0eb] max-[620px]:flex-col max-[620px]:items-start max-[620px]:py-[13px]">
          <div className="text-sm text-[#778178]">Catálogo de produtos</div>
          <label className="flex h-[35px] w-full max-w-[280px] items-center gap-2 rounded border border-[#e1e7de] bg-white px-[10px] text-[#8b958c] max-[620px]:max-w-full">
            <Search size={17} />
            <input
              className="min-w-0 w-full border-0 bg-transparent p-0 text-sm text-ink outline-none placeholder:text-[#a1a9a1] focus-visible:outline-none"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produto"
              aria-label="Buscar produtos"
            />
          </label>
        </div>
        {loading ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">Carregando produtos...</div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center gap-2 px-4 py-[30px] text-center">
            <span className="grid h-[39px] w-[39px] place-items-center rounded-full border border-[#e2eadc] bg-[#f5f8f2] text-[#607e5c]">
              <Boxes size={20} />
            </span>
            <strong className="mt-1 font-display text-base font-bold text-[#3e4d42]">
              {query
                ? "Nenhum resultado encontrado"
                : "Nenhum produto cadastrado"}
            </strong>
            <span className="max-w-[310px] text-sm leading-relaxed text-[#8a948b]">
              {query
                ? "Tente ajustar a busca."
                : "Adicione seus produtos para acompanhar estoque e pedidos."}
            </span>
            {!query && (
              <button className="inline-flex items-center justify-center gap-1.5 border-0 bg-transparent p-[5px] text-base font-bold text-[#365b42] hover:text-[#70913f]" onClick={() => openForm()}>
                Cadastrar produto
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="table-mobile-cards w-full border-collapse text-left whitespace-nowrap">
              <thead>
                <tr>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">PRODUTO</th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">ESTOQUE</th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">CUSTO</th>
                  <th className="h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92]">PREÇO DE VENDA</th>
                  <th className={`h-[39px] border-b border-[#edf0eb] px-3 text-xs font-bold tracking-[.5px] text-[#929a92] text-right`}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr className="[&:hover]:bg-[#fbfcfa]" key={product.id}>
                    <td data-label="Produto" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-[31px] w-[31px] shrink-0 place-items-center rounded bg-[#f8f0dd] font-display text-xs font-bold text-[#a57931]">
                          <Boxes size={17} />
                        </span>
                        <span className="font-bold text-[#3a473d]">{product.nome}</span>
                      </div>
                    </td>
                    <td data-label="Estoque" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">
                      <span
                        className={`inline-block rounded-sm bg-[#edf4e8] px-[7px] py-[5px] text-xs font-bold text-[#52754e] ${Number(product.quantidade_estoque) <= 5 ? "bg-[#faf1df] text-[#a66d2d]" : ""}`}
                      >
                        {product.quantidade_estoque} un.
                      </span>
                    </td>
                    <td data-label="Custo" className="h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72]">{currency(product.custo_produto)}</td>
                    <td data-label="Preço de venda" className={`h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72] font-bold text-[#3a473d]`}>
                      {currency(product.preco_venda)}
                    </td>
                    <td data-label="Ações" className={`h-[57px] border-b border-[#f0f2ee] px-3 text-md text-[#707b72] text-right`}>
                      <div className="inline-flex items-center gap-[5px]">
                        <button
                          className="rounded-sm border-0 bg-transparent px-[7px] py-1.5 text-sm font-semibold text-[#55734d] hover:bg-[#eff5e9]"
                          onClick={() => openForm(product)}
                        >
                          Editar
                        </button>
                        <button
                          className={`rounded-sm border-0 bg-transparent px-[7px] py-1.5 text-sm font-semibold text-[#55734d] hover:bg-[#eff5e9] text-[#ae6257] hover:bg-[#fff0ec]`}
                          onClick={() => remove(product)}
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
          title={editing ? "Editar produto" : "Novo produto"}
          description="Cadastre informações que serão usadas nos pedidos."
          onClose={() => setModalOpen(false)}
        >
          <form className="grid gap-[15px]" onSubmit={save}>
            <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
              Nome do produto
              <input
                className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                autoFocus
                value={form.nome}
                onChange={(event) =>
                  setForm({ ...form, nome: event.target.value })
                }
                maxLength={120}
                required
              />
            </label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-[620px]:grid-cols-1">
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Quantidade em estoque
                <input
                  className="min-h-[39px] w-full rounded border border-[#dfe5dd] bg-white px-[10px] py-2 text-base font-normal text-[#344238] outline-none"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantidade_estoque}
                  onChange={(event) =>
                    setForm({ ...form, quantidade_estoque: event.target.value })
                  }
                  required
                />
              </label>
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Preço de venda
                <CurrencyInput
                  value={form.preco_venda}
                  onValueChange={(preco_venda) =>
                    setForm({ ...form, preco_venda })
                  }
                  required
                />
              </label>
              <label className="grid gap-2 text-base font-semibold text-[#3e4941]">
                Custo do produto
                <CurrencyInput
                  value={form.custo_produto}
                  onValueChange={(custo_produto) =>
                    setForm({ ...form, custo_produto })
                  }
                  required
                />
              </label>
            </div>
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
                {busy ? "Salvando..." : "Salvar produto"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
