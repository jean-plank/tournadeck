type InputProps = {
  label: string
  type: React.HTMLInputTypeAttribute
  placeholder: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  errorMsg: string
  showErrorMsg: boolean
}

export const Input: React.FC<InputProps> = ({ label, errorMsg, showErrorMsg, ...props }) => (
  <label className="flex w-full flex-col gap-2">
    <div className="flex justify-between font-semibold">{label}</div>

    <input
      {...props}
      className="w-full rounded-md border border-slate-400 p-2 font-medium placeholder:text-opacity-60"
    />

    {showErrorMsg && <p className="text-red-500">{errorMsg}</p>}
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

    <input
      {...props}
      type="file"
      accept="image/*"
      className="w-full rounded-md border border-slate-400 p-2 font-medium placeholder:text-opacity-60"
    />

    {showErrorMsg && <p className="text-red-500">{errorMsg}</p>}
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

    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-md border border-slate-400 p-2 font-medium placeholder:text-opacity-60"
    >
      {values.map((v, i) => (
        <option key={v} value={v}>
          {valuesLabels[i]}
        </option>
      ))}
    </select>

    {showErrorMsg && <p className="text-red-500">{errorMsg}</p>}
  </label>
)
