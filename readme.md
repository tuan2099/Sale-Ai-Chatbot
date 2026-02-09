Dự án Sale AI 

Yêu cầu Tech : 

Frontend : 
- Sử dụng Next.js 
- Sử dụng Tailwind CSS 
- Sử dụng shadcn ui 
- Sử dụng lucide icons 
- Sử dụng vercel 
- Xử lý form + validate bằng react hook form + zod 
- Sử dụng git 
- Sử dụng github 

Backend : 
- Sử dụng nodejs/express
- ORM : Prisma 
- Database : PostgreSQL 
- Ảnh tải lên : Cloudinary 


Phase 1: 

- Xây dụng hệ thống đăng nhập / đăng kí 
- Đăng nhập đăng kí bằng email / số điện thoại 
- Đăng nhập bằng google / facebook / github 
- Quên mật khẩu / reset mật khẩu 
- Hiện tại chỉ có 1 vai trò là user 
- Chức năng cập nhật thông tin người dùng
    + Tên 
    + Ảnh đại diện 
    + Số điện thoại 
    + Email 
    + Địa chỉ 
    + Giới tính 
    + Ngày sinh 
    + Mật khẩu 

Phase 2: 
- Xây dựng hệ thống quản lý khách hàng 
- Thêm mới khách hàng 
- Cập nhật thông tin khách hàng 
- Xóa khách hàng 
- Tìm kiếm khách hàng 
- Lọc khách hàng 
- Sắp xếp khách hàng 
- Phân trang khách hàng 
- Hiện tại chỉ có 1 vai trò là user 
- Chức năng cập nhật thông tin khách hàng
    + Tên 
    + Ảnh đại diện 
    + Số điện thoại 
    + Email 
    + Địa chỉ 
    + Giới tính 
    + Ngày sinh 
    + Mật khẩu 

Phase 3: 
- Xây dựng hệ thống quản lý cửa hàng , mỗi cửa hàng sẽ cho 1 Ai Agent phụ trách riêng và có nguồn dữ liệu riêng để chăm sóc khách hàng 
- Thêm mới cửa hàng 
- Cập nhật thông tin cửa hàng 
- Xóa cửa hàng 
- Tìm kiếm cửa hàng 
- Lọc cửa hàng 
- Sắp xếp cửa hàng 
- Phân trang cửa hàng 
- Hiện tại chỉ có 1 vai trò là user 

Khi vào xem chi tiết cửa hàng sẽ có 1 nút ấn vào để thiết lập AI Agent cho cửa hàng đó
- Đầu tiên là thiết lập ưu tiên cao nhất cho AI Agent 
Hướng dẫn ưu tiên cao sẽ được AI đọc đầu tiên và luôn tuân thủ, ngay cả khi mâu thuẫn với dữ liệu khác. Sử dụng cho các quy tắc bắt buộc.
- Tiếp theo là phần tùy chỉnh Dạy cho AI Agent cách trả lời và hành xử để phù hợp với thương hiệu của bạn.
- Định danh AI
- Yêu cầu cụ thể
- Tình huống đặc biệt
- Phong cách trả lời

Sẽ có thêm các phần như 
- Giao diện khung chat 
 + Màu 
 + Ảnh 
 + Gợi ý
 + Tên AI Agent 
 + font chữ 
 + Tin nhắn chào mừng 
 + Gợi ý chào mừng 
 + Form thu thập thông tin khách hàng gồm những trường nào tuy chỉnh 
 

 Phần tham gia chat : 
 - Sẽ chat với khách hàng
 - Có thêm chức năng tìm kiếm và lọc đoạn chat 
 - Ghi chú đoạn chat, gắn thẻ nữa 