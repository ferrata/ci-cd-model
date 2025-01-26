import { notFound } from 'next/navigation'

import { auth } from '@clerk/nextjs/server'
import { Page as MakeswiftPage } from '@makeswift/runtime/next'
import { getSiteVersion } from '@makeswift/runtime/next/server'
import { isAuthProviderEnabled } from 'utils/is-auth-provider-enabled'

import { client } from '@/lib/makeswift/client'

type ParsedUrlQuery = { path?: string[] }

const isAuthEnabled = isAuthProviderEnabled()

export async function generateStaticParams() {
  return await client
    .getPages()
    .map(page => ({
      path: page.path.split('/').filter(segment => segment !== ''),
    }))
    .toArray()
}

export default async function Page({ params }: { params: ParsedUrlQuery }) {
  if (isAuthEnabled) {
    const { userId } = await auth()
    if (userId == null) return null
  }

  const path = '/' + (params?.path ?? []).join('/')
  const snapshot = await client.getPageSnapshot(path, {
    siteVersion: getSiteVersion(),
  })

  if (snapshot == null) return notFound()

  return <MakeswiftPage snapshot={snapshot} />
}
