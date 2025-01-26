import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'

import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { DraftModeScript } from '@makeswift/runtime/next/server'
import { isAuthProviderEnabled } from 'utils/is-auth-provider-enabled'

import '@/lib/makeswift/components'
import { MakeswiftProvider } from '@/lib/makeswift/provider'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CI/CD Models',
  description: 'Let’s figure out how to fix this thing',
}

const isAuthEnabled = isAuthProviderEnabled()

function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (isAuthEnabled) {
    return <ClerkProvider>{children}</ClerkProvider>
  }

  return <>{children}</>
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <html lang="en">
        <head>
          <DraftModeScript />
        </head>
        <body className={inter.className}>
          <main>
            {isAuthEnabled && (
              <SignedOut>
                <div className="mt-20 flex h-full items-center justify-center">
                  <SignInButton mode="modal">
                    <span className="flex w-56 cursor-pointer justify-center rounded-lg bg-gray-100 p-4">
                      Sign in
                    </span>
                  </SignInButton>
                </div>
              </SignedOut>
            )}
            <MakeswiftProvider previewMode={(await draftMode()).isEnabled}>
              {children}
            </MakeswiftProvider>
          </main>
        </body>
      </html>
    </AuthProvider>
  )
}
