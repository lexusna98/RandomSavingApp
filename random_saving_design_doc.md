# Bản thiết kế chi tiết ứng dụng web: Random tiết kiệm hàng ngày (v2)

## 1. Mục tiêu ứng dụng

Xây dựng một ứng dụng web cho phép người dùng quay ngẫu nhiên một số đại diện cho **một ngày trong năm** nhằm tạo thói quen tiết kiệm tiền hàng ngày.

Các mục tiêu chính:

- Quay ngẫu nhiên một số trong khoảng **1 → 365 hoặc 366** (tùy năm nhuận)
- Người dùng **có thể chọn một ngày trong quá khứ của năm hiện tại** để thực hiện quay số
- **Không cho phép quay cho năm trước**
- **Không cho phép quay cho ngày trong tương lai**
- Mỗi số chỉ được quay **một lần duy nhất trong năm**
- Lưu lịch sử các lần quay
- Hiển thị danh sách các lần quay

Ứng dụng hướng tới mục đích:

- tạo thói quen tiết kiệm
- mỗi số tương ứng với số tiền tiết kiệm (ví dụ: số * 1000 VND)

---

# 2. Phạm vi chức năng

## 2.1 Chọn ngày quay

Người dùng có thể chọn một ngày bất kỳ **trong quá khứ của năm hiện tại**.

Ví dụ:

Nếu hôm nay là **31/03/2026**

Các ngày hợp lệ:

- 01/01/2026
- 15/02/2026
- 30/03/2026

Các ngày **không hợp lệ**:

- 01/04/2026 (ngày tương lai)
- bất kỳ ngày nào thuộc **2025 trở về trước**

---

## 2.2 Quay số ngẫu nhiên

Khi người dùng bấm nút **Quay số**:

Hệ thống sẽ:

1. Xác định số ngày tối đa trong năm
2. Tạo tập số từ **1 → 365/366**
3. Loại bỏ các số đã quay
4. Chọn ngẫu nhiên một số còn lại
5. Lưu kết quả

---

## 2.3 Ràng buộc ngày hợp lệ

### Trường hợp 1: năm nhỏ hơn năm hiện tại

Không cho phép quay.

### Trường hợp 2: năm hiện tại

Chỉ cho phép quay cho các ngày:

```
01/01 → ngày hiện tại
```

Nếu người dùng chọn ngày tương lai:

- Nút quay bị vô hiệu hóa

---

## 2.4 Quy tắc không quay trùng

Mỗi số trong năm chỉ được quay **một lần duy nhất**.

Sau khi một số đã được quay:

- thêm vào danh sách lịch sử
- loại khỏi tập số có thể quay

Nếu toàn bộ số hợp lệ đã được quay:

- khóa nút quay
- hiển thị thông báo:

```
Đã quay hết toàn bộ số trong năm
```

---

# 3. Quy tắc nghiệp vụ

## 3.1 Xác định năm nhuận

Một năm là năm nhuận nếu:

- chia hết cho 400
- hoặc chia hết cho 4 nhưng không chia hết cho 100

Ví dụ:

| Năm | Kết quả |
|----|----|
|2024|366 ngày|
|2025|365 ngày|

---

## 3.2 Xác định phạm vi số hợp lệ

Phạm vi số **luôn được khởi tạo theo số ngày tối đa của năm**.

```
Năm thường → 1 → 365
Năm nhuận → 1 → 366
```

Hệ thống **không cần giới hạn theo dayOfYear hiện tại**.

Quy trình xác định tập số hợp lệ:

1. Tạo danh sách số từ `1 → 365/366`
2. Lấy danh sách các số đã quay trong lịch sử
3. Loại bỏ các số đã quay khỏi tập số

Ví dụ:

```
Danh sách ban đầu:
[1..365]
```

```
Đã quay:
10, 25, 70
```

Sau khi loại bỏ:

```
[1..365] - [10,25,70]
```

Hệ thống sẽ random một số trong **tập còn lại**.

# 4. Mô hình dữ liệu

## 4.1 Thông tin năm

```json
{
  "year": 2026,
  "maxNumber": 365
}
```

Ý nghĩa:

- `year` : năm hiện tại
- `maxNumber` : số tối đa có thể quay trong năm

---

## 4.2 Kết quả một lần quay

```json
{
  "id": "uuid",
  "year": 2026,
  "number": 127,
  "drawDate": "2026-03-10",
  "drawnAt": "2026-03-10T09:30:00Z"
}
```

Ý nghĩa:

| field | mô tả |
|---|---|
|id|mã định danh|
|year|năm áp dụng|
|number|số random trong năm|
|drawDate|ngày mà người dùng chọn để quay|
|drawnAt|thời điểm thực tế hệ thống thực hiện quay|

Lưu ý:

Ứng dụng **chỉ lưu số**, không cần chuyển đổi sang ngày trong năm.

