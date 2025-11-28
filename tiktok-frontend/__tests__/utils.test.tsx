import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { SWRConfig } from 'swr'
import { configureStore } from '@reduxjs/toolkit'
import { cn, formatUtils, dateUtils } from '../libs/utils'

// Mock store for testing
const mockStore = configureStore({
  reducer: {
    auth: (state = { user: null, isAuthenticated: false }, action) => state,
    videos: (state = { videos: [], isLoading: false }, action) => state,
    ui: (state = { theme: 'light' }, action) => state,
    notifications: (state = { notifications: [], unreadCount: 0 }, action) => state,
  },
})

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={mockStore}>
    <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
  </Provider>
)

describe('Utils Library', () => {
  describe('cn utility function', () => {
    it('should merge class names correctly', () => {
      expect(cn('base-class', 'additional-class')).toBe('base-class additional-class')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      expect(cn('base-class', isActive && 'active')).toBe('base-class active')
    })

    it('should resolve Tailwind conflicts', () => {
      expect(cn('px-2 px-4')).toBe('px-4')
    })
  })

  describe('formatUtils', () => {
    it('should format numbers correctly', () => {
      expect(formatUtils.formatCount(1234)).toBe('1.2K')
      expect(formatUtils.formatCount(1234567)).toBe('1.2M')
      expect(formatUtils.formatCount(1234567890)).toBe('1.2B')
    })

    it('should format duration correctly', () => {
      expect(formatUtils.formatDuration(65)).toBe('1:05')
      expect(formatUtils.formatDuration(3665)).toBe('61:05')
    })

    it('should truncate text correctly', () => {
      const longText = 'This is a very long text that should be truncated'
      expect(formatUtils.truncateText(longText, 20)).toBe('This is a very long...')
    })

    it('should extract hashtags correctly', () => {
      const text = 'Check out this #amazing #video #trending content!'
      const hashtags = formatUtils.extractHashtags(text)
      expect(hashtags).toEqual(['#amazing', '#video', '#trending'])
    })

    it('should format file size correctly', () => {
      expect(formatUtils.formatFileSize(1024)).toBe('1 KB')
      expect(formatUtils.formatFileSize(1048576)).toBe('1 MB')
    })
  })

  describe('dateUtils', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-01T12:00:00Z')
      expect(dateUtils.format(date, 'YYYY-MM-DD')).toBe('2024-01-01')
    })

    it('should calculate relative time correctly', () => {
      const pastDate = new Date(Date.now() - 3600000) // 1 hour ago
      expect(dateUtils.fromNow(pastDate)).toContain('ago')
    })

    it('should validate dates correctly', () => {
      expect(dateUtils.isValid('2024-01-01')).toBe(true)
      expect(dateUtils.isValid('invalid-date')).toBe(false)
    })

    it('should add time correctly', () => {
      const date = new Date('2024-01-01')
      const result = dateUtils.add(date, 1, 'day')
      expect(result.getDate()).toBe(2)
    })
  })
})

// Example component test
const SimpleButton = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) => (
  <button
    onClick={onClick}
    className={cn('rounded px-4 py-2', className)}
    data-testid="simple-button"
  >
    {children}
  </button>
)

describe('SimpleButton Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render button with correct text', () => {
    render(<SimpleButton>Click me</SimpleButton>)
    expect(screen.getByTestId('simple-button')).toHaveTextContent('Click me')
  })

  it('should handle click events', async () => {
    const handleClick = vi.fn()
    render(<SimpleButton onClick={handleClick}>Click me</SimpleButton>)

    await user.click(screen.getByTestId('simple-button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should apply custom className', () => {
    render(<SimpleButton className="bg-blue-500">Click me</SimpleButton>)
    const button = screen.getByTestId('simple-button')
    expect(button).toHaveClass('bg-blue-500', 'px-4', 'py-2', 'rounded')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    render(<SimpleButton className="px-2 py-1">Click me</SimpleButton>)
    const button = screen.getByTestId('simple-button')
    // Should use px-2 and py-1 instead of the default px-4 py-2
    expect(button).toHaveClass('px-2', 'py-1', 'rounded')
    expect(button).not.toHaveClass('px-4', 'py-2')
  })
})

// Integration test example
describe('Integration Tests', () => {
  it('should render components within providers', () => {
    render(
      <TestWrapper>
        <SimpleButton>Test Button</SimpleButton>
      </TestWrapper>
    )

    expect(screen.getByTestId('simple-button')).toBeInTheDocument()
  })

  it('should handle async operations', async () => {
    const AsyncComponent = () => {
      const [loading, setLoading] = React.useState(true)

      React.useEffect(() => {
        setTimeout(() => setLoading(false), 100)
      }, [])

      return loading ? <div>Loading...</div> : <div>Loaded!</div>
    }

    render(<AsyncComponent />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(screen.getByText('Loaded!')).toBeInTheDocument()
      },
      { timeout: 200 }
    )
  })
})
