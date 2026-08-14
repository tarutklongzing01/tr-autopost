# FB AutoPost Lite

เว็บแอปส่วนตัวสำหรับจัดการและตั้งเวลาโพสต์ Facebook Page 1–2 เพจ พัฒนาด้วย Next.js, TypeScript, Tailwind CSS และ Firebase โดยการเผยแพร่ Facebook ยังเป็น Mock Mode

## เริ่มใช้งาน

1. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่า Firebase
2. รัน `npm install`
3. รัน `npm run dev`
4. เปิด http://localhost:3000/login

หากยังไม่ใส่ Firebase ระบบ Login จะเป็น Demo Mode และใช้ข้อมูลตัวอย่างได้ทันที

## Firebase

- เปิด Authentication > Sign-in method > Email/Password และสร้าง user ทดสอบ
- สร้าง Cloud Firestore และ collections `facebookPages`, `posts`
- เปิด Storage และเก็บรูปที่ `posts/{userId}/{postId}/image`
- จำกัดไฟล์เป็น `image/jpeg`, `image/png`, `image/webp` และขนาดไม่เกิน 10 MB
- สร้าง Service Account แล้วนำ `project_id`, `client_email`, `private_key` มาใส่ตัวแปรฝั่ง server

โครงสร้าง document ดูได้ที่ `lib/types.ts` และข้อมูลเริ่มต้นที่ `lib/mock-data.ts`

## Mock Cron

ตั้งค่า `CRON_SECRET` และเรียก:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/publish
```

Cron จะ claim งานด้วย Firestore transaction ก่อนเปลี่ยนเป็น `processing` เพื่อป้องกันโพสต์ซ้ำ จากนั้นใช้ Mock Publisher และบันทึก `mock_*` post ID

เมื่อ `FACEBOOK_MOCK_MODE=false` หน้า Create Post จะใช้เพจจริง อัปโหลดรูปเข้า ImageKit บันทึกโพสต์ลง Firestore และส่งผ่าน Meta Graph API จริง หน้า Dashboard, Queue, Calendar และ History อ่านข้อมูลจาก Firestore ส่วนแท็บ “โพสต์บน Facebook” ใน History ดึงโพสต์ล่าสุดจาก Meta โดยตรง

## เชื่อม Facebook Page จริง

1. สร้างแอปที่ Meta for Developers และเพิ่ม Facebook Login for Business/Web
2. เพิ่ม Valid OAuth Redirect URI เป็น `http://localhost:3000/api/facebook/callback` สำหรับเครื่องพัฒนา และ URL เดียวกันภายใต้โดเมน Vercel สำหรับ Production
3. ขอ permissions `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `business_management`
4. ใส่ `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`, `NEXT_PUBLIC_APP_URL`
5. สร้างกุญแจเข้ารหัส 32 ไบต์ แล้วใส่เป็น Base64 ใน `TOKEN_ENCRYPTION_KEY`
6. เปลี่ยน `FACEBOOK_MOCK_MODE=false` แล้วเปิดหน้า `/pages` เพื่อเชื่อมบัญชี

ใน Development Mode เฉพาะบัญชีที่ถูกเพิ่มเป็น Admin/Developer/Tester ของ Meta App จะใช้งานได้ การให้ผู้ใช้อื่นเชื่อมต้องเปิดแอปเป็น Live และผ่าน App Review สำหรับ permissions ข้างต้น

Page Access Token ถูกเข้ารหัส AES-256-GCM ก่อนบันทึกลง `facebookPages.accessTokenEncrypted` และไม่ถูกส่งกลับไปยัง browser

## คำสั่งตรวจสอบ

```bash
npm run lint
npm run typecheck
npm run build
```

## ส่วนที่ยังเป็น Mock

Facebook OAuth, การดึง Facebook Pages และการ publish ผ่าน Meta Graph API ยังไม่เรียก API จริง ขั้นต่อไปคือเก็บ Page Access Token อย่างปลอดภัยฝั่ง server และแทน implementation ใน `lib/facebook` โดยรักษา interface เดิมไว้
