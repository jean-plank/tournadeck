type InputProps = {
  label: string
  type: React.HTMLInputTypeAttribute
  placeholder: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  errorMsg: string
  showErrorMsg: boolean
}

const inputClassName =
  'outline-none w-full rounded-md border border-blue1 p-2 font-medium placeholder:text-opacity-60 focus-visible:border-2'
const inputErrorClassName = 'text-red-500 text-xs'

export const Input: React.FC<InputProps> = ({ label, errorMsg, showErrorMsg, ...props }) => (
  <label className="flex w-full flex-col gap-2">
    <div className="flex justify-between font-semibold">{label}</div>

    <input {...props} className={inputClassName} />

    {showErrorMsg && <p className={inputErrorClassName}>{errorMsg}</p>}
  </label>
)

type FileProps = {
  label: string
  placeholder: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  errorMsg: string
  showErrorMsg: boolean
}

export const FileInput: React.FC<FileProps> = ({ label, errorMsg, showErrorMsg, ...props }) => (
  <label className="flex w-full flex-col gap-2">
    <div className="flex justify-between font-semibold">{label}</div>

    <input {...props} type="file" accept="image/*" className={inputClassName} />

    {showErrorMsg && <p className={inputErrorClassName}>{errorMsg}</p>}
  </label>
)

type SelectProps = {
  label: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  errorMsg: string
  showErrorMsg: boolean
  value: string
  values: ReadonlyArray<string>
  valuesLabels: ReadonlyArray<string>
}

export const SelectInput: React.FC<SelectProps> = ({
  value,
  values,
  valuesLabels,
  label,
  onChange,
  errorMsg,
  showErrorMsg,
}) => (
  <label className="flex w-full flex-col gap-2">
    <div className="flex justify-between font-semibold">{label}</div>

    <select value={value} onChange={onChange} className={inputClassName}>
      {values.map((v, i) => (
        <option key={v} value={v}>
          {valuesLabels[i]}
        </option>
      ))}
    </select>

    {showErrorMsg && <p className={inputErrorClassName}>{errorMsg}</p>}
  </label>
)
