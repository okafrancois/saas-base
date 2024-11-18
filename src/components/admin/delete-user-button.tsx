// src/components/admin/delete-user-button.tsx
'use client'

import { deleteUser } from "@/actions/profile"
import { useProtectedAction } from "@/hooks/use-protected-action"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function DeleteUserButton({ userId }: { userId: string }) {
  const router = useRouter()
  const t = useTranslations('admin.users')
  const { mutate, isPending } = useProtectedAction<string, User>()

  return (
    <Button
      onClick={() => {
        mutate(deleteUser, userId, {
          onSuccess: () => {
            router.refresh()
          },
          successMessage: t('delete_success')
        })
      }}
      disabled={isPending}
    >
      {isPending ? t('deleting') : t('delete')}
    </Button>
  )
}