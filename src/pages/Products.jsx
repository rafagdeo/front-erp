import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Boxes, PackagePlus, Search } from "lucide-react";
import { api } from "../services/api";
import { Modal } from "../components/Modal";
import { Notice } from "../components/Notice";
import { CurrencyInput } from "../components/CurrencyInput";
import { currency } from "../utils/format";
import { tw } from "../components/tw";

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
    <div className={tw.modulePage}>
      <div className={tw.pageHeading}>
        <div>
          <span className={`${tw.eyebrow} ${tw.pageHeadingEyebrow}`}>
            CATÁLOGO E ESTOQUE
          </span>
          <h1 className={tw.pageTitle}>Produtos</h1>
          <p className={tw.pageDescription}>
            Preço, custo e disponibilidade em uma visão só.
          </p>
        </div>
        <button
          className={`${tw.button} ${tw.buttonPrimary} ${tw.fullMobileButton}`}
          onClick={() => openForm()}
        >
          <PackagePlus size={17} /> Novo produto
        </button>
      </div>
      <Notice notice={notice} onClose={() => setNotice(null)} />
      <div className={tw.inventoryStrip}>
        <div className={tw.inventoryItem}>
          <span className={tw.inventoryIcon}>
            <Boxes size={18} />
          </span>
          <span className={tw.inventoryText}>
            <small className={tw.inventoryLabel}>PRODUTOS NO CATÁLOGO</small>
            <strong className={tw.inventoryValue}>{products.length}</strong>
          </span>
        </div>
        <div className={tw.inventoryItem}>
          <span className={`${tw.inventoryIcon} ${tw.inventoryBlue}`}>
            <PackagePlus size={18} />
          </span>
          <span className={tw.inventoryText}>
            <small className={tw.inventoryLabel}>UNIDADES DISPONÍVEIS</small>
            <strong className={tw.inventoryValue}>{totalUnits}</strong>
          </span>
        </div>
        <div className={tw.inventoryItem}>
          <span
            className={`${tw.inventoryIcon} ${lowStock ? tw.inventoryWarn : tw.inventoryGreen}`}
          >
            {lowStock ? <ArrowDown size={18} /> : <ArrowUp size={18} />}
          </span>
          <span className={tw.inventoryText}>
            <small className={tw.inventoryLabel}>ESTOQUE BAIXO (ATÉ 5)</small>
            <strong className={tw.inventoryValue}>{lowStock}</strong>
          </span>
        </div>
      </div>
      <section className={`${tw.panel} ${tw.moduleSection}`}>
        <div className={tw.listToolbar}>
          <div className={tw.listCount}>Catálogo de produtos</div>
          <label className={tw.searchField}>
            <Search size={17} />
            <input
              className={tw.searchInput}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar produto"
              aria-label="Buscar produtos"
            />
          </label>
        </div>
        {loading ? (
          <div className={tw.emptyState}>Carregando produtos...</div>
        ) : filtered.length === 0 ? (
          <div className={tw.emptyState}>
            <span className={tw.emptySymbol}>
              <Boxes size={20} />
            </span>
            <strong className={tw.emptyTitle}>
              {query
                ? "Nenhum resultado encontrado"
                : "Nenhum produto cadastrado"}
            </strong>
            <span className={tw.emptyDescription}>
              {query
                ? "Tente ajustar a busca."
                : "Adicione seus produtos para acompanhar estoque e pedidos."}
            </span>
            {!query && (
              <button className={tw.buttonText} onClick={() => openForm()}>
                Cadastrar produto
              </button>
            )}
          </div>
        ) : (
          <div className={tw.tableWrap}>
            <table className={tw.table}>
              <thead>
                <tr>
                  <th className={tw.th}>PRODUTO</th>
                  <th className={tw.th}>ESTOQUE</th>
                  <th className={tw.th}>CUSTO</th>
                  <th className={tw.th}>PREÇO DE VENDA</th>
                  <th className={`${tw.th} ${tw.alignRight}`}>AÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr className={tw.rowHover} key={product.id}>
                    <td data-label="Produto" className={tw.td}>
                      <div className={tw.productCell}>
                        <span className={tw.productSymbol}>
                          <Boxes size={17} />
                        </span>
                        <span className={tw.cellStrong}>{product.nome}</span>
                      </div>
                    </td>
                    <td data-label="Estoque" className={tw.td}>
                      <span
                        className={`${tw.stockCount} ${Number(product.quantidade_estoque) <= 5 ? tw.stockLow : ""}`}
                      >
                        {product.quantidade_estoque} un.
                      </span>
                    </td>
                    <td data-label="Custo" className={tw.td}>{currency(product.custo_produto)}</td>
                    <td data-label="Preço de venda" className={`${tw.td} ${tw.cellStrong}`}>
                      {currency(product.preco_venda)}
                    </td>
                    <td data-label="Ações" className={`${tw.td} ${tw.alignRight}`}>
                      <div className={tw.rowActions}>
                        <button
                          className={tw.tableAction}
                          onClick={() => openForm(product)}
                        >
                          Editar
                        </button>
                        <button
                          className={`${tw.tableAction} ${tw.dangerAction}`}
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
          <form className={tw.modalForm} onSubmit={save}>
            <label className={tw.formLabel}>
              Nome do produto
              <input
                className={tw.input}
                autoFocus
                value={form.nome}
                onChange={(event) =>
                  setForm({ ...form, nome: event.target.value })
                }
                maxLength={120}
                required
              />
            </label>
            <div className={tw.formGrid}>
              <label className={tw.formLabel}>
                Quantidade em estoque
                <input
                  className={tw.input}
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
              <label className={tw.formLabel}>
                Preço de venda
                <CurrencyInput
                  value={form.preco_venda}
                  onValueChange={(preco_venda) =>
                    setForm({ ...form, preco_venda })
                  }
                  required
                />
              </label>
              <label className={tw.formLabel}>
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
            <div className={tw.modalActions}>
              <button
                type="button"
                className={`${tw.button} ${tw.buttonSecondary}`}
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className={`${tw.button} ${tw.buttonPrimary}`}
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
