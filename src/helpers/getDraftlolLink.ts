'use server'

import { readonlyArray } from 'fp-ts'
import { tuple } from 'fp-ts/function'
import type { Browser } from 'puppeteer'
import puppeteer from 'puppeteer'

import { DayjsDuration } from '../models/Dayjs'
import type { TournamentId } from '../models/pocketBase/tables/Tournament'
import { ChampionId } from '../models/riot/ChampionId'
import { sleep } from '../utils/promiseUtils'

const baseUrl = 'https://draftlol.dawe.gg?opts=InQiOlswLDIsNCwxMywxNSwxLDMsNSwxMiwxNF0sInAiOjYw'

const argsEq = readonlyArray.getEq(ChampionId.Eq)

const cache: Map<TournamentId, Tuple<ReadonlyArray<ChampionId>, Promise<string>>> = new Map()

export async function getDraftlolLink(
  cacheForTournament: TournamentId,
  championsToBan: ReadonlyArray<ChampionId>,
): Promise<string> {
  const entry = cache.get(cacheForTournament)

  if (entry !== undefined && argsEq.equals(entry[0], championsToBan)) return entry[1]

  const res = uncachedGetDraftlolLink(championsToBan)

  cache.set(cacheForTournament, tuple(championsToBan, res))

  return await res
}

async function uncachedGetDraftlolLink(championsToBan: ReadonlyArray<ChampionId>): Promise<string> {
  if (!readonlyArray.isNonEmpty(championsToBan)) return baseUrl

  const browser = await puppeteer.launch({
    executablePath: process.env['PUPPETEER_EXECUTABLE_PATH'],
    headless: true,
    args: process.env.NODE_ENV === 'production' ? ['--no-sandbox'] : undefined,
    acceptInsecureCerts: true,
  })

  return draftlolLinkFromBrowser(browser, championsToBan).finally(async () => {
    const process = browser.process()

    if (process !== null) {
      process.kill('SIGINT')
    }
  })
}

async function draftlolLinkFromBrowser(
  browser: Browser,
  championsToBan: ReadonlyArray<ChampionId>,
): Promise<string> {
  const page = await browser.newPage()

  await page.goto(baseUrl)

  const advancedOptionsButtonSelector = '.advancedOptionsButton'

  /**
   * Open advanced options
   */

  const advancedOptionsButton = await page.waitForSelector(advancedOptionsButtonSelector)

  if (advancedOptionsButton === null) {
    throw Error('advancedOptionsButton was null')
  }

  await advancedOptionsButton.click()

  await sleep(DayjsDuration({ milliseconds: 10 }))

  /**
   * Ban champions
   */

  const championImgSelector = 'img.roomImgListItem'

  const roomImgListItem = await page.waitForSelector(championImgSelector)

  if (roomImgListItem === null) {
    throw Error('roomImgListItem was null')
  }

  const imgs = await page.$$(championImgSelector)

  const championImgSrcRegex = /\/([^\/]+)\.png\s*$/

  await Promise.all(
    imgs.map(async img => {
      const src = await page.evaluate(i => i.src, img)

      const match = src.match(championImgSrcRegex)

      if (match === null) return undefined

      const rawId = match[1]

      if (rawId === undefined) return undefined

      const id = ChampionId(rawId)

      if (!readonlyArray.elem(ChampionId.Eq)(id, championsToBan)) return undefined

      await page.evaluate(i => i.click(), img)
    }),
  )

  const championImgDisabledSelector = `${championImgSelector}[disabled]`

  await page.waitForSelector(championImgDisabledSelector)

  /**
   * Permanent link
   */

  const permanentLinkInputSelector = '.outputContainer > input:nth-child(1)'

  const permanentLinkInput = await page.waitForSelector(permanentLinkInputSelector)

  if (permanentLinkInput === null) {
    throw Error('permanentLinkInput was null')
  }

  return await page.evaluate(e => e.value, permanentLinkInput)
}
