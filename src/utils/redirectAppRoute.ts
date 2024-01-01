import type { LinkProps } from 'next/link'
import type { RedirectType } from 'next/navigation'
import { redirect } from 'next/navigation'

export const redirectAppRoute = redirect as <RouteInferType>(
  url: LinkProps<RouteInferType>['href'],
  type?: RedirectType,
) => never
