import { type ClassValue, clsx } from 'clsx'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import _ from 'lodash'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

// Initialize dayjs plugins
dayjs.extend(relativeTime)
dayjs.extend(duration)

/**
 * Utility function to merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date utilities using dayjs
 */
export const dateUtils = {
  format: (date: Date | string, format = 'YYYY-MM-DD HH:mm:ss') => dayjs(date).format(format),
  fromNow: (date: Date | string) => dayjs(date).fromNow(),
  duration: (ms: number) => dayjs.duration(ms).humanize(),
  isValid: (date: any) => dayjs(date).isValid(),
  add: (date: Date | string, amount: number, unit: any) => dayjs(date).add(amount, unit).toDate(),
  subtract: (date: Date | string, amount: number, unit: any) =>
    dayjs(date).subtract(amount, unit).toDate(),
}

/**
 * Lodash utility exports for common operations
 */
export const utils = {
  debounce: _.debounce,
  throttle: _.throttle,
  groupBy: _.groupBy,
  orderBy: _.orderBy,
  uniqBy: _.uniqBy,
  chunk: _.chunk,
  isEmpty: _.isEmpty,
  isEqual: _.isEqual,
  pick: _.pick,
  omit: _.omit,
  cloneDeep: _.cloneDeep,
  merge: _.merge,
  get: _.get,
  set: _.set,
  has: _.has,
}

/**
 * Common validation schemas using Zod
 */
export const schemas = {
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  url: z.string().url('Invalid URL'),
  uuid: z.string().uuid('Invalid UUID'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),

  // TikTok specific schemas
  videoTitle: z.string().min(1).max(150, 'Title must be 150 characters or less'),
  videoDescription: z.string().max(2200, 'Description must be 2200 characters or less'),
  hashtag: z.string().regex(/^#[a-zA-Z0-9_]+$/, 'Invalid hashtag format'),

  // User profile schema
  userProfile: z.object({
    id: z.string().uuid(),
    username: z.string().min(3).max(30),
    email: z.string().email(),
    displayName: z.string().min(1).max(50),
    bio: z.string().max(200).optional(),
    avatarUrl: z.string().url().optional(),
    verified: z.boolean().default(false),
    followerCount: z.number().int().min(0).default(0),
    followingCount: z.number().int().min(0).default(0),
    videoCount: z.number().int().min(0).default(0),
  }),

  // Video schema
  video: z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(150),
    description: z.string().max(2200).optional(),
    url: z.string().url(),
    thumbnailUrl: z.string().url(),
    duration: z.number().positive(),
    viewCount: z.number().int().min(0).default(0),
    likeCount: z.number().int().min(0).default(0),
    shareCount: z.number().int().min(0).default(0),
    commentCount: z.number().int().min(0).default(0),
    tags: z.array(z.string()).default([]),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
}

/**
 * Type guards and validation helpers
 */
export const validators = {
  isValidEmail: (email: string): boolean => schemas.email.safeParse(email).success,
  isValidUrl: (url: string): boolean => schemas.url.safeParse(url).success,
  isValidUuid: (uuid: string): boolean => schemas.uuid.safeParse(uuid).success,

  // Type-safe validation with detailed errors
  validateUserProfile: (data: unknown) => schemas.userProfile.safeParse(data),
  validateVideo: (data: unknown) => schemas.video.safeParse(data),
}

/**
 * Format utilities for numbers and text
 */
export const formatUtils = {
  // Format numbers for display (1K, 1M, etc.)
  formatCount: (count: number): string => {
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    if (count < 1000000000) return `${(count / 1000000).toFixed(1)}M`
    return `${(count / 1000000000).toFixed(1)}B`
  },

  // Format duration for video display
  formatDuration: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  // Truncate text with ellipsis
  truncateText: (text: string, length: number): string => {
    if (text.length <= length) return text
    return text.slice(0, length).trim() + '...'
  },

  // Extract hashtags from text
  extractHashtags: (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g
    return text.match(hashtagRegex) || []
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  },
}

/**
 * Error handling utilities
 */
export const errorUtils = {
  isNetworkError: (error: any): boolean => {
    return (
      error?.code === 'NETWORK_ERROR' ||
      error?.message?.includes('Network Error') ||
      !navigator.onLine
    )
  },

  getErrorMessage: (error: any): string => {
    if (typeof error === 'string') return error
    if (error?.response?.data?.message) return error.response.data.message
    if (error?.message) return error.message
    return 'An unexpected error occurred'
  },

  createApiError: (message: string, status?: number) => {
    const error = new Error(message)
    ;(error as any).status = status
    return error
  },
}

/**
 * Local storage utilities with type safety
 */
export const storageUtils = {
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  },

  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      // Handle null, undefined, or empty string
      if (!item || item === 'undefined' || item === 'null') {
        return null
      }
      return JSON.parse(item)
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      // Clear invalid data
      try {
        localStorage.removeItem(key)
      } catch {}
      return null
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
    }
  },

  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  },
}
