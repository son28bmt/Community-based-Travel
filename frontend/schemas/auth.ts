import { z } from "zod";

export const LoginSchema = z.object({
    email: z
        .string()
        .min(1, "Vui lòng nhập email hoặc tên đăng nhập")
        .refine((val) => val.includes("@") || val.length >= 3, {
            message: "Email hoặc tên đăng nhập không hợp lệ"
        }),
    password: z.string().min(1, "Vui lòng nhập mật khẩu"),
    remember: z.boolean().optional(),
});

export type Logininput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
    name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
