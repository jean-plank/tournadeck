export type ChildrenFC<A extends Record<PropertyKey, unknown> = Record<string, never>> = React.FC<
  A & { children?: React.ReactNode }
>
