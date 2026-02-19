import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Chính sách bảo mật</h1>
                <div className="prose dark:prose-invert max-w-none space-y-4">
                    <p>Chúng tôi coi trọng việc bảo mật thông tin của bạn.</p>

                    <h2 className="text-xl font-semibold mt-4">1. Thu thập thông tin</h2>
                    <p>Chúng tôi thu thập các thông tin cần thiết để cung cấp dịch vụ, bao gồm tên, email, số điện thoại...</p>

                    <h2 className="text-xl font-semibold mt-4">2. Sử dụng thông tin</h2>
                    <p>Thông tin của bạn được sử dụng để quản lý tài khoản, cải thiện dịch vụ và liên lạc khi cần thiết...</p>

                    <h2 className="text-xl font-semibold mt-4">3. Chia sẻ thông tin</h2>
                    <p>Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, trừ khi có yêu cầu của pháp luật...</p>

                    <h2 className="text-xl font-semibold mt-4">4. Bảo mật dữ liệu</h2>
                    <p>Chúng tôi áp dụng các biện pháp kỹ thuật để bảo vệ dữ liệu của bạn khỏi truy cập trái phép...</p>

                    <h2 className="text-xl font-semibold mt-4">5. Quyền của người dùng</h2>
                    <p>Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình...</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
