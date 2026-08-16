export type PublishImageInput={pageId:string;caption:string;imageUrl:string};
export type PublishTextInput={pageId:string;caption:string};
export type PublishResult={success:boolean;postId:string};
export type MetaPage={id:string;name:string;access_token:string;picture?:{data?:{url?:string}};tasks?:string[]};
export type ConnectedPage={id:string;name:string;pageId:string;avatarUrl:string;connected:boolean;createdAt?:string};
