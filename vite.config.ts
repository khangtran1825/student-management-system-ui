import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Ép FE chạy cố định ở port 5173
    proxy: {
      // Bất kỳ request nào của FE bắt đầu bằng cụm '/api' sẽ được cấu hình tại đây
      '/api': {
        target: 'http://127.0.0.1:8080', // Chuyển tiếp ngầm sang đúng port của Quarkus (dùng IP 127.0.0.1 để tránh lệch pha IPv6)
        changeOrigin: true,
        secure: false,
      },
    },
  },
});