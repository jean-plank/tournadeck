'use client'

import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'
import { FileInput, Input, SelectInput } from './FormInputs'

type Props = {
  tournamentId: string
}
const AttendeeForm: React.FC<Props> = ({ tournamentId }) => {
  const validate = (newInputs: Inputs): Errors => {
    const newErrors: Errors = {}

    //riotId
    const riotIdRegex = /^.{4,16}#[a-zA-Z0-9]{3,5}$/
    if (!riotIdRegex.test(newInputs.riotId)) {
      newErrors.riotId = 'Please enter a valid Riot ID'
    }
    //currentElo
    const rankRegex = /^(iron|bronze|silver|gold|platinium|emerald|diamond)\s*[1-4]$/
    if (!rankRegex.test(newInputs.currentElo)) {
      newErrors.currentElo =
        'Please enter a valid Elo (iron|bronze|silver|gold|platinium|emerald|diamond)[1-4]'
    }
    //PeakElo
    if (!rankRegex.test(newInputs.peakElo)) {
      newErrors.peakElo =
        'Please enter a valid Elo (iron|bronze|silver|gold|platinium|emerald|diamond)[1-4]'
    }
    //Role
    const roleRegex = /^(adc|jungle|mid|support|top)$/
    if (!roleRegex.test(newInputs.role)) {
      newErrors.role = 'Please enter a valid role (adc|jungle|mid|support|top)'
    }

    //Birthplace
    if (newInputs.birthPlace === '') {
      newErrors.birthPlace = 'Please enter a birthplace'
    }

    //Validate avatar

    if (newInputs.avatar === null) {
      newErrors.avatar = 'Please choose an avatar'
    }

    return newErrors
  }

  type Inputs = {
    riotId: string
    currentElo: string
    peakElo: string
    role: string
    championPool: string
    birthPlace: string
    avatar: File | null
  }
  const [inputs, setInputs] = useState<Inputs>({
    riotId: '',
    currentElo: '',
    peakElo: '',
    role: '',
    championPool: 'One trick poney',
    birthPlace: '',
    avatar: null,
  })
  const { pb, user } = usePocketBase()

  type Errors = Partial<Record<keyof Inputs, string>>
  const [errors, setErrors] = useState<Errors>(validate(inputs))

  type Touched = Partial<Record<keyof Inputs, boolean>>
  const [touched, setTouched] = useState<Touched>({})

  const handleChange = (key: keyof Inputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [key]: event.target.value })
    setErrors(validate({ ...inputs, [key]: event.target.value }))
  }
  const handleSelectChange =
    (key: keyof Inputs) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      setInputs({ ...inputs, [key]: event.target.value })
      setErrors(validate({ ...inputs, [key]: event.target.value }))
    }

  const handleBlur = (key: keyof Inputs) => () => {
    setTouched({ ...touched, [key]: true })
  }

  const handleFileChange = () => (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files !== null && files.length > 0) {
      const selected = files[0]
      setInputs({ ...inputs, avatar: selected })
      setErrors(validate({ ...inputs, avatar: selected }))
    }
  }

  const showErrorMsg = (key: keyof Inputs): boolean =>
    errors[key] !== undefined && touched[key] !== undefined

  const handleSubmit = () => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.preventDefault()

    let obj = {}
    for (const cle in inputs) {
      obj = { ...obj, [cle]: true }
    }

    setTouched(obj)

    setErrors(validate(inputs))

    if (Object.keys(errors).length === 0) {
      console.log(inputs)
      // Server call

      console.log(user)
      if (user !== null) {
        const data = {
          ...inputs,
          isCaptain: false,
          tournament: tournamentId,
          user: user.id,
          // "seed": 123,
          // "price": 123,
        }

        pb.collection('attendees')
          .create(data)
          .then(res => console.log(res))
          .catch(error => console.log(error))
      }
    }
  }

  return (
    <form
      className="flex w-[25rem] flex-col gap-3 rounded-lg border-2 border-gray-400 bg-white p-4"
      noValidate={true}
    >
      <Input
        id="riotId"
        label="Riot ID"
        type="text"
        placeholder="summonerName#TAG"
        onChange={handleChange('riotId')}
        onBlur={handleBlur('riotId')}
        errorMsg={errors.riotId ?? ''}
        showErrorMsg={showErrorMsg('riotId')}
      />
      <Input
        id="currentElo"
        label="Current Elo"
        type="text"
        placeholder="Platine 4"
        onChange={handleChange('currentElo')}
        onBlur={handleBlur('currentElo')}
        errorMsg={errors.currentElo ?? ''}
        showErrorMsg={showErrorMsg('currentElo')}
      />
      <Input
        id="peakElo"
        label="Peak Elo"
        type="text"
        placeholder="Platine 4"
        onChange={handleChange('peakElo')}
        onBlur={handleBlur('peakElo')}
        errorMsg={errors.peakElo ?? ''}
        showErrorMsg={showErrorMsg('peakElo')}
      />
      <Input
        id="role"
        label="Role"
        type="text"
        placeholder="adc"
        onChange={handleChange('role')}
        onBlur={handleBlur('role')}
        errorMsg={errors.role ?? ''}
        showErrorMsg={showErrorMsg('role')}
      />
      {
        <SelectInput
          id="championPool"
          label="Champion Pool"
          value={inputs['championPool']}
          values={['One trick poney', 'Limité', 'Modeste', 'Pas mal', 'Ça fait beaucoup la non']}
          onChange={handleSelectChange('championPool')}
          errorMsg={errors.championPool ?? ''}
          showErrorMsg={showErrorMsg('championPool')}
        />
      }

      <Input
        id="birthPlace"
        label="Birthplace"
        type="text"
        placeholder="birthPlace"
        onChange={handleChange('birthPlace')}
        onBlur={handleBlur('birthPlace')}
        errorMsg={errors.birthPlace ?? ''}
        showErrorMsg={showErrorMsg('birthPlace')}
      />

      <FileInput
        id="avatar"
        label="Avatar"
        type="file"
        placeholder="avatar"
        onChange={handleFileChange()}
        errorMsg={errors.avatar ?? ''}
        showErrorMsg={showErrorMsg('birthPlace')}
      />

      <button
        type="button"
        className="
        rounded-full
        bg-blue-500
        px-4
        py-2
        font-bold
        text-white
        hover:bg-blue-700"
        onClick={handleSubmit()}
      >
        Validate
      </button>
    </form>
  )
}

export default AttendeeForm
