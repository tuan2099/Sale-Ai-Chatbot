import * as z from "zod";

export const ForgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
});

export const LoginSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(1, {
    message: "Mật khẩu là bắt buộc",
  }),
});

export const RegisterSchema = z
  .object({
    name: z.string().min(1, {
      message: "Họ và tên là bắt buộc",
    }),
    email: z.string().email({
      message: "Email không hợp lệ.",
    }),
    phoneNumber: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 10, {
        message: "Số điện thoại không hợp lệ",
      }),
    password: z.string().min(6, {
      message: "Mật khẩu phải có ít nhất 6 ký tự",
    }),
    confirmPassword: z.string(),
    terms: z
      .boolean()
      .default(false)
      .refine((val) => val === true, {
        message: "Bạn phải đồng ý với điều khoản và chính sách",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });
