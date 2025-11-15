export interface ILike {
  id: string;
  userId: string;
  videoId: string;
  createdAt: Date;
}

export interface IComment {
  id: string;
  userId: string;
  videoId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IView {
  videoId: string;
  userId?: string;
  timestamp: Date;
}
