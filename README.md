# TRACKIFY

TRACKIFY เป็นโปรเจคที่ออกแบบมาเพื่อช่วยจัดการบัญชีรายรับรายจ่ายประจำวัน โดยมาพร้อมฟีเจอร์ที่ครบครันและตอบโจทย์การใช้งานในชีวิตประจำวัน

## **Key Features**
- **ระบบ Login**: จัดการผู้ใช้งานด้วยระบบล็อกอินที่ปลอดภัย
- **ระบบเพิ่ม/ลบ บัญชีใช้จ่าย**: เพิ่มหรือลบบัญชีการเงินตามความต้องการ
- **ระบบเพิ่ม/ลบ ประเภทของการใช้จ่าย**: กำหนดหมวดหมู่ของการใช้จ่ายเองได้
- **ระบบสรุปยอดบัญชี**:
  - รายวัน
  - รายเดือน
  - รายปี
  - หรือระบุช่วงวันที่ที่ต้องการ

## **Tech Stack**
- **Backend**:
  - **Typescript**
  - **Node.js**
  - **Fastify**
  - **TypeORM**
  - **PostgreSQL**
  - **Jest**

## Architecture Diagram
นี่คือโครงสร้างของระบบ Trackify:

![Trackify Architecture](assets/Trackify.drawio.png)

## **Folder Structure**

```plaintext
trackify/
├── src/
│   ├── entity/
│   ├── migration/
│   ├── routes/
│   └── uploads/
│   └── test/
│   └── plugin/
│   └── app.ts
│   └── index.ts
├── .env
├── jest.config.js
├── nodemon.json
├── package.json
├── tsconfig.json
└── README.md
```

## **Installation**

1. **Clone Repository**:
   ```bash
   git clone https://github.com/GaiKT/trackify-app.git
   cd trackify
   ```

2. **ติดตั้ง Dependencies**:
   ```bash
   npm install
   ```

3. **ตั้งค่าตัวแปร Environment**:
   สร้างไฟล์ `.env` และระบุค่าต่าง ๆ เช่น:
   ```env
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DB=trackify_db
   DATABASE_URL=postgresql://username:password@localhost:5432/trackify_db
   JWT_SECRET=your_secret_key
   ```

4. **เริ่มต้นเซิร์ฟเวอร์**:
   ```bash
   npm start
   ```
   หรือในโหมดพัฒนา:
   ```bash
   npm run dev
   ```


