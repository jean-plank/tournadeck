export class AuthError extends Error {
  constructor(message: 'Unauthorized' | 'Forbidden') {
    super(message)
  }
}
