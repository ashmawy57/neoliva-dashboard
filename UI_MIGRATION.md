# UI Component Migration Guide

## Objective
Standardize all UI triggers to use the `@base-ui/react` `asChild` composition pattern. This prevents hydration errors caused by nested `<button>` elements and legacy `render` prop patterns.

## The Problem
Legacy triggers often rendered a `<button>` by default. When wrapping our own `Button` component, this resulted in invalid HTML:
```html
<!-- INVALID: Button within a button -->
<button class="trigger">
  <button class="ui-button">Click me</button>
</button>
```

## The Solution: `asChild` Pattern
The `asChild` prop tells the trigger to merge its props into the child element instead of rendering its own wrapper.

### 1. Dialogs
**Legacy:**
```tsx
<DialogTrigger>
  <Button>Open</Button>
</DialogTrigger>
```

**Migrated:**
```tsx
<DialogTrigger asChild>
  <Button>Open</Button>
</DialogTrigger>
```

### 2. Dropdown Menus
**Legacy:**
```tsx
<DropdownMenuTrigger>
  <Button variant="ghost">Actions</Button>
</DropdownMenuTrigger>
```

**Migrated:**
```tsx
<DropdownMenuTrigger asChild>
  <Button variant="ghost">Actions</Button>
</DropdownMenuTrigger>
```

### 3. Popovers
**Legacy:**
```tsx
<PopoverTrigger render={<Button>Open</Button>} />
```

**Migrated:**
```tsx
<PopoverTrigger asChild>
  <Button>Open</Button>
</PopoverTrigger>
```

## Migration Checklist
- [ ] Add `asChild` to all `DialogTrigger`, `SheetTrigger`, `PopoverTrigger`, and `DropdownMenuTrigger` components.
- [ ] Ensure the immediate child is a valid React element (usually a `Button` or `button`).
- [ ] Remove any `render` prop usage on triggers.
- [ ] If the trigger child is a custom component, ensure it forwards refs correctly (using `React.forwardRef`).

## Primitives Support
Our UI primitives in `src/components/ui/` have been updated to support `asChild` and handle the underlying `@base-ui/react` `render` logic. 

> [!IMPORTANT]
> To resolve Base UI hydration warnings when using `asChild` with native `<button>` or custom `Button` components, our primitives explicitly set `nativeButton={true}`. This informs Base UI that the rendered child is already a native button and prevents conflicting ARIA attribute injections.

Always use the project's UI components instead of importing primitives directly from `@base-ui/react`.
