import {GRAPH_URL,graphFetch} from './auth';import {getPageAccessToken} from './pages';import {PublishImageInput,PublishResult,PublishTextInput} from './types';
export async function publishImagePost(input:PublishImageInput):Promise<PublishResult>{
  if(process.env.FACEBOOK_MOCK_MODE!=='false'){await new Promise(r=>setTimeout(r,250));return {success:true,postId:`mock_${Date.now()}_${input.pageId}`}}
  const accessToken=await getPageAccessToken(input.pageId);
  const body=new URLSearchParams({url:input.imageUrl,caption:input.caption,access_token:accessToken});
  const result=await graphFetch<{id:string;post_id?:string}>(`${GRAPH_URL}/${encodeURIComponent(input.pageId)}/photos`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  return {success:true,postId:result.post_id||result.id};
}
export async function publishTextPost(input:PublishTextInput):Promise<PublishResult>{
  if(process.env.FACEBOOK_MOCK_MODE!=='false'){await new Promise(r=>setTimeout(r,250));return {success:true,postId:`mock_${Date.now()}_${input.pageId}`}}
  const accessToken=await getPageAccessToken(input.pageId);
  const body=new URLSearchParams({message:input.caption,access_token:accessToken});
  const result=await graphFetch<{id:string}>(`${GRAPH_URL}/${encodeURIComponent(input.pageId)}/feed`,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  return {success:true,postId:result.id};
}
