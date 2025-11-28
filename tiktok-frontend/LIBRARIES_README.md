# 🚀 Modern Frontend Libraries Integration

This project integrates the most powerful and trending frontend libraries to create a robust, scalable, and performant TikTok-like application.

## 📚 Libraries Included

### Core State Management & Data Fetching

- **Redux Toolkit** - Modern Redux state management
- **React Redux** - React bindings for Redux
- **SWR** - Data fetching with caching, revalidation, and real-time features
- **TanStack Query** - Powerful data synchronization for React
- **Zustand** - Lightweight state management (already included)

### UI & Animation

- **Framer Motion** - Production-ready motion library for React
- **Headless UI** - Completely unstyled, fully accessible UI components
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Lucide React** - Modern icon library
- **Class Variance Authority (CVA)** - For creating UI component variants
- **Tailwind Merge** - Merge Tailwind CSS classes without conflicts

### Form & Validation

- **React Hook Form** - Performant, flexible forms with easy validation
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation resolvers for React Hook Form

### Utilities

- **Lodash** - Modern JavaScript utility library
- **Day.js** - Fast 2KB alternative to Moment.js
- **ms** - Convert various time formats to milliseconds
- **Decimal.js** - Arbitrary-precision decimal arithmetic
- **BN.js** - Big number library for JavaScript
- **nanoid** - Unique ID generator
- **uuid** - Generate RFC-compliant UUIDs
- **clsx** - Utility for constructing className strings conditionally

### Networking & Real-time

- **Axios** - Promise-based HTTP client
- **Socket.IO Client** - Real-time bidirectional event-based communication

### Media & File Handling

- **React Dropzone** - Drag and drop file uploader
- **React Advanced Cropper** - Advanced image cropper (already included)

### Virtual Scrolling & Performance

- **React Window** - Efficiently rendering large lists and tabular data
- **React Virtualized Auto Sizer** - Auto-sizing for React Window
- **React Infinite Scroll Component** - Infinite scroll component

### Hooks & Utilities

- **React Use** - Collection of useful React hooks
- **usehooks-ts** - TypeScript-ready React hooks
- **React Intersection Observer** - React wrapper for Intersection Observer API

### Security & Encryption

- **js-cookie** - Lightweight JavaScript cookie API
- **jwt-decode** - Decode JWT tokens
- **crypto-js** - JavaScript crypto library

### Notifications & UI Feedback

- **React Hot Toast** - Smoking hot React notifications

### Development Tools

- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🏗️ Project Structure

```
libs/
├── utils.ts              # Common utility functions and validators
├── api-client.ts         # Enhanced Axios client with auth & retry logic
├── socket-manager.ts     # Socket.IO client management
├── store.ts              # Redux Toolkit store configuration
├── swr-hooks.ts          # SWR hooks for data fetching
└── animations.tsx        # Framer Motion animation components

app/
├── components/
│   └── VideoCard.tsx     # Example component using all libraries
└── example/
    └── page.tsx          # Demo page showcasing integration
```

## 🚀 Key Features

### 1. State Management (Redux Toolkit + SWR)

- **Redux** for global app state (auth, UI preferences)
- **SWR** for server state (API data with caching)
- **Zustand** for component-level state
- **React Query** for advanced data synchronization

### 2. Real-time Communication (Socket.IO)

- Auto-reconnection with exponential backoff
- Event-driven architecture
- Room management for videos and users
- Real-time likes, comments, and notifications

### 3. Enhanced API Client (Axios)

- Automatic token refresh
- Request/response interceptors
- File upload with progress tracking
- Error handling with user-friendly messages
- Download functionality

### 4. Form Handling (React Hook Form + Zod)

- Type-safe form validation
- Performance optimized with minimal re-renders
- Comprehensive validation schemas
- Error handling with user feedback

### 5. Animations (Framer Motion)

- Smooth page transitions
- Component-level animations
- Gesture support
- Stagger animations for lists
- Custom animation variants

### 6. Utility Functions

- Date formatting and manipulation
- Number formatting (1K, 1M, 1B)
- Text processing and validation
- Local storage management
- Error handling utilities

## 💡 Usage Examples

### State Management

```typescript
import { useAppDispatch, useAppSelector } from '@/libs/store'
import { authActions } from '@/libs/store'

// In component
const dispatch = useAppDispatch()
const user = useAppSelector(state => state.auth.user)

// Login action
dispatch(authActions.loginSuccess({ user, token, refreshToken }))
```

### Data Fetching

```typescript
import { useVideos, useLikeVideo } from '@/libs/swr-hooks'

// Fetch videos with infinite scroll
const { videos, loadMore, isLoading } = useVideos()

// Like a video
const { like, isLoading: isLiking } = useLikeVideo(videoId)
```

### Real-time Events

```typescript
import { socketManager } from '@/libs/socket-manager'

// Listen for real-time events
const cleanup = socketManager.on('video_liked', data => {
  console.log('Video liked:', data)
})

// Emit events
socketManager.likeVideo(videoId)
```

### Animations

```typescript
import { FadeIn, SlideIn, StaggeredList } from '@/libs/animations'

<StaggeredList>
  {videos.map(video => (
    <StaggeredItem key={video.id}>
      <VideoCard video={video} />
    </StaggeredItem>
  ))}
</StaggeredList>
```

### Form Validation

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schemas } from '@/libs/utils'

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(schemas.videoTitle),
})
```

## 🔧 Configuration

### Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### SWR Configuration

```typescript
import { SWRConfig } from 'swr'

<SWRConfig value={swrConfig}>
  <App />
</SWRConfig>
```

### Redux Store Setup

```typescript
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from '@/libs/store'

<Provider store={store}>
  <PersistGate loading={<Loading />} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

## 📈 Performance Optimizations

1. **Code Splitting** - Dynamic imports for route-based code splitting
2. **Virtual Scrolling** - Efficient rendering of large video lists
3. **Image Optimization** - Next.js Image component with lazy loading
4. **Caching** - SWR caching with background revalidation
5. **Debouncing** - Prevent excessive API calls
6. **Memoization** - React.memo and useMemo for expensive operations

## 🔐 Security Features

1. **JWT Token Management** - Automatic token refresh
2. **Input Validation** - Zod schemas for all user inputs
3. **XSS Protection** - Sanitized user content
4. **CORS Configuration** - Proper cross-origin setup
5. **Rate Limiting** - API request throttling

## 🧪 Testing Libraries (Recommended Additions)

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom vitest @vitejs/plugin-react
```

## 📱 Mobile Optimizations

1. **Touch Gestures** - Framer Motion gesture support
2. **Responsive Design** - Tailwind CSS mobile-first approach
3. **PWA Support** - Service worker for offline functionality
4. **Performance** - Optimized for mobile devices

## 🚀 Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the example page:

```
http://localhost:3000/example
```

## 📖 Documentation Links

- [Redux Toolkit](https://redux-toolkit.js.org/)
- [SWR](https://swr.vercel.app/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Socket.IO](https://socket.io/docs/v4/)
- [Axios](https://axios-http.com/)
- [Day.js](https://day.js.org/)
- [Lodash](https://lodash.com/)

## 🎯 Best Practices

1. **Component Organization** - Small, focused components
2. **Custom Hooks** - Reusable logic extraction
3. **Error Boundaries** - Graceful error handling
4. **TypeScript** - Strict typing for better DX
5. **Code Splitting** - Lazy loading for performance
6. **Accessibility** - ARIA labels and keyboard navigation
7. **SEO** - Proper meta tags and structured data

This setup provides a solid foundation for building modern, scalable React applications with the best-in-class libraries and patterns.
