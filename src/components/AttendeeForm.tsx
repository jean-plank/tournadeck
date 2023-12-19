'use client'

import { comment } from 'postcss'
import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { usePocketBase } from '../contexts/PocketBaseContext'
import { LolElo } from '../models/LolElo'
import { TeamRole } from '../models/TeamRole'
import { FileInput, Input, SelectInput } from './FormInputs'

type Props = {
  tournamentId: string
  onSuscribeOk: () => void
}
type Inputs = {
  riotId: string
  currentElo: LolElo
  comment: string
  role: TeamRole
  championPool: string
  birthPlace: string
  avatar: File | null
}
type Errors = Partial<Record<keyof Inputs, string>>
type Touched = Partial<Record<keyof Inputs, boolean>>

const AttendeeForm: React.FC<Props> = ({ tournamentId, onSuscribeOk }) => {
  const validate = (newInputs: Inputs): Errors => {
    const newErrors: Errors = {}

    // RiotId
    const riotIdRegex = /^.{4,16}#[a-zA-Z0-9]{3,5}$/
    if (!riotIdRegex.test(newInputs.riotId)) {
      newErrors.riotId = 'Please enter a valid Riot ID'
    }

    // Comment
    if (comment.length > 50) {
      newErrors.comment = 'Please a comment under 50 characters'
    }

    // BirthPlace
    if (newInputs.birthPlace === '') {
      newErrors.birthPlace = 'Please enter a birthplace'
    }

    // Avatar
    if (newInputs.avatar === null) {
      newErrors.avatar = 'Please choose an avatar'
    }

    return newErrors
  }

  const [inputs, setInputs] = useState<Inputs>({
    riotId: '',
    currentElo: LolElo.values[0],
    comment: '',
    role: TeamRole.values[0],
    championPool: 'One trick poney',
    birthPlace: '',
    avatar: null,
  })
  const { pb, user } = usePocketBase()

  const [submitError, setSubmitError] = useState<null | string>(null)

  const errors = validate(inputs)

  const [touched, setTouched] = useState<Touched>({})

  const handleChange = (key: keyof Inputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputs({ ...inputs, [key]: event.target.value })
  }
  const handleSelectChange =
    (key: keyof Inputs) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      setInputs({ ...inputs, [key]: event.target.value })
    }

  const handleBlur = (key: keyof Inputs) => () => {
    setTouched({ ...touched, [key]: true })
  }

  const handleFileChange = () => (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files !== null && files.length > 0) {
      const selected = files[0]
      setInputs({ ...inputs, avatar: selected })
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

    if (Object.keys(errors).length === 0) {
      if (user !== null) {
        const data = {
          ...inputs,
          isCaptain: false,
          tournament: tournamentId,
          user: user.id,
        }

        pb.collection('attendees')
          .create(data)
          .then(() => onSuscribeOk())
          .catch(() => setSubmitError('An unkwoned error appened'))
      }
    }
  }

  return (
    <form
      className="flex w-[26rem] flex-col gap-3 rounded-lg border-2 border-gray-400 bg-white p-4"
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
      {
        <SelectInput
          id="currentElo"
          label="Current Elo"
          value={inputs['currentElo']}
          values={LolElo.values}
          valuesLabels={LolElo.values.map(v => LolElo.label[v])}
          onChange={handleSelectChange('currentElo')}
          errorMsg={errors.currentElo ?? ''}
          showErrorMsg={showErrorMsg('currentElo')}
        />
      }
      <Input
        id="comment"
        label="Quelque chose à préciser sur cet elo minable ?"
        type="text"
        placeholder="c'est à cause de mes mates !"
        onChange={handleChange('comment')}
        onBlur={handleBlur('comment')}
        errorMsg={errors.comment ?? ''}
        showErrorMsg={showErrorMsg('comment')}
      />

      {
        <SelectInput
          id="role"
          label="Role"
          value={inputs['role']}
          values={TeamRole.values}
          valuesLabels={TeamRole.values.map(v => TeamRole.label[v])}
          onChange={handleSelectChange('role')}
          errorMsg={errors.role ?? ''}
          showErrorMsg={showErrorMsg('role')}
        />
      }
      {
        <SelectInput
          id="championPool"
          label="Champion Pool"
          value={inputs['championPool']}
          values={['One trick poney', 'Limité', 'Modeste', 'Pas mal', 'Ça fait beaucoup la non']}
          valuesLabels={[
            'One trick poney',
            'Limité',
            'Modeste',
            'Pas mal',
            'Ça fait beaucoup la non',
          ]}
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
        className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={handleSubmit()}
      >
        Validate
      </button>
      {submitError !== null && <p className="text-red-400">{submitError}</p>}
    </form>
  )
}

export default AttendeeForm
