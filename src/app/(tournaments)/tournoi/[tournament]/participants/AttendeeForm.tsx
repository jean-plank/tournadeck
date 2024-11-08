'use client'

import type { ChangeEvent } from 'react'
import { useCallback, useState } from 'react'

import { createAttendee } from '../../../../../actions/createAttendee'
import { FileInput, Input, SelectInput } from '../../../../../components/FormInputs'
import { ChampionPool } from '../../../../../models/ChampionPool'
import { LolElo } from '../../../../../models/LolElo'
import { TeamRole } from '../../../../../models/TeamRole'
import type { TournamentId } from '../../../../../models/pocketBase/tables/Tournament'
import { objectEntries, objectKeys } from '../../../../../utils/fpTsUtils'

const maxLength = 50

type Inputs = {
  riotId: string
  currentElo: LolElo | undefined
  comment: string
  role: TeamRole | undefined
  championPool: ChampionPool | undefined
  birthplace: string
  avatar: File | undefined
}

type Errors = Partial<Record<keyof Inputs, string>>

type Touched = Partial<ReadonlyRecord<keyof Inputs, boolean>>

const inputsEmpty: Inputs = {
  riotId: '',
  currentElo: undefined,
  comment: '',
  role: undefined,
  championPool: undefined,
  birthplace: '',
  avatar: undefined,
}

const keys = objectKeys(inputsEmpty)

type Props = {
  tournament: TournamentId
  handleCancelClick: () => void
  onSubscribeOk: () => void
  avalaibleTeamRole: ReadonlyArray<TeamRole>
}

