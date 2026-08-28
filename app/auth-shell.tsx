/** Khung dùng chung cho 4 trang xác thực (đăng nhập/đăng ký/quên/đặt lại mật
 * khẩu) — trước đây mỗi trang chỉ có một thẻ trắng nổi giữa nền trống, không
 * khác gì một form Supabase Auth mặc định. Panel thương hiệu bên trái (chỉ
 * hiện ở màn hình rộng) nhắc lại đúng thông điệp sản phẩm ở trang chủ, để
 * luồng xác thực vẫn cảm thấy là một phần của cùng sản phẩm. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-main">
      <div className="auth-layout">
        <div className="auth-branding" aria-hidden="true">
          <span className="eyebrow">Verified How-To</span>
          <p className="auth-branding-quote">
            Không chỉ cho bạn biết cách làm — mà cho bạn biết điều gì đã xảy ra khi người thật thử làm.
          </p>
          <p className="auth-branding-sub">
            Mỗi cách làm đi kèm báo cáo thật từ người đã thử: thành công, một phần, hay thất bại — không phải xác
            nhận của hệ thống.
          </p>
        </div>
        <div className="auth-card">{children}</div>
      </div>
    </main>
  );
}
