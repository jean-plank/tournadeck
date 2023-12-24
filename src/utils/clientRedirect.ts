'use server'

import type { LinkProps } from 'next/link'
import type { RedirectType } from 'next/navigation'
import { redirect } from 'next/navigation'

export async function clientRedirect<RouteInferType>(
  url: LinkProps<RouteInferType>['href'],
  type?: RedirectType,
): Promise<never> {
  return redirect(url, type)
}
