import { useState } from 'react'

type Props = {
  label: string
  type: string
  id: string
  placeholder: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  errorMsg: string
  showErrorMsg: boolean
}
type FileProps = {
  label: string
  type: string
  id: string
  placeholder: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  errorMsg: string
  showErrorMsg: boolean
}

type SelectProps = {
  label: string
  id: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  errorMsg: string
  showErrorMsg: boolean
  value: string
  values: string[]
}

export const Input: React.FC<Props> = ({
  id,
  label,
  type,
  onChange,
  onBlur,
  errorMsg,
  placeholder,
  showErrorMsg,
}) => (
  <div className="flex w-full flex-col gap-2">
    <div className="flex justify-between">
      <label htmlFor={id} className="font-semibold capitalize">
        {label}
      </label>
    </div>
    <input
      id={id}
      onChange={onChange}
      onBlur={onBlur}
      type={type}
      className="w-full rounded-md border border-slate-300 p-5 font-medium placeholder:text-opacity-60"
      placeholder={placeholder}
    />
    {showErrorMsg && <p className="text-red-500">{errorMsg}</p>}
  </div>
)

export const FileInput: React.FC<FileProps> = ({
  id,
  label,
  type,
  onChange,
  errorMsg,
  placeholder,
  showErrorMsg,
}) => (
  <div className="flex w-full flex-col gap-2">
    <div className="flex justify-between">
      <label htmlFor={id} className="font-semibold capitalize">
        {label}
      </label>
    </div>
    <input
      id={id}
      onChange={onChange}
      type={type}
      accept="image/*"
      className="w-full rounded-md border border-slate-300 p-5 font-medium placeholder:text-opacity-60"
      placeholder={placeholder}
    />
    {showErrorMsg && <p className="text-red-500">{errorMsg}</p>}
  </div>
)

export const SelectInput: React.FC<SelectProps> = ({
  id,
  value,
  values,
  label,
  onChange,
  errorMsg,
  showErrorMsg,
}) => (
  <div className="flex w-full flex-col gap-2">
    <div className="flex justify-between">
      <label htmlFor={id} className="font-semibold capitalize">
        {label}
      </label>
    </div>
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full rounded-md border border-slate-300 p-5 font-medium "
    >
      {values.map(v => (
        <option key={v} value={v}>
          {v}
        </option>
      ))}
    </select>

    {showErrorMsg && <p className="text-red-500">{errorMsg}</p>}
  </div>
)
