export interface UserEntity {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectEntity {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagEntity {
  id: string;
  userId: string;
  projectId: string | null;
  name: string;
  colorHex: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteEntity {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  summary: string | null;
  content: string;
  noteDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteWithTagsEntity extends NoteEntity {
  tags: TagEntity[];
}
