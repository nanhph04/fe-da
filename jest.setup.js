import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: {},
      asPath: "",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock next/image
jest.mock('next/image', () => ({
  Image: (props) => {
    return <img {...props} />;
  },
}));

// Mock next/font
jest.mock('next/font/google', () => ({
  Inter: jest.fn(() => ({
    className: 'font-inter',
    style: {},
  })),
  Manrope: jest.fn(() => ({
    className: 'font-manrope',
    style: {},
  })),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  // Mock all lucide icons
  DollarSign: () => <span>DollarSign</span>,
  Wallet: () => <span>Wallet</span>,
  History: () => <span>History</span>,
  TrendingUp: () => <span>TrendingUp</span>,
  Calendar: () => <span>Calendar</span>,
  Search: () => <span>Search</span>,
  Filter: () => <span>Filter</span>,
  Download: () => <span>Download</span>,
  ArrowUp: () => <span>ArrowUp</span>,
  ArrowDown: () => <span>ArrowDown</span>,
  X: () => <span>X</span>,
  Eye: () => <span>Eye</span>,
  EyeOff: () => <span>EyeOff</span>,
  CreditCard: () => <span>CreditCard</span>,
  Banknote: () => <span>Banknote</span>,
  Bitcoin: () => <span>Bitcoin</span>,
  Plus: () => <span>Plus</span>,
  Minus: () => <span>Minus</span>,
}));

// Mock @radix-ui/react-dialog
jest.mock('@radix-ui/react-dialog', () => ({
  Dialog: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogTrigger: ({ children }) => children,
  DialogPortal: ({ children }) => children,
  DialogOverlay: ({ children }) => children,
  DialogContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h3>{children}</h3>,
  DialogDescription: ({ children }) => <p>{children}</p>,
  DialogClose: ({ children }) => <button>{children}</button>,
}), { virtual: true });

// Mock @radix-ui/react-slot
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }) => <div {...props}>{children}</div>,
}), { virtual: true });

// Mock @radix-ui/react-select
jest.mock('@radix-ui/react-select', () => ({
  Select: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectTrigger: ({ children, ...props }) => <button {...props}>{children}</button>,
  SelectValue: ({ children, ...props }) => <span {...props}>{children}</span>,
  SelectContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  SelectItem: ({ children, ...props }) => <div {...props}>{children}</div>,
}), { virtual: true });

// Mock @radix-ui/react-dropdown-menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  DropdownMenu: ({ children, ...props }) => <div {...props}>{children}</div>,
  DropdownMenuTrigger: ({ children }) => children,
  DropdownMenuContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  DropdownMenuItem: ({ children, ...props }) => <div {...props}>{children}</div>,
  DropdownMenuSeparator: ({ children, ...props }) => <div {...props}>{children}</div>,
}), { virtual: true });

// Mock @radix-ui/react-calendar
jest.mock('@radix-ui/react-calendar', () => ({
  Calendar: ({ children, ...props }) => <div {...props}>{children}</div>,
  CalendarGrid: ({ children }) => children,
  CalendarGridBody: ({ children }) => children,
  CalendarGridHead: ({ children }) => children,
  CalendarGridRow: ({ children }) => children,
  CalendarHeading: ({ children }) => children,
  CalendarCell: ({ children, ...props }) => <div {...props}>{children}</div>,
}), { virtual: true });

// Mock @radix-ui/react-popover
jest.mock('@radix-ui/react-popover', () => ({
  Popover: ({ children, ...props }) => <div {...props}>{children}</div>,
  PopoverTrigger: ({ children }) => children,
  PopoverContent: ({ children, ...props }) => <div {...props}>{children}</div>,
}), { virtual: true });

// Mock @radix-ui/react-tooltip
jest.mock('@radix-ui/react-tooltip', () => ({
  Tooltip: ({ children, ...props }) => <div {...props}>{children}</div>,
  TooltipTrigger: ({ children }) => children,
  TooltipContent: ({ children, ...props }) => <div {...props}>{children}</div>,
}), { virtual: true });

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }) => children,
  useTheme: () => ({
    theme: 'dark',
    setTheme: jest.fn(),
  }),
}), { virtual: true });

// Global test utilities
global.fetch = jest.fn();
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  getEntriesByName: jest.fn(),
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Setup console.error to avoid test noise
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Filter out common React warnings
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
