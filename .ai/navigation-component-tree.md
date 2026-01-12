# Struktura komponentów nawigacji

## Hierarchia komponentów

```
Layout.astro
├── ErrorBoundary (client:only="react")
│   └── NavigationBar (client:load)
│       ├── useWindowSize() hook
│       ├── Desktop View (isMobile = false)
│       │   ├── Logo/Brand Link
│       │   ├── LeftNavigation
│       │   │   └── NavLink[] (5 links)
│       │   └── RightNavigation
│       │       └── Auth Buttons (conditional)
│       └── Mobile View (isMobile = true)
│           ├── Logo/Brand Link
│           └── HamburgerMenu
│               ├── Menu Toggle Button
│               └── Dropdown Panel (conditional)
│                   ├── LeftNavigation (mobile layout)
│                   └── RightNavigation (mobile layout)
├── ThemeToggle (client:only="react")
├── Toaster (client:only="react")
└── <slot /> (page content)
```

## Przepływ danych

```
Layout.astro
  ↓ currentPath (Astro.url.pathname)
  ↓ userStatus (mock: "authenticated")
  ↓
NavigationBar
  ↓ navLinks (useMemo - computed from currentPath)
  ↓ handleLogin/Register/Logout (useCallback - toast notifications)
  ↓ isMobile (useWindowSize hook)
  ↓
  ├→ LeftNavigation
  │    ← links, isMobile, onLinkClick
  │
  ├→ RightNavigation
  │    ← userStatus, isMobile, auth handlers
  │
  └→ HamburgerMenu
       ← links, userStatus, auth handlers
       └→ LeftNavigation + RightNavigation
            ← same props as desktop
```

## Props flow

### NavigationBar
```typescript
interface NavigationProps {
  currentPath: string;      // From Astro.url.pathname
  userStatus: UserStatus;   // "authenticated" | "unauthenticated" | "loading"
}
```

### LeftNavigation
```typescript
interface LeftNavigationProps {
  links: NavLink[];         // Array of navigation links
  isMobile?: boolean;       // Layout variant
  onLinkClick?: () => void; // Close menu callback (mobile)
}
```

### RightNavigation
```typescript
interface RightNavigationProps {
  userStatus: UserStatus;
  isMobile?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogoutClick?: () => void;
}
```

### HamburgerMenu
```typescript
interface HamburgerMenuProps {
  links: NavLink[];
  userStatus: UserStatus;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  onLogoutClick?: () => void;
}
```

## State management

### Local state
```typescript
// NavigationBar
const { isMobile } = useWindowSize(); // Hook state
const navLinks = useMemo(() => [...], [currentPath]); // Memoized derived state

// HamburgerMenu
const [isOpen, setIsOpen] = useState(false); // Menu open/close state
```

### No global state needed
- userStatus przekazywany z Layout
- currentPath z Astro routing
- Brak shared state między komponentami

## Optimizations applied

### React.memo
- ✅ LeftNavigation
- ✅ RightNavigation
- ✅ HamburgerMenu

### useCallback
- ✅ handleLogin
- ✅ handleRegister
- ✅ handleLogout
- ✅ toggleMenu
- ✅ handleLinkClick

### useMemo
- ✅ navLinks array

## Rendering behavior

### Initial render
1. Layout.astro renders with currentPath & userStatus
2. NavigationBar hydrates (client:load)
3. useWindowSize checks viewport
4. Conditional render: Desktop OR Mobile view
5. Animations trigger (fade-in, slide-in)

### On resize
1. useWindowSize detects change
2. isMobile updates
3. View switches (no remount, just conditional render)
4. Smooth transition

### On navigation
1. Astro router updates currentPath
2. Layout re-renders with new path
3. NavigationBar receives new currentPath
4. navLinks recomputes (useMemo)
5. Active link updates

### On auth action (mock)
1. User clicks auth button
2. Handler called (useCallback)
3. Toast notification shown
4. No state change (mock implementation)

## File structure

```
src/
├── components/
│   ├── NavigationBar.tsx          (Main component)
│   ├── LeftNavigation.tsx         (Links component)
│   ├── RightNavigation.tsx        (Auth buttons component)
│   ├── HamburgerMenu.tsx          (Mobile menu component)
│   ├── ErrorBoundary.tsx          (Error handling)
│   ├── hooks/
│   │   ├── useWindowSize.tsx      (Responsive hook)
│   │   └── useFlashcards.tsx      (Existing)
│   └── ui/
│       ├── sonner.tsx             (Toast notifications)
│       ├── button.tsx             (Existing)
│       └── card.tsx               (Existing)
├── layouts/
│   └── Layout.astro               (Main layout with navigation)
└── types.ts                       (Navigation types)
```

## Dependencies graph

```
NavigationBar
  ├── sonner (toast)
  ├── useWindowSize (hook)
  ├── LeftNavigation
  ├── RightNavigation
  └── HamburgerMenu
      ├── LeftNavigation (reuse)
      └── RightNavigation (reuse)

LeftNavigation
  └── NavLink[] (type)

RightNavigation
  └── Button (shadcn/ui)

HamburgerMenu
  ├── Button (shadcn/ui)
  ├── LeftNavigation (reuse)
  └── RightNavigation (reuse)

ErrorBoundary
  ├── Button (shadcn/ui)
  └── Card (shadcn/ui)

Toaster (sonner)
  ├── lucide-react (icons)
  └── theme detection (MutationObserver)
```

## Event flow

### Desktop navigation click
```
User clicks link
  ↓
<a href="/path"> native navigation
  ↓
Astro router handles
  ↓
Layout re-renders with new currentPath
  ↓
NavigationBar updates active link
```

### Mobile navigation click
```
User clicks hamburger icon
  ↓
toggleMenu() called
  ↓
isOpen state toggles
  ↓
Menu slides down (animation)
  ↓
User clicks link
  ↓
handleLinkClick() closes menu
  ↓
Native navigation continues
```

### Auth button click (mock)
```
User clicks "Zaloguj"
  ↓
handleLogin() called (useCallback)
  ↓
toast.info() shows notification
  ↓
User sees: "Funkcja logowania będzie dostępna wkrótce"
```

## Future enhancements

### Real auth integration
```
NavigationBar
  ├── useSupabaseAuth() hook       (TODO)
  │   ├── session state
  │   ├── signIn method
  │   ├── signUp method
  │   └── signOut method
  ↓
RightNavigation
  └── Real auth handlers           (TODO)
```

### Additional features
```
NavigationBar
  └── ProfileMenu (TODO)
      ├── Avatar
      ├── Dropdown
      │   ├── Profile
      │   ├── Settings
      │   └── Logout
      └── Notification badge
```
