type InputProps = {
  label: string
  type: React.HTMLInputTypeAttribute
  placeholder: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  errorMsg: string
  showErrorMsg: boolean
  required?: boolean
  maxLength?: number
}

const inputClassName =
  'outline-none w-full rounded-md border border-blue1 p-2 font-medium placeholder:text-opacity-60 focus-visible:border-2'
const inputErrorClassName = 'text-red-500 text-xs'

export const Input: React.FC<InputProps> = ({
  label,
  errorMsg,
  showErrorMsg,
  required = false,
  maxLength,
  ...props
}) => (
  <label className="flex w-full flex-col gap-2">
    <div className="font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </div>

    <input {...props} maxLength={maxLength} className={inputClassName} />

    {showErrorMsg && <p className={inputErrorClassName}>{errorMsg}</p>}
  </label>
)

type FileProps = {
  label: string
  placeholder: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  errorMsg: string
  showErrorMsg: boolean
  required: boolean
}

export const FileInput: React.FC<FileProps> = ({
  label,
  errorMsg,
  showErrorMsg,
  required,
  ...props
}) => (
  <label className="flex w-full flex-col gap-2">
    <div className="font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </div>

    <input {...props} type="file" accept="image/*" className={inputClassName} />

    {showErrorMsg && <p className={inputErrorClassName}>{errorMsg}</p>}
  </label>
)

type SelectProps = {
  label: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  errorMsg: string
  showErrorMsg: boolean
  value: Optional<string>
  values: ReadonlyArray<string>
  valuesLabels: ReadonlyArray<string>
  required: boolean
}

export const SelectInput: React.FC<SelectProps> = ({
  value,
  values,
  valuesLabels,
  label,
  onChange,
  errorMsg,
  showErrorMsg,
  required,
}) => (
  <label className="flex w-full flex-col gap-2" aria-required={required}>
    <div className="font-semibold">
      {label} {required && <span className="text-red-500">*</span>}
    </div>

    <select value={value} onChange={onChange} className={inputClassName}>
      {value === undefined && <option />}

      {values.map((v, i) => (
        <option key={v} value={v}>
          {valuesLabels[i]}
        </option>
      ))}
    </select>

    {showErrorMsg && <p className={inputErrorClassName}>{errorMsg}</p>}
  </label>
)
