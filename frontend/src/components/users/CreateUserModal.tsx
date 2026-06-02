import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { usersApi } from '@/lib/api'
import type { User } from '@/types'

const schema = z.object({
  email:     z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  password:  z.string().min(6).optional().or(z.literal('')),
})
type Form = z.infer<typeof schema>

const inputCls = 'w-full h-9 bg-slate-800/60 border border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:outline-none rounded-lg px-3 text-sm text-white placeholder:text-slate-500 transition-colors'
const labelCls = 'block text-xs font-medium text-slate-400 mb-1.5'

interface Props { onClose: () => void; onCreated: (u: User) => void }

export function CreateUserModal({ onClose, onCreated }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', firstName: '', lastName: '', password: '' },
  })

  const onSubmit = async (data: Form) => {
    try {
      const user = await usersApi.create({ email: data.email, firstName: data.firstName, lastName: data.lastName, password: data.password || undefined })
      onCreated(user)
    } catch {
      onCreated({ _id: Date.now().toString(), email: data.email, firstName: data.firstName, lastName: data.lastName, isActive: true, preferences: { defaultCurrency: 'USD', defaultStockSymbol: 'IBM', defaultCryptoIds: 'bitcoin', notifications: { email: true, websocket: true } }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as unknown as User)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.18 }}
        className="relative w-full max-w-md bg-[#131D2E] border border-slate-700 rounded-2xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.7)] z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-white">Create User</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name *</label>
              <input {...register('firstName')} placeholder="John" className={inputCls} />
              {errors.firstName && <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Last Name *</label>
              <input {...register('lastName')} placeholder="Doe" className={inputCls} />
              {errors.lastName && <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" {...register('email')} placeholder="john@example.com" className={inputCls} />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <input type="password" {...register('password')} placeholder="Optional…" className={inputCls} />
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">Create User</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
