'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems, consultantNavItems } from '@/constants/data';
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout
} from '@tabler/icons-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useSidebar } from '@/components/ui/sidebar'
import { useEffect } from 'react';
const tenants = [
  { id: '', name: '' },
];

export default function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isOpen } = useMediaQuery();
  const { state } = useSidebar();
  useEffect(() => {
    console.log('state',state);
  }, []);

  //@ts-ignore
  const navItemsToUse =  navItems;

  return (
    <Sidebar collapsible="icon" >
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full px-4"
        >

          <div className="flex items-center justify-center w-full h-12">
            <Link href={ session?.user?.role?.code === 'admin' ?"/admin/overview" :"/admin/overview" }>
              {state=="expanded" ? (
                <img
                  src="/logo/big_SIRH_logo.svg"
                  alt="Logo"
                  className="w-full h-auto max-h-10 object-contain transition-all duration-300 animate-fade-in"
                />
              ) : (
                <img
                  src="/logo/small_SIRH_logo.svg"
                  alt="Logo"
                  className="w-8 h-8 object-contain transition-all duration-300 animate-fade-in"
                />
              )}
            </Link>
          </div>

        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>

          <SidebarMenu>
            {navItemsToUse.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              return item?.items && item?.items?.length > 0 ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={pathname === item.url}
                      >
                        {item.icon && <Icon className="w-6 h-6" />}
                        <span>{item.title}</span>
                        <IconChevronRight className="ml-auto w-5 h-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const SubIcon = subItem.icon ? Icons[subItem.icon] : null;
                          // Check if this subItem has its own items (third level)
                          return subItem.items && subItem.items.length > 0 ? (
                            <Collapsible
                              key={subItem.title}
                              asChild
                              className="group/sub-collapsible"
                            >
                              <SidebarMenuSubItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton
                                    isActive={pathname.includes(subItem.url)}
                                  >
                                    {SubIcon && <SubIcon className="w-4 h-4" />}
                                    <span>{subItem.title}</span>
                                    <IconChevronRight className="ml-auto w-4 h-4 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90" />
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="ml-4 pl-2 border-l border-sidebar-border">
                                    {subItem.items.map((thirdLevelItem) => {
                                      const ThirdLevelIcon = thirdLevelItem.icon ? Icons[thirdLevelItem.icon] : null;
                                      return (
                                        <SidebarMenuSubButton
                                          key={thirdLevelItem.title}
                                          asChild
                                          isActive={pathname === thirdLevelItem.url}
                                          size="sm"
                                          className="mt-1"
                                        >
                                          <Link href={thirdLevelItem.url}>
                                            {ThirdLevelIcon && <ThirdLevelIcon className="w-3 h-3" />}
                                            <span>{thirdLevelItem.title}</span>
                                          </Link>
                                        </SidebarMenuSubButton>
                                      );
                                    })}
                                  </div>
                                </CollapsibleContent>
                              </SidebarMenuSubItem>
                            </Collapsible>
                          ) : (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                              >
                                <Link href={subItem.url}>
                                  {SubIcon && <SubIcon className="w-4 h-4" />}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon className="w-10 h-10 font-bold" />
                      <span className="text-bold">{item.title.toLowerCase()}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      //@ts-ignore
                      src={session?.user?.image || ''}
                      alt={session?.user?.name || ''}
                    />
                    <AvatarFallback className="rounded-lg">
                      {session?.user?.name?.slice(0, 2)?.toUpperCase() || 'CN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session?.user?.name || 'AD logistique'}
                    </span>
                    <span className="truncate text-xs">
                      {session?.user?.email || 'ad_logstique@admin.com'}
                    </span>
                  </div>
                  <IconChevronsDown className="ml-auto w-5 h-5" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        //@ts-ignore
                        src={session?.user?.image || ''}
                        alt={session?.user?.name || ''}
                      />
                      <AvatarFallback className="rounded-lg">
                        {session?.user?.name?.slice(0, 2)?.toUpperCase() ||
                          'CN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user?.name || 'AD logistique'}
                      </span>
                      <span className="truncate text-xs">
                        {session?.user?.email || 'ad_logstique@admin.com'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = '/api/auth/logout';
                  }}
                >
                  <IconLogout className="mr-2 w-5 h-5" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}