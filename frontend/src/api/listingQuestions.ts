import { apiRequest } from './http'

export interface ListingQuestionInput {
  senderName: string
  senderEmail: string
  message: string
}

export function createListingQuestion(listingId: string, input: ListingQuestionInput) {
  return apiRequest<void>(`/api/listings/${listingId}/questions`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