---

## 4.3 Lịch sử quay

Dữ liệu lịch sử được lưu **theo từng record**, không cần phân nhóm theo năm.

```json
[
  {
    "id": "a1",
    "year": 2026,
    "number": 25,
    "drawDate": "2026-03-01",
    "drawnAt": "2026-03-01T09:00:00Z"
  }
]
```

Trong đó trường `year` được sử dụng để truy vấn lịch sử theo năm khi cần.

---

# 5. Kiến trúc hệ thống

Ứng dụng được thiết kế theo mô hình **Fullstack Next.js**.

```
Browser
   │
   ▼
Next.js Frontend (React)
   │
   ▼
Next.js API Routes
   │
   ▼
Storage (Database hoặc LocalStorage)
```

---

## 5.1 Frontend

Công nghệ:

- Next.js
- React
- TailwindCSS

Nhiệm vụ:

- hiển thị giao diện
- chọn ngày quay
- hiển thị kết quả
- hiển thị lịch sử
- gọi API backend

---

## 5.2 Backend API

Sử dụng **Next.js API Routes**.

Nhiệm vụ:

- xử lý logic random
- kiểm tra rule nghiệp vụ
- lưu dữ liệu

---

## 5.3 Storage

Ứng dụng sử dụng **SQLite** làm cơ sở dữ liệu.

Lý do lựa chọn:

- đơn giản, nhẹ
- phù hợp ứng dụng nhỏ
- không cần quản lý database server
- tích hợp tốt với Next.js

SQLite có thể được truy cập thông qua:

- Prisma ORM
- hoặc thư viện `better-sqlite3`

---

# 6. Thiết kế API

## 6.1 Lấy lịch sử quay

### Request

```
GET /api/history?year=2026
```

### Response

```json
{
  "results": []
}
```

---

## 6.2 Quay số

### Request

```
POST /api/draw
```

Body

```json
{
  "year": 2026,
  "drawDate": "2026-03-10"
}
```

### Flow xử lý

1. nhận request từ frontend
2. lấy lịch sử các số đã quay
3. tạo tập số từ `1 → 365/366`
4. loại bỏ các số đã quay
5. random một số còn lại
6. lưu kết quả vào database

Lưu ý:

Việc kiểm tra **ngày tương lai** được xử lý ở **frontend**. 

Frontend sẽ:

- disable nút quay khi người dùng chọn ngày trong tương lai
- hiển thị thông báo cho người dùng

Do đó backend không cần xử lý validation này.

---

### Response

```json
{
  "result": {
    "id": "uuid",
    "number": 85,
    "drawDate": "2026-03-10",
    "drawnAt": "2026-03-10T09:30:00Z"
  }
}
```

---

# 7. Luồng hoạt động

### Luồng chính

1. Người dùng mở ứng dụng
2. Hệ thống mặc định chọn ngày hiện tại
3. Frontend gọi API lấy lịch sử
4. Người dùng bấm **Quay số**
5. API xử lý random
6. Lưu kết quả
7. Trả về kết quả
8. UI cập nhật lịch sử

---

# 8. Thiết kế giao diện

## 8.1 Bố cục

Ứng dụng gồm các khu vực:

1. Header
2. Khu chọn ngày
3. Khu thống kê tiền tiết kiệm
4. Nút quay
5. Khu hiển thị kết quả
6. Lịch sử

---

## 8.2 Thống kê tiền tiết kiệm

Công thức:

```
Tổng tiền = tổng(number) * 1000
```

Ví dụ:

```
10 + 25 + 70 = 105
```

```
105 * 1000 = 105000 VND
```

---

# 9. Phân trang lịch sử

Hiển thị:

- 10 record / trang

Các cột:

| STT | Thời điểm quay | Số |
|----|----|----|

Sắp xếp:

```
mới nhất → cũ nhất
```

---

# 10. Trạng thái giao diện

### Loading

```
Đang quay...
```

### Hết số

```
Đã quay hết toàn bộ số trong năm
```

### Empty

```
Chưa có lần quay nào
```


# 11. Database Schema (SQLite)

Ứng dụng sử dụng một bảng chính để lưu lịch sử quay số.

## 11.1 Table: draws

```sql
CREATE TABLE draws (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  number INTEGER NOT NULL,
  draw_date TEXT NOT NULL,
  drawn_at TEXT NOT NULL
);
```

### Ý nghĩa các cột

| Column | Type | Mô tả |
|---|---|---|
|id|TEXT|UUID của record|
|year|INTEGER|Năm áp dụng của lần quay|
|number|INTEGER|Số random trong khoảng 1 → 365/366|
|draw_date|TEXT|Ngày người dùng chọn để quay|
|drawn_at|TEXT|Timestamp hệ thống thực hiện quay|

---

## 11.2 Index

