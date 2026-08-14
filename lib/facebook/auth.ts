import crypto from 'node:crypto';

export const GRAPH_VERSION=process.env.META_GRAPH_API_VERSION||'v25.0';
export const GRAPH_URL=`https://graph.facebook.com/${GRAPH_VERSION}`;
export const FACEBOOK_SCOPES=['pages_show_list','pages_read_engagement','pages_manage_posts','business_management'];

function required(name:'META_APP_ID'|'META_APP_SECRET'|'META_REDIRECT_URI'){
  const value=process.env[name];
  if(!value)throw new Error(`${name} is not configured`);
  return value;
}

export function getFacebookAuthUrl(state:string){
  const url=new URL(`https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`);
  url.searchParams.set('client_id',required('META_APP_ID'));
  url.searchParams.set('redirect_uri',required('META_REDIRECT_URI'));
  url.searchParams.set('state',state);
  url.searchParams.set('scope',FACEBOOK_SCOPES.join(','));
  url.searchParams.set('response_type','code');
  return url.toString();
}

export async function exchangeCodeForLongLivedToken(code:string){
  const shortUrl=new URL(`${GRAPH_URL}/oauth/access_token`);
  shortUrl.searchParams.set('client_id',required('META_APP_ID'));
  shortUrl.searchParams.set('client_secret',required('META_APP_SECRET'));
  shortUrl.searchParams.set('redirect_uri',required('META_REDIRECT_URI'));
  shortUrl.searchParams.set('code',code);
  const short=await graphFetch<{access_token:string}>(shortUrl);
  const longUrl=new URL(`${GRAPH_URL}/oauth/access_token`);
  longUrl.searchParams.set('grant_type','fb_exchange_token');
  longUrl.searchParams.set('client_id',required('META_APP_ID'));
  longUrl.searchParams.set('client_secret',required('META_APP_SECRET'));
  longUrl.searchParams.set('fb_exchange_token',short.access_token);
  return graphFetch<{access_token:string;expires_in?:number}>(longUrl);
}

export async function graphFetch<T>(url:URL|string,init?:RequestInit):Promise<T>{
  const response=await fetch(url,{...init,cache:'no-store'});
  const data=await response.json() as T&{error?:{message?:string;code?:number}};
  if(!response.ok||data.error)throw new Error(data.error?.message||`Meta API failed (${response.status})`);
  return data;
}

export function randomOAuthState(){return crypto.randomBytes(32).toString('hex')}
