import {
  DashboardSidebar,
  MobileSheetSidebar
} from '@/components/layout/dashboard-sidebar'
import { UserAccountNav } from '@/components/layout/user-account-nav'
import { Shell } from '@/components/shell'
import { SearchCommand } from '@/components/ui/search-command'
import { sidebarLinks } from '@/config/sidebar'
import { StoreProvider } from '@/contexts/store-context'
import { getBranchInfo } from './branch/_lib/actions'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export default async function Dashboard({ children }: ProtectedLayoutProps) {
  const storeData = await getBranchInfo()

  const filteredLinks = sidebarLinks.map((section) => ({
    ...section,
    items: section.items.filter(
      ({ authorizeOnly }) => !authorizeOnly || authorizeOnly === 'ADMIN'
    )
  }))
  return (
    <StoreProvider
      store={
        storeData?.data
          ? {
              name: storeData.data.name,
              slug: storeData.data.slug,
              bgImage: storeData.data.bgImage
            }
          : null
      }
    >
      <div className="relative flex min-h-screen w-full">
        <DashboardSidebar links={filteredLinks} />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-50 flex h-14 bg-background px-4 lg:h-[60px] xl:px-8 mt-2">
            <Shell className="flex items-center gap-x-4 px-0">
              <MobileSheetSidebar links={filteredLinks} />
              <div className="w-full flex-1">
                <SearchCommand links={filteredLinks} />
              </div>
              <UserAccountNav />
            </Shell>
          </header>
          <main className="flex-1 p-4 xl:px-8">{children}</main>
        </div>
      </div>
    </StoreProvider>
  )
}
