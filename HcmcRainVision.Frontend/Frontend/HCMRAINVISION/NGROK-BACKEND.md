# Chạy backend qua ngrok và trỏ Frontend tới đó

**Lưu ý:** Domain ngrok (vd: `https://xxxx.ngrok-free.app`) là **API backend**, không phải trang web. Mở thẳng URL đó trong trình duyệt sẽ thấy 404 hoặc trang trống — bình thường. Dùng app bằng cách chạy **Frontend** (`npm run dev`) rồi mở http://localhost:5173; app sẽ gọi API qua domain ngrok. Muốn xem API: mở `https://xxxx.ngrok-free.app/swagger`.

## Trang FE deploy (GitHub Pages) bị timeout?

App đọc **URL backend từ file `public/config.json`** (runtime). Mặc định là Render; nếu Render ngủ hoặc timeout, bạn có thể trỏ sang backend khác (vd ngrok) **không cần build lại**:

1. Sửa `public/config.json`, đặt `apiBaseUrl` thành URL backend đang chạy (vd ngrok):
   ```json
   { "apiBaseUrl": "https://xxxx.ngrok-free.app" }
   ```
2. Commit, push → GitHub Actions build & deploy. Trang https://khaiminhvo.github.io/HcmcRainVision.Frontend/ sẽ gọi API qua URL trong `config.json`.
3. Timeout mặc định đã tăng lên 30s để backend free tier có thời gian cold-start.

## 1. Chạy backend trên máy (port 5057)

Ở thư mục backend (HcmcRainVision.Backend), chạy:

```bash
dotnet run
```

(Backend phải listen port **5057** – đúng với mặc định trong FE.)

## 2. Chạy ngrok để “deploy” backend ra internet

Cài ngrok nếu chưa có: https://ngrok.com/download

Mở terminal mới, chạy:

```bash
ngrok http 5057
```

Ngrok sẽ in ra **Forwarding** dạng:

- **Domain bạn nhận được:** `https://xxxx.ngrok-free.app`  
  (ví dụ: `https://a1b2c3d4.ngrok-free.app`)

- Bản miễn phí: mỗi lần chạy `ngrok http 5057` có thể ra **subdomain ngẫu nhiên** (URL đổi mỗi lần).
- Nếu đã đăng ký và tạo **static domain** trong dashboard ngrok (Cloud Edge > Domains), có thể dùng domain cố định:
  ```bash
  ngrok http --domain=ten-ban-dat.ngrok-free.app 5057
  ```

Copy nguyên URL **https://....ngrok-free.app** (không thêm dấu `/` ở cuối).

## 3. Sửa đường link trong Frontend

1. Tạo file `.env.local` trong thư mục `Frontend/HCMRAINVISION/` (copy từ `.env.local.example` nếu có).
2. Ghi vào `.env.local`:

   ```env
   VITE_API_BASE_URL=https://xxxx.ngrok-free.app
   ```

   Thay `https://xxxx.ngrok-free.app` bằng **đúng domain ngrok** bạn copy ở bước 2.

3. Chạy lại frontend:

   ```bash
   npm run dev
   ```

FE sẽ gọi API qua domain ngrok đó.

## 4. Deploy có domain gì?

- **Khi chạy lệnh `ngrok http 5057`:**  
  Domain là dòng **Forwarding** trong terminal, dạng:

  - **https://&lt;subdomain&gt;.ngrok-free.app**

  Ví dụ: `https://a1b2c3d4.ngrok-free.app`  
  (Subdomain thường ngẫu nhiên nếu bạn chưa đặt static domain.)

- **Nếu bạn đã tạo static domain trong ngrok (free):**  
  Domain sẽ cố định, ví dụ: **https://hcmcrainvision.ngrok-free.app** (tên do bạn đặt khi tạo domain).

Tóm lại: **domain deploy backend qua ngrok** chính là URL **https://....ngrok-free.app** mà ngrok in ra (hoặc domain tĩnh bạn đã cấu hình). Đặt đúng URL đó vào `VITE_API_BASE_URL` trong `.env.local` là FE sẽ dùng backend qua ngrok.
