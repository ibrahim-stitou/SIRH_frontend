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
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { useNavItems } from '@/constants/data';
import {
  IconChevronRight,
  IconChevronsDown,
  IconLogout
} from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Icons } from '../icons';
import { useLanguage } from '@/context/LanguageContext';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@radix-ui/react-hover-card';

export default function AppSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isRTL } = useLanguage();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const navItemsToUse = useNavItems();

  return (
    <Sidebar
      collapsible='icon'
      variant='floating'
      side={isRTL ? 'right' : 'left'}
    >
      <SidebarHeader>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full px-4'
        >
          <div className='flex h-12 w-full items-center justify-center'>
            <Link
              href={
                session?.user?.role?.code === 'admin'
                  ? '/admin/overview'
                  : '/admin/overview'
              }
            >
              {state == 'expanded' ? (
                <Image
                  src='/logo/big_SIRH_logo.svg'
                  alt='Logo'
                  width={160}
                  height={40}
                  className='h-auto max-h-10 w-auto object-contain transition-all duration-300'
                  priority
                  unoptimized
                />
              ) : (
                <Image
                  src='/logo/small_SIRH_logo.svg'
                  alt='Logo'
                  width={32}
                  height={32}
                  className='h-8 w-8 object-contain transition-all duration-300'
                  priority
                  unoptimized
                />
              )}
            </Link>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarMenu>
            {navItemsToUse.map((item) => {
              const Icon = item.icon ? Icons[item.icon] : Icons.logo;
              const isActiveRoot = pathname === item.url;
              const hasChildren = !!(item?.items && item.items.length > 0);

              // When collapsed, show submenu in a hover flyout instead of inline
              if (hasChildren && isCollapsed) {
                return (
                  <SidebarMenuItem key={item.title}>
                    <HoverCard openDelay={50} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        {/* Omit tooltip when collapsed and has children */}
                        <SidebarMenuButton isActive={isActiveRoot}>
                          {item.icon && <Icon className='h-5 w-5' />}
                          <span className='capitalize'>{item.title}</span>
                        </SidebarMenuButton>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side={isRTL ? 'left' : 'right'}
                        align='start'
                        className='border-sidebar-border bg-sidebar text-sidebar-foreground w-64 rounded-xl border p-2 shadow-xl'
                      >
                        <SidebarMenuSub
                          className='mx-0 border-0 px-0 py-0'
                          showInCollapsed
                        >
                          {item.items?.map((subItem) => {
                            const SubIcon = subItem.icon
                              ? Icons[subItem.icon]
                              : null;
                            return subItem.items && subItem.items.length > 0 ? (
                              <div key={subItem.title} className='mb-1'>
                                <SidebarMenuSubButton
                                  isActive={pathname.includes(subItem.url)}
                                  showInCollapsed
                                >
                                  {SubIcon && <SubIcon className='h-4 w-4' />}
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                                <div className='border-sidebar-border ml-4 border-l pl-2'>
                                  {subItem.items.map((thirdLevelItem) => {
                                    const ThirdIcon = thirdLevelItem.icon
                                      ? Icons[thirdLevelItem.icon]
                                      : null;
                                    return (
                                      <SidebarMenuSubButton
                                        key={thirdLevelItem.title}
                                        asChild
                                        isActive={
                                          pathname === thirdLevelItem.url
                                        }
                                        size='sm'
                                        className='mt-0.5'
                                        showInCollapsed
                                      >
                                        <Link href={thirdLevelItem.url}>
                                          {ThirdIcon && (
                                            <ThirdIcon className='h-3 w-3' />
                                          )}
                                          <span>{thirdLevelItem.title}</span>
                                        </Link>
                                      </SidebarMenuSubButton>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <SidebarMenuSubItem
                                key={subItem.title}
                                showInCollapsed
                              >
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.url}
                                  showInCollapsed
                                >
                                  <Link href={subItem.url}>
                                    {SubIcon && <SubIcon className='h-4 w-4' />}
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </HoverCardContent>
                    </HoverCard>
                  </SidebarMenuItem>
                );
              }

              // Expanded or items without children: use existing collapsible inline
              return hasChildren ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                  className='group/collapsible'
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      {/* Keep tooltip when expanded */}
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActiveRoot}
                      >
                        {item.icon && <Icon className='h-5 w-5' />}
                        <span className='capitalize'>{item.title}</span>
                        <IconChevronRight
                          className={`ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 ${
                            isRTL ? 'rotate-90' : ''
                          }`}
                        />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const SubIcon = subItem.icon
                            ? Icons[subItem.icon]
                            : null;
                          return subItem.items && subItem.items.length > 0 ? (
                            <Collapsible
                              key={subItem.title}
                              asChild
                              className='group/sub-collapsible'
                            >
                              <SidebarMenuSubItem>
                                <CollapsibleTrigger asChild>
                                  <SidebarMenuSubButton
                                    isActive={pathname.includes(subItem.url)}
                                  >
                                    {SubIcon && <SubIcon className='h-4 w-4' />}
                                    <span>{subItem.title}</span>
                                    <IconChevronRight
                                      className={`ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/sub-collapsible:rotate-90 ${
                                        isRTL ? 'rotate-90' : ''
                                      }`}
                                    />
                                  </SidebarMenuSubButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className='border-sidebar-border ml-4 border-l pl-2'>
                                    {subItem.items.map((thirdLevelItem) => {
                                      const ThirdLevelIcon = thirdLevelItem.icon
                                        ? Icons[thirdLevelItem.icon]
                                        : null;
                                      return (
                                        <SidebarMenuSubButton
                                          key={thirdLevelItem.title}
                                          asChild
                                          isActive={
                                            pathname === thirdLevelItem.url
                                          }
                                          size='sm'
                                          className='mt-1'
                                        >
                                          <Link href={thirdLevelItem.url}>
                                            {ThirdLevelIcon && (
                                              <ThirdLevelIcon className='h-3 w-3' />
                                            )}
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
                                  {SubIcon && <SubIcon className='h-4 w-4' />}
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
                  {/* For leaf items, show tooltip always */}
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.url}
                  >
                    <Link href={item.url}>
                      <Icon className='h-5 w-5' />
                      <span className='capitalize'>
                        {item.title.toLowerCase()}
                      </span>
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
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage
                      //@ts-ignore
                      src={session?.user?.image || ''}
                      alt={session?.user?.name || ''}
                    />
                    <AvatarFallback className='rounded-lg'>
                      {session?.user?.name?.slice(0, 2)?.toUpperCase() || 'CN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {session?.user?.name || 'AD logistique'}
                    </span>
                    <span className='truncate text-xs'>
                      {session?.user?.email || 'ad_logstique@admin.com'}
                    </span>
                  </div>
                  <IconChevronsDown className='ml-auto h-4 w-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='z-2000 w-(--radix-dropdown-menu-trigger-width) min-w-46 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage
                        //@ts-ignore
                        src={session?.user?.image || ''}
                        alt={session?.user?.name || ''}
                      />
                      <AvatarFallback className='rounded-lg'>
                        {session?.user?.name?.slice(0, 2)?.toUpperCase() ||
                          'CN'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {session?.user?.name || 'AD logistique'}
                      </span>
                      <span className='truncate text-xs'>
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
                  <IconLogout className='mr-2 h-4 w-4' />
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
