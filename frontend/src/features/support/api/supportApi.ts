import { apiRequest } from '@/api/client'

export const supportTopics = [
  {
    value: 'SECURITY',
    label: 'Account security or an unexpected email',
  },
  {
    value: 'ACCOUNT_ACCESS',
    label: 'Signing in, passwords or email verification',
  },
  {
    value: 'TECHNICAL_ISSUE',
    label: 'Something is not working',
  },
  {
    value: 'DATA_PRIVACY',
    label: 'My data or privacy',
  },
  {
    value: 'FEEDBACK',
    label: 'Feedback or a suggestion',
  },
  {
    value: 'GENERAL',
    label: 'Something else',
  },
] as const

export type SupportTopic =
  (typeof supportTopics)[number]['value']

export interface SupportContactRequest {
  name: string
  email: string
  topic: SupportTopic
  message: string
  turnstileToken: string
  website: string
}

export const supportApi = {
  contact(request: SupportContactRequest) {
    return apiRequest<void>('/support/contact', {
      method: 'POST',
      credentials: 'omit',
      body: request,
    })
  },
}