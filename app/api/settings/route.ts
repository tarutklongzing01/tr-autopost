import {NextRequest,NextResponse} from 'next/server';
import {adminDbRequired as adminDb} from '@/lib/firebase/admin';

export const dynamic='force-dynamic';
const defaults={timezone:'Asia/Bangkok',defaultPageId:'',defaultTime:'20:00',defaultPostMode:'schedule',defaultTextOnly:false};

export async function GET(){
  if(!adminDb)return NextResponse.json({error:'Firebase Admin is not configured'},{status:503});
  try{
    const snap=await adminDb.collection('appSettings').doc('workspace').get();
    return NextResponse.json({settings:{...defaults,...snap.data()},services:{meta:Boolean(process.env.META_APP_ID&&process.env.META_APP_SECRET),firebase:Boolean(process.env.FIREBASE_PROJECT_ID&&process.env.FIREBASE_CLIENT_EMAIL&&process.env.FIREBASE_PRIVATE_KEY),imageKit:Boolean(process.env.IMAGEKIT_PRIVATE_KEY),cron:Boolean(process.env.CRON_SECRET),facebookLive:process.env.FACEBOOK_MOCK_MODE==='false'}});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to load settings'},{status:500})}
}

export async function PUT(req:NextRequest){
  if(!adminDb)return NextResponse.json({error:'Firebase Admin is not configured'},{status:503});
  try{
    const body=await req.json();
    const defaultPageId=String(body.defaultPageId||'');
    const defaultTime=/^([01]\d|2[0-3]):[0-5]\d$/.test(String(body.defaultTime||''))?String(body.defaultTime):'20:00';
    const defaultPostMode=body.defaultPostMode==='now'?'now':'schedule';
    if(defaultPageId){const page=await adminDb.collection('facebookPages').doc(defaultPageId).get();if(!page.exists||!page.data()?.connected)return NextResponse.json({error:'ไม่พบเพจที่เชื่อมต่อ'},{status:400})}
    const settings={timezone:'Asia/Bangkok',defaultPageId,defaultTime,defaultPostMode,defaultTextOnly:Boolean(body.defaultTextOnly),updatedAt:new Date()};
    await adminDb.collection('appSettings').doc('workspace').set(settings,{merge:true});
    return NextResponse.json({settings});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to save settings'},{status:500})}
}
