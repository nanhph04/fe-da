# Design System

A comprehensive design system for the Studio Wallet feature, built with TypeScript and TailwindCSS.

## Overview

This design system provides reusable, accessible, and customizable UI components following the "Cinematic Canvas" design aesthetic with a focus on dark mode, high-contrast colors, and professional styling.

## Design Tokens

### Colors

The design system uses a consistent color palette focused on Crimson (#ff8e80) and Gold (#fdc003):

#### Primary Colors
- **Crimson**: `#ff8e80` - Primary brand color
- **Gold**: `#fdc003` - Secondary brand color

#### Color Scale
Each color has 10 shades (50-900) for proper contrast and hierarchy.

#### Usage
```typescript
import { theme } from '@/design-system/tokens/theme';

// CSS variables
const buttonStyle = {
  backgroundColor: theme.colors.primary[600],
  color: theme.colors.text[50],
};

// Class names
const className = 'bg-primary-600 text-primary-50';
```

### Typography

#### Font Stack
- **Headings**: Manrope
- **Body**: Inter

#### Font Scale
- **Display**: 48px / 3rem
- **Heading 1**: 36px / 2.25rem
- **Heading 2**: 30px / 1.875rem
- **Heading 3**: 24px / 1.5rem
- **Heading 4**: 20px / 1.25rem
- **Heading 5**: 18px / 1.125rem
- **Heading 6**: 16px / 1rem
- **Body**: 16px / 1rem
- **Small**: 14px / 0.875rem
- **Tiny**: 12px / 0.75rem

### Spacing

Built on an 8px grid system:
- 4px: 0.5rem (xs)
- 8px: 1rem (sm)
- 16px: 2rem (md)
- 24px: 3rem (lg)
- 32px: 4rem (xl)
- 48px: 6rem (2xl)
- 64px: 8rem (3xl)

## Components

### Buttons
```tsx
import { Button, IconButton } from '@/design-system';

// Basic button
<Button variant="primary" size="md">
  Primary Button
</Button>

// Icon button
<IconButton icon={<Plus />} accessibleLabel="Add item" />

// Loading state
<Button loading={isLoading} loadingText="Processing...">
  Submit
</Button>

// Custom intents
<Button intent="success" onClick={handleSuccess}>
  Success Action
</Button>
```

**Variants**:
- `primary` - Primary action button
- `secondary` - Secondary action button
- `ghost` - Subtle button with no background
- `destructive` - Destructive action button
- `outline` - Button with border only
- `link` - Text link button

### Inputs
```tsx
import { Input, Textarea, Select } from '@/design-system';

// Text input
<Input
  label="Email"
  placeholder="Enter your email"
  required
  error={errors.email}
  helper="We'll never share your email"
/>

// Textarea
<Textarea
  label="Description"
  placeholder="Enter a description"
  rows={4}
  maxLength={200}
/>

// Select
<Select
  label="Category"
  options={categories}
  value={selectedCategory}
  onValueChange={setSelectedCategory}
  searchable
/>
```

**Features**:
- Validation with error states
- Loading indicators
- Helper text
- Icon support
- Keyboard navigation
- Required field indicators

### Modals
```tsx
import { Modal, ConfirmModal, AlertModal } from '@/design-system';

// Basic modal
<Modal
  open={isOpen}
  onClose={onClose}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
>
  <p>Modal content goes here</p>
  <Button onClick={onClose}>Close</Button>
</Modal>

// Confirm modal
<ConfirmModal
  open={isConfirmOpen}
  onClose={() => setIsConfirmOpen(false)}
  onConfirm={handleDelete}
  confirmText="Delete"
  confirmButtonVariant="destructive"
>
  This action cannot be undone.
</ConfirmModal>
```

**Types**:
- `Modal` - Basic modal with custom content
- `ConfirmModal` - Confirmation dialog with action buttons
- `AlertModal` - Alert dialog with icon and message
- `Drawer` - Slide-in panel for mobile

### Cards
```tsx
import { Card, CardHeader, CardBody, CardFooter, StatCard } from '@/design-system';

// Basic card
<Card hover>
  <CardHeader title="Card Title" description="Card description" />
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Stat card
<StatCard
  title="Total Revenue"
  value="$12,345"
  description="Last 30 days"
  trend={{ value: 12.5, isPositive: true, label: "growth" }}
  icon={<DollarSign />}
/>
```

**Features**:
- Hover effects
- Clickable cards
- Configurable padding
- Shadow variants
- Responsive layout

### Tables
```tsx
import { Table } from '@/design-system';

const columns = [
  { key: 'id', title: 'ID', sortable: true },
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email' },
  { key: 'status', title: 'Status' },
];

const data = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  // ... more data
];

<Table
  data={data}
  columns={columns}
  sortField="name"
  sortOrder="asc"
  onSort={handleSort}
  pagination={{
    current: 1,
    pageSize: 10,
    total: 100,
    onChange: handlePagination
  }}
/>
```

**Features**:
- Sorting
- Pagination
- Row selection
- Loading states
- Empty states
- Responsive design

### Selects
```tsx
import { Select, MultiSelect, AsyncSelect } from '@/design-system';

// Basic select
<Select
  label="Choose a category"
  options={categories}
  value={selectedCategory}
  onValueChange={setSelectedCategory}
  clearable
  searchable
/>

// Multi-select
<MultiSelect
  label="Select multiple options"
  options={options}
  values={selectedOptions}
  onValuesChange={setSelectedOptions}
/>

// Async select
<AsyncSelect
  label="Search users"
  loadOptions={searchUsers}
  debounceMs={300}
/>
```

**Features**:
- Multi-select support
- Search functionality
- Async loading
- Clear option
- Grouped options
- Custom rendering

### Forms
```tsx
import { Form, FormSection, FormWrapper } from '@/design-system';

const fields = [
  {
    name: 'email',
    label: 'Email',
    type: 'input' as const,
    required: true,
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },
  {
    name: 'category',
    label: 'Category',
    type: 'select' as const,
    options: categoryOptions,
    required: true
  }
];

<Form
  fields={fields}
  onSubmit={handleSubmit}
  loading={isSubmitting}
  layout="vertical"
/>
```

**Features**:
- Validation
- Multiple layouts
- Form sections
- Multi-step forms
- Error handling
- Loading states

## Hooks

### useTheme

Custom hook for theme switching:

```tsx
import { useTheme } from '@/design-system/hooks/use-theme';

const { theme, setTheme } = useTheme();

setTheme('dark'); // or 'light'
```

### useKeyboardNavigation

Hook for accessible keyboard navigation:

```tsx
import { useKeyboardNavigation } from '@/design-system/hooks/use-keyboard-navigation';

const { handleKeyDown } = useKeyboardNavigation(items, {
  orientation: 'vertical',
  loop: true,
  activeIndex,
  setActiveIndex
});
```

### useSkipToContent

Skip to content link for screen readers:

```tsx
import { useSkipToContent } from '@/design-system/hooks/use-skip-to-content';

const mainRef = useSkipToContent();
<main ref={mainRef} id="main-content">
  {/* Main content */}
</main>
```

## Accessibility

The design system follows WCAG 2.1 guidelines:

### Features
- Screen reader support
- Keyboard navigation
- Focus management
- ARIA labels
- Color contrast ratio > 4.5:1
- Reduced motion support

### Best Practices
- Always provide labels for interactive elements
- Use semantic HTML when possible
- Ensure keyboard accessibility
- Provide sufficient color contrast
- Support reduced motion preferences

## Implementation

### Installation
```bash
npm install class-variance-authority @radix-ui/react-slot @radix-ui/react-dialog
```

### Required Providers
```tsx
import { ThemeProvider } from '@/design-system/theme-provider';

<ThemeProvider
  attribute="class"
  defaultTheme="dark"
  enableSystem={false}
  disableTransitionOnChange
>
  <App />
</ThemeProvider>
```

### CSS Variables
The theme uses CSS variables for easy theming:

```css
:root {
  --color-primary: #ff8e80;
  --color-secondary: #fdc003;
  --color-background: #0e0e10;
  --color-text: #f9f5f8;
}
```

## Contributing

### Adding New Components
1. Follow the existing naming conventions
2. Include accessibility features
3. Write TypeScript interfaces
4. Add proper variants
5. Include documentation

### Updating Design Tokens
1. Update the token files in `tokens/`
2. Update CSS variables
3. Test with existing components
4. Update documentation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Components are tree-shakeable
- CSS-in-JS is used for component variants
- Theme switching uses CSS transitions
- Lazy loading for heavy components