Để tối ưu truy vấn theo năm:

```sql
CREATE INDEX idx_draws_year ON draws(year);
```

Nếu cần đảm bảo **không quay trùng số trong cùng một năm**:

```sql
CREATE UNIQUE INDEX idx_draw_unique_number_year
ON draws(year, number);
```

Index này đảm bảo database sẽ không cho phép lưu hai record có cùng `number` trong cùng một `year`.

---

# 12. Sequence Diagram – API /draw

Luồng xử lý khi người dùng quay số.

```
User
  │
  │ click "Quay số"
  ▼
Frontend (Next.js)
  │
  │ POST /api/draw
  ▼
API Route
  │
  │ query lịch sử từ SQLite
  ▼
Database
  │
  │ trả danh sách số đã quay
  ▼
API Route
  │
  │ tạo danh sách 1..365/366
  │ loại bỏ số đã quay
  │ random một số
  │ lưu record
  ▼
Database
  │
  │ insert record
  ▼
API Route
  │
  │ trả kết quả
  ▼
Frontend
  │
  │ hiển thị số vừa quay
  ▼
User
```

### Tóm tắt

Quy trình xử lý chính của API `/draw`:

1. nhận request từ frontend
2. truy vấn lịch sử các số đã quay
3. tạo tập số `1..365/366`
4. loại bỏ các số đã quay
5. random một số
6. lưu record vào SQLite
7. trả kết quả về frontend


# 13. Project Structure (Next.js)

Đề xuất cấu trúc thư mục cho project sử dụng **Next.js App Router**.

```
random-saving-app/
│
├─ app/
│  ├─ page.tsx
│  ├─ layout.tsx
│  │
│  └─ api/
│     ├─ draw/
│     │  └─ route.ts
│     └─ history/
│        └─ route.ts
│
├─ components/
│  ├─ DrawButton.tsx
│  ├─ ResultDisplay.tsx
│  ├─ DatePicker.tsx
│  └─ HistoryTable.tsx
│
├─ lib/
│  ├─ random.ts
│  ├─ date-utils.ts
│  └─ validators.ts
│
├─ db/
│  ├─ client.ts
│  └─ schema.sql
│
├─ hooks/
│  └─ useHistory.ts
│
├─ types/
│  └─ draw.ts
│
├─ styles/
│  └─ globals.css
│
└─ package.json
```

## 13.1 Thư mục `app/`

Chứa toàn bộ routing của Next.js.

- `page.tsx` : trang chính của ứng dụng
- `layout.tsx` : layout chung
- `api/` : API routes cho backend

---

## 13.2 Thư mục `components/`

Chứa các UI component tái sử dụng.

Ví dụ:

- `DrawButton` : nút quay số
- `ResultDisplay` : hiển thị kết quả vừa quay
- `DatePicker` : chọn ngày
- `HistoryTable` : bảng lịch sử

---

## 13.3 Thư mục `lib/`

Chứa các logic dùng chung:

- `random.ts` : thuật toán random số
- `date-utils.ts` : xử lý ngày
- `validators.ts` : validation

---

## 13.4 Thư mục `db/`

Chứa logic truy cập database.

- `client.ts` : khởi tạo kết nối SQLite
- `schema.sql` : định nghĩa bảng

---

## 13.5 Thư mục `hooks/`

Custom React hooks.

Ví dụ:

- `useHistory` : fetch và quản lý lịch sử quay

---

## 13.6 Thư mục `types/`

Định nghĩa TypeScript types.

Ví dụ:

```
DrawRecord
DrawRequest
DrawResponse
```

---

Cấu trúc này giúp:

- tách rõ **UI / business logic / database**
- dễ maintain
- dễ mở rộng nếu ứng dụng phát triển thêm tính năng


# 14. SQL Migration & Prisma Schema

Để quản lý database SQLite thuận tiện, project có thể sử dụng **Prisma ORM**.

## 14.1 SQL Migration

```sql
-- migration: create_draws_table
CREATE TABLE IF NOT EXISTS draws (
  id TEXT PRIMARY KEY,
  year INTEGER NOT NULL,
  number INTEGER NOT NULL,
  draw_date TEXT NOT NULL,
  drawn_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_draws_year
ON draws(year);

CREATE UNIQUE INDEX IF NOT EXISTS idx_draw_unique_number_year
ON draws(year, number);
```

---

