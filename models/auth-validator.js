const {z} = require('zod');

const registerSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: z.string().email('Email must be valid'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['admin', 'bace'], 'Role must be either "admin" or "bace"')
})

const loginSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
})

const forgotPasswordSchema = z.object({
    email: z.string().email('Email must be valid'),
})

const resetPasswordSchema = z.object({
    resetToken: z.string().min(8, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
})

const linkEmailSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    email: z.string().email('Email must be valid'),
})

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    linkEmailSchema,
}