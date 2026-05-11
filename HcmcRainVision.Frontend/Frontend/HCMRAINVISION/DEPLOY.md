# Hướng dẫn Deploy lên GitHub Pages

## Bước 1: Tạo Repository trên GitHub

1. Tạo một repository mới trên GitHub (hoặc dùng repo hiện có)
2. **Lưu ý**: 
   - Nếu repo name là `username.github.io` → sẽ deploy vào root domain
   - Nếu repo name khác (ví dụ: `HCMRAINVISION`) → sẽ deploy vào `username.github.io/HCMRAINVISION/`

## Bước 2: Push code lên GitHub

```bash
# Khởi tạo git (nếu chưa có)
git init

# Thêm remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Add và commit code
git add .
git commit -m "Initial commit"

# Push lên GitHub
git branch -M main
git push -u origin main
```

## Bước 3: Enable GitHub Pages

1. Vào repository trên GitHub
2. Vào **Settings** → **Pages**
3. Trong phần **Source**, chọn:
   - **Source**: `GitHub Actions`
4. Lưu lại

## Bước 4: Tự động Deploy

Sau khi push code lên branch `main` hoặc `master`, GitHub Actions sẽ tự động:
1. Build project
2. Deploy lên GitHub Pages

Bạn có thể xem tiến trình deploy tại tab **Actions** trong repository.

## Kiểm tra Deploy

Sau khi deploy thành công, website sẽ có tại:
- Nếu repo là `username.github.io`: `https://username.github.io`
- Nếu repo khác: `https://username.github.io/REPO_NAME/`

**Với repo `HcmcRainVision.Frontend`**: 
URL sẽ là: `https://YOUR_USERNAME.github.io/HcmcRainVision.Frontend/`

## Manual Deploy

Nếu muốn deploy thủ công, vào tab **Actions** → chọn workflow **Deploy to GitHub Pages** → click **Run workflow**

## Troubleshooting

### Lỗi 404 khi truy cập
- Kiểm tra base path trong `vite.config.ts` có đúng với repo name không
- Đảm bảo GitHub Pages đã được enable và source là `GitHub Actions`

### Build failed
- Kiểm tra log trong tab **Actions**
- Đảm bảo tất cả dependencies đã được cài đặt đúng

### Assets không load được
- Kiểm tra base path trong `vite.config.ts`
- Clear cache và thử lại