export const AttendeeForm: React.FC<Props> = ({
  tournament,
  avalaibleTeamRole,
  handleCancelClick,
  onSubscribeOk,
}) => {
  const [inputs, setInputs] = useState(inputsEmpty)

  const errors = validate(inputs)

  const [touched, setTouched] = useState<Touched>({})

  const [submitError, setSubmitError] = useState<Optional<string>>(undefined)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)

  const handleChange = (key: keyof Inputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputs(i => ({ ...i, [key]: event.target.value }))
  }
  const handleSelectChange =
    (key: keyof Inputs) => (event: React.ChangeEvent<HTMLSelectElement>) => {
      setInputs(i => ({ ...i, [key]: event.target.value }))
    }

  const handleBlur = (key: keyof Inputs) => () => {
    setTouched(t => ({ ...t, [key]: true }))
  }

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files !== null && files.length > 0) {
      const selected = files[0]!

      setInputs(i => ({ ...i, avatar: selected }))
      // Image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selected)
    }
  }, [])

  const showErrorMsg = (key: keyof Inputs): boolean =>
    errors[key] !== undefined && touched[key] !== undefined

  const handleSubmit = useCallback(() => {
    const obj = keys.reduce<Touched>((acc, key) => ({ ...acc, [key]: true }), {})

    setTouched(obj)

    const errors_ = validate(inputs)

    if (Object.keys(errors_).length === 0) {
      const formData = new FormData()

      objectEntries(inputs).forEach(([key, val]) => {
        formData.set(key, val)
      })

      createAttendee(tournament, formData)
        .then(onSubscribeOk)
        .catch(() =>
          setSubmitError(
            'Erreur serveur. Le Riot ID est-il correct ? L’avatar fait-il moins de 5,2 Mo ?',
          ),
        )
    }
  }, [inputs, onSubscribeOk, tournament])

  return (
    <form
      action={handleSubmit}
      className="flex min-w-[416px] flex-col gap-3 rounded-lg border-2 border-goldenrod bg-white1 p-4"
    >
      <Input
        label="Riot ID"
        type="text"
        placeholder="SummonerName#TAG"
        onChange={handleChange('riotId')}
        onBlur={handleBlur('riotId')}
        errorMsg={errors.riotId ?? ''}
        showErrorMsg={showErrorMsg('riotId')}
        required={true}
      />

      <SelectInput
        label="Niveau actuel"
        value={inputs.currentElo}
        values={LolElo.values}
        valuesLabels={LolElo.values.map(v => LolElo.label[v])}
        onChange={handleSelectChange('currentElo')}
        errorMsg={errors.currentElo ?? ''}
        showErrorMsg={showErrorMsg('currentElo')}
        required={true}
      />

      <Input
        label="Quelque chose à préciser sur cet elo minable ?"
        type="text"
        placeholder="C’est à cause de mes mates !"
        onChange={handleChange('comment')}
        onBlur={handleBlur('comment')}
        errorMsg={errors.comment ?? ''}
        showErrorMsg={showErrorMsg('comment')}
        maxLength={maxLength}
      />

      <SelectInput
        label="Rôle"
        value={inputs.role}
        values={avalaibleTeamRole}
        valuesLabels={avalaibleTeamRole.map(v => TeamRole.label[v])}
        onChange={handleSelectChange('role')}
        errorMsg={errors.role ?? ''}
        showErrorMsg={showErrorMsg('role')}
        required={true}
      />

      <SelectInput
        label="Piscine de champions"
        value={inputs.championPool}
        values={ChampionPool.values}
        valuesLabels={ChampionPool.values.map(v => ChampionPool.label[v])}
        onChange={handleSelectChange('championPool')}
        errorMsg={errors.championPool ?? ''}
        showErrorMsg={showErrorMsg('championPool')}
        required={true}
      />

      <Input
        label="Lieu de naissance"
        type="text"
        placeholder="Lieu de naissance"
        onChange={handleChange('birthplace')}
        onBlur={handleBlur('birthplace')}
        errorMsg={errors.birthplace ?? ''}
        showErrorMsg={showErrorMsg('birthplace')}
        required={true}
        maxLength={maxLength}
      />

      <FileInput
        label="Photo de votre épouvantable faciès"
        placeholder="Avatar"
        onChange={handleFileChange}
        errorMsg={errors.avatar ?? ''}
        showErrorMsg={showErrorMsg('birthplace')}
        required={true}
      />
      {avatarPreviewUrl !== null && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="mr-1 size-36 rounded-r-lg border-2 border-goldenrod object-cover"
          alt="avatar-preview"
          src={avatarPreviewUrl}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className="rounded-full border-2 border-goldenrod-bis px-3.5 py-1.5"
          onClick={handleCancelClick}
        >
          Annuler
        </button>

        <button
          type="submit"
          className="rounded-full bg-goldenrod px-4 py-2 font-bold text-white hover:text-black"
        >
          Valider
        </button>
      </div>

      {submitError !== undefined && <p className="text-red-500">{submitError}</p>}
    </form>
  )
}

const riotIdRegex = /^.{4,16}#[a-zA-Z0-9]{3,5}$/

function validate(inputs: Inputs): Errors {
  const newErrors: Errors = {}

  // Riot id
  if (!riotIdRegex.test(inputs.riotId)) {
    newErrors.riotId = 'Merci de saisir un Riot ID correct'
  }

  // Current elo
  if (inputs.currentElo === undefined) {
    newErrors.currentElo = 'Merci de saisir votre niveau actuel'
  }

  // Comment
  if (inputs.comment.trim().length > maxLength) {
    newErrors.comment = `Merci de saisir un commentaire de moins de ${maxLength} caractères`
  }

  // Role
  if (inputs.role === undefined) {
    newErrors.role = 'Merci de saisir votre rôle pour le tournoi'
  }

  // Champion pool
  if (inputs.championPool === undefined) {
    newErrors.championPool = 'Merci de préciser la taille de votre piscine'
  }

  // Birth place
  if (inputs.birthplace.trim() === '') {
    newErrors.birthplace = 'Merci de saisir votre lieu de naissance'
  }
  if (inputs.birthplace.trim().length > maxLength) {
    newErrors.birthplace = `Merci de saisir un lieu de naissance de moins de ${maxLength} caractères`
  }

  // Avatar
  if (inputs.avatar === undefined) {
    newErrors.avatar = 'Merci de choisir un avatar'
  }

  return newErrors
}
