import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Điều khoản sử dụng</h1>
                <div className="prose dark:prose-invert max-w-none space-y-4">
                    <p>Chào mừng bạn đến với Sale AI Chatbot.</p>
                    <p>Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản sau đây:</p>

                    <h2 className="text-xl font-semibold mt-4">1. Giới thiệu</h2>
                    <p>Sale AI Chatbot là nền tảng cung cấp giải pháp chatbot tự động cho doanh nghiệp...</p>

                    <h2 className="text-xl font-semibold mt-4">2. Tài khoản người dùng</h2>
                    <p>Bạn chịu trách nhiệm bảo mật thông tin tài khoản và mật khẩu của mình...</p>

                    <h2 className="text-xl font-semibold mt-4">3. Quyền và trách nhiệm</h2>
                    <p>Người dùng cam kết không sử dụng dịch vụ cho các mục đích vi phạm pháp luật...</p>

                    <h2 className="text-xl font-semibold mt-4">4. Thanh toán và hoàn tiền</h2>
                    <p>Các gói dịch vụ được thanh toán trước. Chính sách hoàn tiền sẽ tuân theo quy định của chúng tôi tại từng thời điểm...</p>

                    <h2 className="text-xl font-semibold mt-4">5. Thay đổi điều khoản</h2>
                    <p>Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào và sẽ thông báo cho người dùng...</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
