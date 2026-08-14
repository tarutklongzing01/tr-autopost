import {App,cert,getApp,getApps,initializeApp} from 'firebase-admin/app';import {getFirestore} from 'firebase-admin/firestore';import {getStorage} from 'firebase-admin/storage';
import {getAuth} from 'firebase-admin/auth';
function create():App|null{const projectId=process.env.FIREBASE_PROJECT_ID,clientEmail=process.env.FIREBASE_CLIENT_EMAIL,privateKey=process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,'\n');if(!projectId||!clientEmail||!privateKey)return null;return getApps().length?getApp():initializeApp({credential:cert({projectId,clientEmail,privateKey}),storageBucket:process.env.FIREBASE_STORAGE_BUCKET||process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET||`${projectId}.firebasestorage.app`})}
export const adminApp=create();export const adminDb=adminApp?getFirestore(adminApp):null;
export const adminStorage=adminApp?getStorage(adminApp):null;
export const adminDbRequired=adminDb as FirebaseFirestore.Firestore;
export const adminAuth=adminApp?getAuth(adminApp):null;
