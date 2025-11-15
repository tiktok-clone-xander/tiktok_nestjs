const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

let socket: any = null;

export const getSocket = (token?: string): any => {
  if (!socket) {
    // Only create socket on the client. Use a dynamic import so the
    // bundler doesn't include `socket.io-client` in the server build.
    if (typeof window === 'undefined') return null;

    import('socket.io-client').then(({ io }) => {
      socket = io(`${WS_URL}/ws`, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('WebSocket connected:', socket?.id);
      });

      socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socket.on('connect_error', (error: any) => {
        console.error('WebSocket connection error:', error);
      });
    }).catch((err) => {
      console.error('Failed to load socket.io-client:', err);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event helpers
export const joinVideoRoom = (videoId: string) => {
  socket?.emit('join_video', { videoId });
};

export const leaveVideoRoom = (videoId: string) => {
  socket?.emit('leave_video', { videoId });
};

// Event listeners
export const onVideoLiked = (callback: (data: any) => void) => {
  socket?.on('video:liked', callback);
};

export const onVideoUnliked = (callback: (data: any) => void) => {
  socket?.on('video:unliked', callback);
};

export const onVideoComment = (callback: (data: any) => void) => {
  socket?.on('video:comment', callback);
};

export const onVideoCommentDeleted = (callback: (data: any) => void) => {
  socket?.on('video:comment_deleted', callback);
};

export const onViewsUpdated = (callback: (data: any) => void) => {
  socket?.on('video:views_updated', callback);
};

export const onNewVideo = (callback: (data: any) => void) => {
  socket?.on('video:new', callback);
};

export const onNotification = (callback: (data: any) => void) => {
  socket?.on('notification', callback);
};

// Remove event listeners
export const offVideoLiked = () => {
  socket?.off('video:liked');
};

export const offVideoUnliked = () => {
  socket?.off('video:unliked');
};

export const offVideoComment = () => {
  socket?.off('video:comment');
};

export const offVideoCommentDeleted = () => {
  socket?.off('video:comment_deleted');
};

export const offViewsUpdated = () => {
  socket?.off('video:views_updated');
};

export const offNewVideo = () => {
  socket?.off('video:new');
};

export const offNotification = () => {
  socket?.off('notification');
};
