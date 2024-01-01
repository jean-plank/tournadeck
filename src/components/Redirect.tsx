import type { LinkProps } from 'next/link'
import { type RedirectType, redirect } from 'next/navigation'

import { redirectAppRoute } from '../utils/redirectAppRoute'

type RedirectProps = {
  url: string
  type?: RedirectType
}

export const Redirect: React.FC<RedirectProps> = ({ url, type }) => redirect(url, type)

type RedirectAppRouteProps<RouteInferType> = {
  url: LinkProps<RouteInferType>['href']
  type?: RedirectType
}

export function RedirectAppRoute<RouteInferType>({
  url,
  type,
}: RedirectAppRouteProps<RouteInferType>): never {
  return redirectAppRoute(url, type)
}
