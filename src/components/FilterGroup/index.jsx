/**
 * <FilterGroup /> - um grupo de caixinhas (checkbox) ou bolinhas (radio) da barra de filtros
 * Props:
 *   title      título do grupo (ex.: "Marca")
 *   inputType  'checkbox' (várias opções) ou 'radio' (uma só)
 *   options    [{ text: 'Nike', value: 'Nike' }, ...]  (se não tiver value, usa o text)
 *   name       (radio) nome do grupo
 *   selected   o que está marcado: lista (checkbox) ou texto (radio)
 *   onChange   função chamada ao marcar/desmarcar: onChange(valor, marcado)
 * Se `selected` não for passado, o grupo funciona sem controle externo.
 */
import { useId } from 'react'
import './styles.css'

// `selected`: array (checkbox) ou string (radio). Se não for passado, o grupo é não controlado.
const FilterGroup = ({ title, inputType = 'checkbox', options = [], name, selected, onChange }) => {
  const groupId = useId()
  const groupName = name ?? groupId
  const controlled = selected !== undefined

  const isChecked = (value) =>
    inputType === 'checkbox' ? selected.includes(value) : selected === value

  return (
    <fieldset className="filter-group">
      <legend className="filter-group__title">{title}</legend>
      {options.map((option, index) => {
        const value = option.value ?? option.text
        const id = `${groupId}-${index}`
        return (
          <label className="filter-group__option" htmlFor={id} key={id}>
            <input
              id={id}
              type={inputType}
              name={groupName}
              value={value}
              {...(controlled ? { checked: isChecked(value) } : {})}
              onChange={(event) => onChange?.(value, event.target.checked)}
            />
            <span>{option.text}</span>
          </label>
        )
      })}
    </fieldset>
  )
}

export default FilterGroup
