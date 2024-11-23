'use client'

import { useTranslations } from 'next-intl'
import { Bot, CheckCircle2, ChevronDown, Circle, HelpCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FullProfile } from '@/types'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import React, { useState } from 'react'

interface ProfileCompletionAssistantProps {
  profile: FullProfile
  completionRate: number
}

interface Suggestion {
  id: string
  field: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed'
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function ProfileCompletionAssistant({ profile, completionRate }: ProfileCompletionAssistantProps) {
  const t = useTranslations('profile.assistant')
  const [isOpen, setIsOpen] = useState(true)

  // Générer les suggestions basées sur le profil
  const suggestions: Suggestion[] = React.useMemo(() => {
    const suggestions: Suggestion[] = []

    // Vérifier les informations de base
    if (!profile.identityPicture) {
      suggestions.push({
        id: 'identity_picture',
        field: 'basic_info',
        priority: 'high',
        status: 'pending',
        message: t('suggestions.missing_photo'),
      })
    }

    // Vérifier les documents
    if (!profile.passport) {
      suggestions.push({
        id: 'passport',
        field: 'documents',
        priority: 'high',
        status: 'pending',
        message: t('suggestions.missing_passport'),
      })
    }

    // Vérifier les coordonnées
    if (!profile.phone || !profile?.email) {
      suggestions.push({
        id: 'contact',
        field: 'contact_info',
        priority: 'high',
        status: 'pending',
        message: t('suggestions.missing_contact'),
      })
    }

    // Vérifier le contact d'urgence
    if (!profile?.emergencyContact) {
      suggestions.push({
        id: 'emergency_contact',
        field: 'family_info',
        priority: 'medium',
        status: 'pending',
        message: t('suggestions.missing_emergency_contact'),
      })
    }

    return suggestions
  }, [profile, t])

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <XCircle className="h-4 w-4 text-destructive" />
      case 'medium':
        return <HelpCircle className="h-4 w-4 text-warning" />
      case 'low':
        return <Circle className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            {t('title')}
          </div>
        </CardTitle>
        {suggestions.length === 0 && (
          <CheckCircle2 className="h-5 w-5 text-success" />
        )}
      </CardHeader>
      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span>{isOpen ? t('hide_suggestions') : t('show_suggestions')}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            {suggestions.length === 0 ? (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-muted-foreground"
              >
                {t('no_suggestions')}
              </motion.p>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 rounded-lg border p-2"
                  >
                    {getPriorityIcon(suggestion.priority)}
                    <div className="flex-1">
                      <p className="text-sm">{suggestion.message}</p>
                      {suggestion.action && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs"
                          onClick={suggestion.action.onClick}
                        >
                          {suggestion.action.label}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}