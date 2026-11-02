/**
 * PÁGINA DE LISTAGEM DE PRODUTOS (rota "/products", também aceita "/produtos")
 * Tem: "Ordenar por", filtros (Marca, Categoria, Gênero, Estado) e a lista de resultados.
 *
 * COMO FUNCIONA:
 *   - A busca vem da URL (?filter=nike), preenchida pelo campo de busca do Header.
 *   - `sort` e `filters` são estados desta página; a lista final sai de filterProducts()
 *     (src/utils/filterProducts.js).
 *
 * COMO EDITAR:
 *   - As opções dos filtros são montadas automaticamente a partir dos produtos
 *     (src/data/products.js). Produto com marca nova => a marca aparece no filtro.
 *   - Para criar um novo grupo de filtro, veja o passo a passo em utils/filterProducts.js.
 */
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from './Layout'
import Section from '../components/Section'
import ProductListing from '../components/ProductListing'
import FilterGroup from '../components/FilterGroup'
import { products } from '../data/products'
import { filterProducts } from '../utils/filterProducts'
import './ProductListingPage.css'

// Lista os valores diferentes de um campo (ex.: todas as marcas), em ordem alfabética.
const unique = (key) => [...new Set(products.map((product) => product[key]))].sort()
const toOptions = (values) => values.map((text) => ({ text, value: text }))

const brandOptions = toOptions(unique('brand'))
const categoryOptions = toOptions(unique('category'))
const genderOptions = toOptions(unique('gender'))
// O grupo "Estado" é radio, então precisa da opção "Todos" para desfazer a escolha.
const stateOptions = [{ text: 'Todos', value: 'all' }, ...toOptions(unique('state'))]

// Estado inicial dos filtros (nada marcado). Também usado pelo botão "Limpar filtros".
const emptyFilters = { brand: [], category: [], gender: [], state: 'all' }

const ProductListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('filter') ?? ''

  // 'asc' = menor preço primeiro (padrão). Para começar do maior preço, use 'desc'.
  const [sort, setSort] = useState('asc')
  const [filters, setFilters] = useState(emptyFilters)

  // Marca/desmarca um valor dentro de um grupo (ex.: adiciona ou tira "Nike" de brand).
  const toggle = (group) => (value, checked) =>
    setFilters((current) => ({
      ...current,
      [group]: checked
        ? [...current[group], value]
        : current[group].filter((item) => item !== value),
    }))

  // Recalcula a lista só quando busca, filtros ou ordenação mudam.
  const visibleProducts = useMemo(
    () => filterProducts(products, { search, filters, sort }),
    [search, filters, sort]
  )

  const total = visibleProducts.length
  // Título da seção: "1 produto encontrado" / "12 produtos encontrados"
  const title = `${total} produto${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}`

  return (
    <Layout>
      <div className="container listing">
        <aside className="listing__sidebar">
          {/* Campo "Ordenar por" (308x60). Para novas ordens, adicione <option> e trate em filterProducts.js */}
          <div className="listing__sort">
            <label htmlFor="sort">Ordenar por</label>
            <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="asc">Menor preço</option>
              <option value="desc">Maior preço</option>
            </select>
          </div>

          <div className="listing__filters">
            <h2>Filtrar por</h2>
            <hr />
            <FilterGroup
              title="Marca"
              inputType="checkbox"
              options={brandOptions}
              selected={filters.brand}
              onChange={toggle('brand')}
            />
            <FilterGroup
              title="Categoria"
              inputType="checkbox"
              options={categoryOptions}
              selected={filters.category}
              onChange={toggle('category')}
            />
            <FilterGroup
              title="Gênero"
              inputType="checkbox"
              options={genderOptions}
              selected={filters.gender}
              onChange={toggle('gender')}
            />
            <FilterGroup
              title="Estado"
              inputType="radio"
              name="state"
              options={stateOptions}
              selected={filters.state}
              onChange={(value) => setFilters((current) => ({ ...current, state: value }))}
            />
            <button type="button" className="listing__clear" onClick={() => setFilters(emptyFilters)}>
              Limpar filtros
            </button>
          </div>
        </aside>

        <div className="listing__results">
          <Section title={title} titleAlign="left">
            {search && (
              <p className="listing__query">
                Resultados para “{search}”{' '}
                <button type="button" onClick={() => setSearchParams({})}>
                  Limpar busca
                </button>
              </p>
            )}
            <ProductListing
              products={visibleProducts}
              columns={3}
              emptyMessage="Nenhum produto encontrado com esses filtros."
            />
          </Section>
        </div>
      </div>
    </Layout>
  )
}

export default ProductListingPage
