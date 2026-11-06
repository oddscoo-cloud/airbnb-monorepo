export function getAccountInitial(email: string | null | undefined): string {
  return email?.trim().charAt(0).toUpperCase() ?? ''
}
