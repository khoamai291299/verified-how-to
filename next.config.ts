import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Đủ cho 3 ảnh x 5MB (giới hạn per-image đã chốt, xem attempt-report-images bucket) + phần overhead
    // của multipart form. Mặc định 1MB của Next.js quá nhỏ, khiến Server Action trả lỗi framework
    // (500 "Body exceeded 1 MB limit") thay vì thông báo tiếng Việt của chính ứng dụng.
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