## 14.2 Prisma Schema

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Draw {
  id       String @id
  year     Int
  number   Int
  drawDate String
  drawnAt  String

  @@unique([year, number])
  @@index([year])
}
```

Sau khi định nghĩa schema, chạy các lệnh:

```
npx prisma migrate dev
npx prisma generate
```

---

# 15. API /draw – Next.js Route Handler (Skeleton Code)

Ví dụ implement API `/api/draw` trong **Next.js App Router**.

File:

```
app/api/draw/route.ts
```

```ts
import { NextResponse } from "next/server"
import { prisma } from "@/db/client"
import { randomAvailableNumber } from "@/lib/random"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { year, drawDate } = body

    if (!year || !drawDate) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // lấy lịch sử các số đã quay
    const history = await prisma.draw.findMany({
      where: { year },
      select: { number: true }
    })

    const usedNumbers = history.map(r => r.number)

    // random số
    const number = randomAvailableNumber(year, usedNumbers)

    const record = {
      id: uuidv4(),
      year,
      number,
      drawDate,
      drawnAt: new Date().toISOString()
    }

    await prisma.draw.create({
      data: record
    })

    return NextResponse.json({ result: record })

  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
```

---

# 16. Thuật toán Random Chuẩn Production

Thuật toán được thiết kế để:

- tránh quay trùng
- hiệu năng tốt
- dễ kiểm soát logic

## 16.1 Generate danh sách số

```ts
function generateNumbers(max: number): number[] {
  const arr = []

  for (let i = 1; i <= max; i++) {
    arr.push(i)
  }

  return arr
}
```

---

## 16.2 Loại bỏ số đã quay

```ts
function filterUsedNumbers(
  allNumbers: number[],
  usedNumbers: number[]
): number[] {
  const usedSet = new Set(usedNumbers)

  return allNumbers.filter(n => !usedSet.has(n))
}
```

---

## 16.3 Random một số

```ts
function randomPick(numbers: number[]): number {
  const index = Math.floor(Math.random() * numbers.length)

  return numbers[index]
}
```

---

## 16.4 Hàm tổng hợp

File:

```
lib/random.ts
```

```ts
export function randomAvailableNumber(
  year: number,
  usedNumbers: number[]
): number {

  const isLeapYear = (year % 400 === 0) ||
    (year % 4 === 0 && year % 100 !== 0)

  const max = isLeapYear ? 366 : 365

  const allNumbers = Array.from(
    { length: max },
    (_, i) => i + 1
  )

  const usedSet = new Set(usedNumbers)

  const available = allNumbers.filter(
    n => !usedSet.has(n)
  )

  if (available.length === 0) {
    throw new Error("No numbers available")
  }

  const index = Math.floor(
    Math.random() * available.length
  )

  return available[index]
}
```

---

### Đặc điểm của thuật toán

- complexity: **O(n)** với n ≤ 366
- đơn giản và dễ kiểm soát
- phù hợp cho ứng dụng quy mô nhỏ

Với kích thước tập số rất nhỏ (≤ 366), thuật toán này được xem là **đủ tối ưu cho production**.


# 17. Deployment Design (Local PC with Docker)

Hệ thống được thiết kế để deploy đơn giản trên **máy PC cá nhân** bằng Docker. Điều này giúp:

- dễ cài đặt
- môi trường chạy ổn định
- dễ backup database
- dễ migrate sang VPS sau này

---

## 17.1 Kiến trúc Deploy

```
Browser
   ↓
Next.js App (Docker container)
   ↓
SQLite Database (mounted volume)
   ↓
Host Machine (PC)
```

SQLite được lưu bằng **Docker volume hoặc bind mount** để đảm bảo dữ liệu không mất khi container restart.

---

## 17.2 Dockerfile

Ví dụ Dockerfile cho Next.js production:

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 17.3 docker-compose.yml

Sử dụng docker compose để chạy ứng dụng.

```yaml
version: "3.9"

services:
  app:
    build: .
    container_name: random-day-app
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/prisma
    restart: always
```

Giải thích:

```
./data
```

là thư mục trên PC dùng để lưu file SQLite.

Ví dụ:

```
/data
  dev.db
```

---

## 17.4 Biến môi trường

File `.env`

```
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production
```

---

## 17.5 Build và Run

Build container:

```
docker compose build
```

Run application:

```
docker compose up -d
```

Sau khi chạy thành công, ứng dụng truy cập tại:

```
http://localhost:3000
```

---

## 17.6 Backup Database

Do SQLite chỉ là một file nên việc backup rất đơn giản.

Chỉ cần copy file:

```
/data/dev.db
```

Ví dụ:

```
cp data/dev.db backup/dev-2026-01-01.db
```

---

## 17.7 Upgrade Application

Khi update code:

```
git pull
```

Sau đó rebuild container:

```
docker compose build

docker compose up -d
```

Database sẽ **không bị mất** vì được lưu trong volume.

---

## 17.8 Future Scaling

Nếu cần deploy lên server sau này, kiến trúc gần như giữ nguyên:

```
PC Docker
   ↓
VPS Docker
   ↓
Cloud (Render / Fly.io)
```

Chỉ cần thay:

- SQLite → PostgreSQL
- update Prisma datasource

Phần còn lại của hệ thống **không cần thay đổi lớn**.

