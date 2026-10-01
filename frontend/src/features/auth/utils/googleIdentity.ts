interface GoogleIdentityApi {
  disableAutoSelect(): void
}

type GoogleWindow = Window & {
  google?: {
    accounts: {
      id: GoogleIdentityApi
    }
  }
}

export function disableGoogleAutoSelect() {
  const googleWindow =
    window as GoogleWindow

  googleWindow.google?.accounts.id
    .disableAutoSelect()
}