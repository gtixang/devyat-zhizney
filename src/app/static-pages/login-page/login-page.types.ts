export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export type LoginState = { readonly status: 'pending' | 'success' | 'error' | 'timeout' };
