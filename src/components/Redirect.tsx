import type { LinkProps } from 'next/link'
import type { RedirectType } from 'next/navigation'
import { redirect } from 'next/navigation'

type Props<RouteInferType> = {
  url: LinkProps<RouteInferType>['href']
  type?: RedirectType
}

export function Redirect<RouteInferType>({ url, type }: Props<RouteInferType>): never {
  return redirect(url, type)
}
