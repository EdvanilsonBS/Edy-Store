/**
 * <FormField /> - campo de formulário com rótulo e mensagem de erro
 * Props: label, error (texto do erro) e qualquer atributo de <input> (type, value, onChange, placeholder...)
 * Usado nas páginas de Login e Cadastro.
 */
import { useId } from 'react'
import './styles.css'

const FormField = ({ label, error, ...inputProps }) => {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <span id={errorId} className="form-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default FormField
