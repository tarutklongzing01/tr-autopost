import {Timestamp} from 'firebase-admin/firestore';
import {adminDb} from '@/lib/firebase/admin';
import {decryptToken,encryptToken} from './token-vault';
import {GRAPH_URL,graphFetch} from './auth';
import type {ConnectedPage,MetaPage} from './types';

export async function fetchManagedPages(userToken:string){
  const url=new URL(`${GRAPH_URL}/me/accounts`);
  url.searchParams.set('fields','id,name,access_token,picture.type(square),tasks');
  url.searchParams.set('limit','100');
  url.searchParams.set('access_token',userToken);
  return graphFetch<{data:MetaPage[]}>(url);
}

export async function saveManagedPages(items:MetaPage[]){
  if(!adminDb)throw new Error('Firebase Admin is not configured');
  const batch=adminDb.batch();
  for(const page of items){
    const ref=adminDb.collection('facebookPages').doc(page.id);
    batch.set(ref,{name:page.name,pageId:page.id,avatarUrl:page.picture?.data?.url||'',connected:true,accessTokenEncrypted:encryptToken(page.access_token),tasks:page.tasks||[],updatedAt:Timestamp.now(),createdAt:Timestamp.now()},{merge:true});
  }
  await batch.commit();
}

export async function listFacebookPages():Promise<ConnectedPage[]>{
  if(!adminDb)return [];
  const snapshot=await adminDb.collection('facebookPages').where('connected','==',true).get();
  return snapshot.docs.map(doc=>{const data=doc.data();return {id:doc.id,name:data.name,pageId:data.pageId,avatarUrl:data.avatarUrl||'',connected:true}});
}

export async function getPageAccessToken(pageId:string){
  if(!adminDb)throw new Error('Firebase Admin is not configured');
  const direct=await adminDb.collection('facebookPages').doc(pageId).get();
  let data=direct.exists?direct.data():undefined;
  if(!data){const query=await adminDb.collection('facebookPages').where('pageId','==',pageId).limit(1).get();data=query.docs[0]?.data()}
  if(!data?.accessTokenEncrypted)throw new Error(`No Page Access Token for ${pageId}`);
  return decryptToken(data.accessTokenEncrypted);
}
