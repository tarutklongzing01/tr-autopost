import {App,cert,getApp,getApps,initializeApp} from 'firebase-admin/app';import {getFirestore} from 'firebase-admin/firestore';import {getStorage} from 'firebase-admin/storage';
import {getAuth} from 'firebase-admin/auth';
function normalizePrivateKey(value?:string){if(!value)return '';let key=value.trim();if((key.startsWith('"')&&key.endsWith('"'))||(key.startsWith("'")&&key.endsWith("'")))key=key.slice(1,-1);return key.replace(/\\n/g,'\n')}
function create():App|null{const projectId=process.env.FIREBASE_PROJECT_ID,clientEmail=process.env.FIREBASE_CLIENT_EMAIL,privateKey=normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);if(!projectId||!clientEmail||!privateKey)return null;try{return getApps().length?getApp():initializeApp({credential:cert({projectId,clientEmail,privateKey}),storageBucket:process.env.FIREBASE_STORAGE_BUCKET||process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET||`${projectId}.firebasestorage.app`})}catch(error){console.error('Firebase Admin initialization failed',error);return null}}
export const adminApp=create();export const adminDb=adminApp?getFirestore(adminApp):null;
export const adminStorage=adminApp?getStorage(adminApp):null;
export const adminDbRequired=adminDb as FirebaseFirestore.Firestore;
export const adminAuth=adminApp?getAuth(adminApp):null;
