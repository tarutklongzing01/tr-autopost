import {NextResponse} from 'next/server';import {listFacebookPages} from '@/lib/facebook/pages';
export const dynamic='force-dynamic';export async function GET(){try{return NextResponse.json({pages:await listFacebookPages(),mockMode:process.env.FACEBOOK_MOCK_MODE!=='false'})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Failed to load pages'},{status:500})}}
