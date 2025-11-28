import { io, Socket } from 'socket.io-client'
import { toast } from 'react-hot-toast'
import { apiClient } from './api-client'

// Socket.IO configuration
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

export interface SocketEvents {
  // Connection events
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void

  // User events
  user_online: (data: { userId: string; timestamp: number }) => void
  user_offline: (data: { userId: string; timestamp: number }) => void
  user_typing: (data: { userId: string; videoId?: string }) => void

  // Video events
  video_created: (data: { video: any; userId: string }) => void
  video_liked: (data: { videoId: string; userId: string; likeCount: number }) => void
  video_unliked: (data: { videoId: string; userId: string; likeCount: number }) => void
  video_shared: (data: { videoId: string; userId: string; shareCount: number }) => void

  // Comment events
  comment_created: (data: { comment: any; videoId: string }) => void
  comment_liked: (data: { commentId: string; userId: string; likeCount: number }) => void
  comment_deleted: (data: { commentId: string; videoId: string }) => void

  // Follow events
  user_followed: (data: { followerId: string; followeeId: string }) => void
  user_unfollowed: (data: { followerId: string; followeeId: string }) => void

  // Live streaming events
  live_started: (data: { streamId: string; userId: string; title: string }) => void
  live_ended: (data: { streamId: string; userId: string }) => void
  live_viewer_joined: (data: { streamId: string; userId: string; viewerCount: number }) => void
  live_viewer_left: (data: { streamId: string; userId: string; viewerCount: number }) => void

  // Notification events
  notification_received: (data: { notification: any }) => void
  notification_read: (data: { notificationId: string }) => void

  // Chat events
  message_received: (data: { message: any; roomId: string }) => void
  message_sent: (data: { message: any; roomId: string }) => void
}

class SocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnected = false
  private eventListeners: Map<string, Function[]> = new Map()

  constructor() {
    this.connect()
  }

  private connect() {
    try {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        auth: {
          token: apiClient.getToken(),
        },
      })

      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to connect to socket:', error)
      this.handleReconnect()
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.isConnected = true
      this.reconnectAttempts = 0

      // Re-authenticate if token is available
      const token = apiClient.getToken()
      if (token) {
        this.authenticate(token)
      }
    })

    this.socket.on('disconnect', reason => {
      console.log('Socket disconnected:', reason)
      this.isConnected = false

      if (reason === 'io server disconnect') {
        // Server disconnected the socket, need manual reconnection
        this.handleReconnect()
      }
    })

    this.socket.on('connect_error', error => {
      console.error('Socket connection error:', error)
      this.isConnected = false
      this.handleReconnect()
    })

    // Authentication events
    this.socket.on('authenticated', data => {
      console.log('Socket authenticated:', data)
      this.joinUserRoom(data.userId)
    })

    this.socket.on('authentication_error', error => {
      console.error('Socket authentication error:', error)
      toast.error('Real-time connection failed')
    })

    // Error handling
    this.socket.on('error', error => {
      console.error('Socket error:', error)
      toast.error('Connection error occurred')
    })
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
      toast.error('Unable to establish real-time connection')
    }
  }

  public authenticate(token: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('authenticate', { token })
    }
  }

  public joinUserRoom(userId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_user_room', { userId })
    }
  }

  public joinVideoRoom(videoId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_video_room', { videoId })
    }
  }

  public leaveVideoRoom(videoId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_video_room', { videoId })
    }
  }

  public joinLiveRoom(streamId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_live_room', { streamId })
    }
  }

  public leaveLiveRoom(streamId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_live_room', { streamId })
    }
  }

  // Event emission methods
  public likeVideo(videoId: string) {
    this.emit('video_like', { videoId })
  }

  public unlikeVideo(videoId: string) {
    this.emit('video_unlike', { videoId })
  }

  public shareVideo(videoId: string, shareType: string = 'link') {
    this.emit('video_share', { videoId, shareType })
  }

  public createComment(videoId: string, content: string, parentId?: string) {
    this.emit('comment_create', { videoId, content, parentId })
  }

  public likeComment(commentId: string) {
    this.emit('comment_like', { commentId })
  }

  public followUser(userId: string) {
    this.emit('user_follow', { userId })
  }

  public unfollowUser(userId: string) {
    this.emit('user_unfollow', { userId })
  }

  public sendTyping(videoId?: string) {
    this.emit('user_typing', { videoId })
  }

  public sendMessage(roomId: string, content: string) {
    this.emit('message_send', { roomId, content })
  }

  public startLiveStream(title: string) {
    this.emit('live_start', { title })
  }

  public endLiveStream(streamId: string) {
    this.emit('live_end', { streamId })
  }

  // Generic event emission
  public emit(event: string, data?: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data)
    } else {
      console.warn(`Cannot emit ${event}: socket not connected`)
    }
  }

  // Event listening
  public on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): () => void {
    if (!this.socket) {
      console.warn(`Cannot listen to ${String(event)}: socket not available`)
      return () => {}
    }

    this.socket.on(event as string, callback)

    // Store listener for cleanup
    if (!this.eventListeners.has(event as string)) {
      this.eventListeners.set(event as string, [])
    }
    this.eventListeners.get(event as string)!.push(callback)

    // Return cleanup function
    return () => {
      this.off(event, callback)
    }
  }

  public off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) {
    if (!this.socket) return

    if (callback) {
      this.socket.off(event as string, callback)

      // Remove from stored listeners
      const listeners = this.eventListeners.get(event as string)
      if (listeners) {
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    } else {
      this.socket.off(event as string)
      this.eventListeners.delete(event as string)
    }
  }

  // Connection status
  public getConnectionStatus(): {
    connected: boolean
    socketId?: string
    reconnectAttempts: number
  } {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts,
    }
  }

  // Cleanup
  public disconnect() {
    if (this.socket) {
      // Remove all listeners
      this.eventListeners.clear()
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  public reconnect() {
    this.disconnect()
    this.reconnectAttempts = 0
    this.connect()
  }
}

// Create singleton instance
export const socketManager = new SocketManager()

// Export hooks for React components
export const useSocket = () => socketManager

export default socketManager
