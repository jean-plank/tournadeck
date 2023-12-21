'use client'

import { readonlyRecord } from 'fp-ts'
import type { ChangeEvent } from 'react'
import { useCallback, useState } from 'react'

import { FileInput, Input, SelectInput } from '../../../components/FormInputs'
import { usePocketBase } from '../../../contexts/PocketBaseContext'
import { ChampionPool } from '../../../models/ChampionPool'
import { LolElo } from '../../../models/LolElo'
import { TeamRole } from '../../../models/TeamRole'

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

type Props = {
  tournamentId: string
  onSuscribeOk: () => void
}

export const AttendeeForm: React.FC<Props> = ({ tournamentId, onSuscribeOk }) => {
  const { pb, user } = usePocketBase()

  const [inputs, setInputs] = useState<Inputs>({
    riotId: '',
    currentElo: LolElo.values[0],
    comment: '',
    role: TeamRole.values[0],
    championPool: 'Une compétence cheval',
    birthPlace: '',
    avatar: null,
  })

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

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>): void => {
      event.preventDefault()

      const obj = readonlyRecord
        .keys(inputs)
        .reduce<Touched>((acc, key) => ({ ...acc, [key]: true }), {})

      setTouched(obj)

      const errors_ = validate(inputs)

      if (Object.keys(errors_).length === 0) {
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
            .catch(() => setSubmitError('Une erreur inconnue est survenue'))
        }
      }
    },
    [inputs, onSuscribeOk, pb, tournamentId, user],
  )

  return (
    <form
      className="flex w-[26rem] flex-col gap-3 rounded-lg border-2 border-gray-400 bg-white p-4"
      onSubmit={handleSubmit}
    >
      <Input
        label="Riot ID"
        type="text"
        placeholder="summonerName#TAG"
        onChange={handleChange('riotId')}
        onBlur={handleBlur('riotId')}
        errorMsg={errors.riotId ?? ''}
        showErrorMsg={showErrorMsg('riotId')}
      />

      <SelectInput
        label="Niveau actuel"
        value={inputs['currentElo']}
        values={LolElo.values}
        valuesLabels={LolElo.values.map(v => LolElo.label[v])}
        onChange={handleSelectChange('currentElo')}
        errorMsg={errors.currentElo ?? ''}
        showErrorMsg={showErrorMsg('currentElo')}
      />

      <Input
        label="Quelque chose à préciser sur cet elo minable ?"
        type="text"
        placeholder="C'est à cause de mes mates !"
        onChange={handleChange('comment')}
        onBlur={handleBlur('comment')}
        errorMsg={errors.comment ?? ''}
        showErrorMsg={showErrorMsg('comment')}
      />

      <SelectInput
        label="Rôle"
        value={inputs['role']}
        values={TeamRole.values}
        valuesLabels={TeamRole.values.map(v => TeamRole.label[v])}
        onChange={handleSelectChange('role')}
        errorMsg={errors.role ?? ''}
        showErrorMsg={showErrorMsg('role')}
      />

      <SelectInput
        label="Piscine de champions"
        value={inputs['championPool']}
        values={ChampionPool.values}
        valuesLabels={ChampionPool.values.map(v => ChampionPool.label[v])}
        onChange={handleSelectChange('championPool')}
        errorMsg={errors.championPool ?? ''}
        showErrorMsg={showErrorMsg('championPool')}
      />

      <Input
        label="Lieu de naissance"
        type="text"
        placeholder="Lieu de naissance"
        onChange={handleChange('birthPlace')}
        onBlur={handleBlur('birthPlace')}
        errorMsg={errors.birthPlace ?? ''}
        showErrorMsg={showErrorMsg('birthPlace')}
      />

      <FileInput
        label="Photo de votre épouvantable faciès"
        placeholder="Avatar"
        onChange={handleFileChange()}
        errorMsg={errors.avatar ?? ''}
        showErrorMsg={showErrorMsg('birthPlace')}
      />

      <button
        type="submit"
        className="rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      >
        Valider
      </button>

      {submitError !== null && <p className="text-red-400">{submitError}</p>}
    </form>
  )
}

const riotIdRegex = /^.{4,16}#[a-zA-Z0-9]{3,5}$/

const validate = (newInputs: Inputs): Errors => {
  const newErrors: Errors = {}

  // RiotId
  if (!riotIdRegex.test(newInputs.riotId)) {
    newErrors.riotId = 'Merci de saisir un Riot ID correct'
  }

  // Comment
  if (newInputs.comment.length > 50) {
    newErrors.comment = 'Merci de saisir un commentaire de moins de 50 caracters'
  }

  // BirthPlace
  if (newInputs.birthPlace === '') {
    newErrors.birthPlace = 'Merci de saisir votre lieu de naissance'
  }

  // Avatar
  if (newInputs.avatar === null) {
    newErrors.avatar = 'Merci de choisir un avatar'
  }

  return newErrors
}
