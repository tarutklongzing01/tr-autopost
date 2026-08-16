export type PostStatus='draft'|'scheduled'|'processing'|'published'|'failed';
export type FacebookPage={id:string;name:string;pageId:string;avatarUrl:string;connected:boolean};
export type Post={id:string;caption:string;imageUrl:string;postType?:'image'|'text';status:PostStatus;pageIds:string[];scheduledAt:string|null;timezone:'Asia/Bangkok';facebookPostIds:Record<string,string>;errorMessage:string|null;createdAt:string;updatedAt:string;publishedAt:string|null};
