import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector } from 'react-redux'

// Types
export interface User {
  id: string
  username: string
  email: string
  displayName: string
  bio?: string
  avatarUrl?: string
  verified: boolean
  followerCount: number
  followingCount: number
  videoCount: number
  createdAt: string
  updatedAt: string
}

export interface Video {
  id: string
  title: string
  description?: string
  url: string
  thumbnailUrl: string
  duration: number
  viewCount: number
  likeCount: number
  shareCount: number
  commentCount: number
  tags: string[]
  user: User
  liked?: boolean
  bookmarked?: boolean
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  user: User
  videoId: string
  parentId?: string
  likeCount: number
  liked?: boolean
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'video_upload' | 'mention'
  title: string
  message: string
  read: boolean
  data?: any
  createdAt: string
}

// Auth Slice
interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialAuthState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    loginStart: state => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: User
        token: string
        refreshToken: string
      }>
    ) => {
      state.isLoading = false
      state.user = action.payload.user
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.isAuthenticated = true
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
      state.isAuthenticated = false
    },
    logout: state => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.isLoading = false
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    clearError: state => {
      state.error = null
    },
  },
})

export const authActions = authSlice.actions

// Videos Slice
interface VideosState {
  videos: Video[]
  currentVideo: Video | null
  trending: Video[]
  following: Video[]
  isLoading: boolean
  hasMore: boolean
  page: number
  error: string | null
}

const initialVideosState: VideosState = {
  videos: [],
  currentVideo: null,
  trending: [],
  following: [],
  isLoading: false,
  hasMore: true,
  page: 1,
  error: null,
}

const videosSlice = createSlice({
  name: 'videos',
  initialState: initialVideosState,
  reducers: {
    fetchVideosStart: state => {
      state.isLoading = true
      state.error = null
    },
    fetchVideosSuccess: (
      state,
      action: PayloadAction<{
        videos: Video[]
        hasMore: boolean
        reset?: boolean
      }>
    ) => {
      state.isLoading = false
      if (action.payload.reset) {
        state.videos = action.payload.videos
        state.page = 1
      } else {
        state.videos = [...state.videos, ...action.payload.videos]
      }
      state.hasMore = action.payload.hasMore
      state.page += 1
      state.error = null
    },
    fetchVideosFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    setCurrentVideo: (state, action: PayloadAction<Video | null>) => {
      state.currentVideo = action.payload
    },
    updateVideo: (state, action: PayloadAction<Video>) => {
      const index = state.videos.findIndex(v => v.id === action.payload.id)
      if (index !== -1) {
        state.videos[index] = action.payload
      }
      if (state.currentVideo?.id === action.payload.id) {
        state.currentVideo = action.payload
      }
    },
    likeVideo: (state, action: PayloadAction<{ videoId: string; liked: boolean }>) => {
      const updateVideoLike = (video: Video) => {
        if (video.id === action.payload.videoId) {
          video.liked = action.payload.liked
          video.likeCount += action.payload.liked ? 1 : -1
        }
      }

      state.videos.forEach(updateVideoLike)
      if (state.currentVideo) {
        updateVideoLike(state.currentVideo)
      }
    },
    addVideo: (state, action: PayloadAction<Video>) => {
      state.videos.unshift(action.payload)
    },
    removeVideo: (state, action: PayloadAction<string>) => {
      state.videos = state.videos.filter(v => v.id !== action.payload)
      if (state.currentVideo?.id === action.payload) {
        state.currentVideo = null
      }
    },
    setTrendingVideos: (state, action: PayloadAction<Video[]>) => {
      state.trending = action.payload
    },
    setFollowingVideos: (state, action: PayloadAction<Video[]>) => {
      state.following = action.payload
    },
  },
})

export const videosActions = videosSlice.actions

// UI Slice
interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  searchQuery: string
  activeTab: 'for-you' | 'following' | 'trending'
  videoPlayerSettings: {
    muted: boolean
    autoplay: boolean
    quality: 'auto' | '1080p' | '720p' | '480p' | '360p'
  }
  notifications: {
    push: boolean
    email: boolean
    comments: boolean
    likes: boolean
    follows: boolean
  }
}

const initialUIState: UIState = {
  theme: 'system',
  sidebarOpen: false,
  searchQuery: '',
  activeTab: 'for-you',
  videoPlayerSettings: {
    muted: true,
    autoplay: true,
    quality: 'auto',
  },
  notifications: {
    push: true,
    email: true,
    comments: true,
    likes: true,
    follows: true,
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: initialUIState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setActiveTab: (state, action: PayloadAction<'for-you' | 'following' | 'trending'>) => {
      state.activeTab = action.payload
    },
    updateVideoPlayerSettings: (
      state,
      action: PayloadAction<Partial<UIState['videoPlayerSettings']>>
    ) => {
      state.videoPlayerSettings = { ...state.videoPlayerSettings, ...action.payload }
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<UIState['notifications']>>
    ) => {
      state.notifications = { ...state.notifications, ...action.payload }
    },
  },
})

export const uiActions = uiSlice.actions

// Notifications Slice
interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

const initialNotificationsState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: initialNotificationsState,
  reducers: {
    fetchNotificationsStart: state => {
      state.isLoading = true
      state.error = null
    },
    fetchNotificationsSuccess: (state, action: PayloadAction<Notification[]>) => {
      state.isLoading = false
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.read).length
      state.error = null
    },
    fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.read) {
        state.unreadCount += 1
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount -= 1
      }
    },
    markAllAsRead: state => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.read) {
          state.unreadCount -= 1
        }
        state.notifications.splice(index, 1)
      }
    },
  },
})

export const notificationsActions = notificationsSlice.actions

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  videos: videosSlice.reducer,
  ui: uiSlice.reducer,
  notifications: notificationsSlice.reducer,
})

// Persist configuration
const persistConfig = {
  key: 'tiktok-app',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and UI state
  blacklist: ['videos', 'notifications'], // Don't persist videos and notifications
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

// Types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.isLoading
export const selectAuthError = (state: RootState) => state.auth.error

export const selectVideos = (state: RootState) => state.videos.videos
export const selectCurrentVideo = (state: RootState) => state.videos.currentVideo
export const selectTrendingVideos = (state: RootState) => state.videos.trending
export const selectFollowingVideos = (state: RootState) => state.videos.following
export const selectVideosLoading = (state: RootState) => state.videos.isLoading
export const selectHasMoreVideos = (state: RootState) => state.videos.hasMore

export const selectTheme = (state: RootState) => state.ui.theme
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen
export const selectSearchQuery = (state: RootState) => state.ui.searchQuery
export const selectActiveTab = (state: RootState) => state.ui.activeTab
export const selectVideoPlayerSettings = (state: RootState) => state.ui.videoPlayerSettings
export const selectNotificationSettings = (state: RootState) => state.ui.notifications

export const selectNotifications = (state: RootState) => state.notifications.notifications
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount
export const selectNotificationsLoading = (state: RootState) => state.notifications.isLoading
