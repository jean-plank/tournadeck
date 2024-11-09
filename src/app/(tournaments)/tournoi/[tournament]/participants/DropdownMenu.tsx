import {
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
} from '@floating-ui/react'
import * as React from 'react'

const MenuContext = React.createContext<{
  getItemProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>
  activeIndex: number | null
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>
  setHasFocusInside: React.Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
}>({
  getItemProps: () => ({}),
  activeIndex: null,
  setActiveIndex: () => undefined,
  setHasFocusInside: () => undefined,
  isOpen: false,
})

type MenuProps = {
  label: string
  nested?: boolean
  children?: React.ReactNode
}

// --highlighted: royalblue;
// --active-unfocused: #d7dce5;

// .RootMenu {
//   padding: 6px 14px;
//   border: none;
//   font-size: 16px;
//   background: none;
//   border-radius: 6px;
//   border: 1px solid var(--active-unfocused);
// }

// .RootMenu[data-open],
// .RootMenu:hover {
//   background: var(--active-unfocused);
// }

const rootMenuClassName =
  'py-1.5 px-3.5 bg-none rounded-md border border-[#d7dce5] data-[open]:bg-[royalblue]'

// .Menu {
//   background: rgba(255, 255, 255, 0.8);
//   -webkit-backdrop-filter: blur(10px);
//   backdrop-filter: blur(10px);
//   padding: 4px;
//   border-radius: 6px;
//   box-shadow: 2px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.1);
//   outline: 0;
// }

const menuClassName = 'bg-white p-1 rounded-md text-black shadow shadow-black'

// .MenuItem {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   background: none;
//   width: 100%;
//   border: none;
//   border-radius: 4px;
//   font-size: 16px;
//   text-align: left;
//   line-height: 1.8;
//   min-width: 110px;
//   margin: 0;
//   outline: 0;
// }

// .MenuItem:focus {
//   background: var(--highlighted);
//   color: white;
// }

// .MenuItem[data-nested][data-open]:not([data-focus-inside]) {
//   background: var(--highlighted);
//   color: white;
// }

// .MenuItem[data-focus-inside][data-open] {
//   background: var(--active-unfocused);
// }

const menuItemClassName =
  'flex justify-between items-center bg-none w-full border-none rounded text-left min-w-28 m-0 focus:bg-[royalblue] focus:text-white data-[focus-inside]:data-[open]:bg-[#d7dce5]'

export const MenuComponent = React.forwardRef<
  HTMLButtonElement,
  MenuProps & React.HTMLProps<HTMLButtonElement>
>(({ children, label, ...props }, forwardedRef) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hasFocusInside, setHasFocusInside] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)

  const elementsRef = React.useRef<(HTMLButtonElement | null)[]>([])
  const labelsRef = React.useRef<(string | null)[]>([])
  const parent = React.useContext(MenuContext)

  const tree = useFloatingTree()
  const nodeId = useFloatingNodeId()
  const parentId = useFloatingParentNodeId()
  const item = useListItem()

  const isNested = parentId !== null

  const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: isNested ? 'right-start' : 'bottom-start',
    middleware: [
      offset({ mainAxis: isNested ? 0 : 4, alignmentAxis: isNested ? -4 : 0 }),
      flip(),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context, {
    enabled: isNested,
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  })
  const click = useClick(context, {
    event: 'mousedown',
    toggle: !isNested,
    ignoreMouse: isNested,
  })
  const role = useRole(context, { role: 'menu' })
  const dismiss = useDismiss(context, { bubbles: true })
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    nested: isNested,
    onNavigate: setActiveIndex,
  })
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    onMatch: isOpen ? setActiveIndex : undefined,
    activeIndex,
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    hover,
    click,
    role,
    dismiss,
    listNavigation,
    typeahead,
  ])

  // Event emitter allows you to communicate across tree components.
  // This effect closes all menus when an item gets clicked anywhere
  // in the tree.
  React.useEffect(() => {
    if (tree === null) return

    function handleTreeClick(): void {
      setIsOpen(false)
    }

    function onSubMenuOpen(event: { nodeId: string; parentId: string }): void {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
        setIsOpen(false)
      }
    }

    tree.events.on('click', handleTreeClick)
    tree.events.on('menuopen', onSubMenuOpen)

    return () => {
      tree.events.off('click', handleTreeClick)
      tree.events.off('menuopen', onSubMenuOpen)
    }
  }, [tree, nodeId, parentId])

  React.useEffect(() => {
    if (isOpen && tree !== null) {
      tree.events.emit('menuopen', { parentId, nodeId })
    }
  }, [tree, isOpen, nodeId, parentId])

  return (
    <FloatingNode id={nodeId}>
      <button
        ref={useMergeRefs([refs.setReference, item.ref, forwardedRef])}
        tabIndex={!isNested ? undefined : parent.activeIndex === item.index ? 0 : -1}
        type="button"
        role={isNested ? 'menuitem' : undefined}
        data-open={isOpen ? '' : undefined}
        data-nested={isNested ? '' : undefined}
        data-focus-inside={hasFocusInside ? '' : undefined}
        className={isNested ? menuItemClassName : rootMenuClassName}
        {...getReferenceProps(
          parent.getItemProps({
            ...props,
            onFocus(event: React.FocusEvent<HTMLButtonElement>) {
              props.onFocus?.(event)
              setHasFocusInside(false)
              parent.setHasFocusInside(true)
            },
          }),
        )}
      >
        {label}
        {isNested && (
          <span aria-hidden={true} style={{ marginLeft: 10, fontSize: 10 }}>
            ▶
          </span>
        )}
      </button>
      <MenuContext.Provider
        value={{
          activeIndex,
          setActiveIndex,
          getItemProps,
          setHasFocusInside,
          isOpen,
        }}
      >
        <FloatingList elementsRef={elementsRef} labelsRef={labelsRef}>
          {isOpen && (
            <FloatingPortal>
              <FloatingFocusManager
                context={context}
                modal={false}
                initialFocus={isNested ? -1 : 0}
                returnFocus={!isNested}
              >
                <div
                  ref={refs.setFloating}
                  className={menuClassName}
                  style={floatingStyles}
                  {...getFloatingProps()}
                >
                  {children}
                </div>
              </FloatingFocusManager>
            </FloatingPortal>
          )}
        </FloatingList>
      </MenuContext.Provider>
    </FloatingNode>
  )
})

type MenuItemProps = {
  label: string
  disabled?: boolean
}

export const MenuItem = React.forwardRef<
  HTMLButtonElement,
  MenuItemProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ label, disabled, ...props }, forwardedRef) => {
  const menu = React.useContext(MenuContext)
  const item = useListItem({ label: disabled === true ? null : label })
  const tree = useFloatingTree()
  const isActive = item.index === menu.activeIndex

  return (
    <button
      {...props}
      ref={useMergeRefs([item.ref, forwardedRef])}
      type="button"
      role="menuitem"
      className={menuItemClassName}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      {...menu.getItemProps({
        onClick(event: React.MouseEvent<HTMLButtonElement>) {
          props.onClick?.(event)
          tree?.events.emit('click')
        },
        onFocus(event: React.FocusEvent<HTMLButtonElement>) {
          props.onFocus?.(event)
          menu.setHasFocusInside(true)
        },
      })}
    >
      {label}
    </button>
  )
})

export const Menu = React.forwardRef<
  HTMLButtonElement,
  MenuProps & React.HTMLProps<HTMLButtonElement>
>((props, ref) => {
  const parentId = useFloatingParentNodeId()

  if (parentId === null) {
    return (
      <FloatingTree>
        <MenuComponent {...props} ref={ref} />
      </FloatingTree>
    )
  }

  return <MenuComponent {...props} ref={ref} />
})
