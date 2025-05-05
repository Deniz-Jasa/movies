'use client';

import React, { useState } from 'react';
import { type Show, type NavItem } from '@/types';
import Link from 'next/link';
import {
  cn,
  getSearchValue,
  handleDefaultSearchBtn,
  handleDefaultSearchInp,
} from '@/lib/utils';
import { siteConfig } from '@/configs/site';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search';
import { ModeToggle as ThemeToggle } from '@/components/theme-toggle';
import { DebouncedInput } from '@/components/debounced-input';
import MovieService from '@/services/MovieService';
import Logo from '../../app/logo.png';
import LogoIcon from '../../app/logo-icon.png';
import Image from 'next/image';

interface MainNavProps {
  items?: NavItem[];
}

interface SearchResult {
  results: Show[];
}

export function MainNav({ items }: MainNavProps) {
  const path = usePathname();
  const router = useRouter();
  // search store
  const searchStore = useSearchStore();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggleMenu = () => setIsMenuOpen(!isMenuOpen);

  React.useEffect(() => {
    window.addEventListener('popstate', handlePopstateEvent, false);
    return () => {
      window.removeEventListener('popstate', handlePopstateEvent, false);
    };
  }, []);

  const handlePopstateEvent = () => {
    const pathname = window.location.pathname;
    const search: string = getSearchValue('q');

    if (!search?.length || !pathname.includes('/search')) {
      searchStore.reset();
      searchStore.setOpen(false);
    } else if (search?.length) {
      searchStore.setOpen(true);
      searchStore.setLoading(true);
      searchStore.setQuery(search);
      setTimeout(() => {
        handleDefaultSearchBtn();
      }, 10);
      setTimeout(() => {
        handleDefaultSearchInp();
      }, 20);
      MovieService.searchMovies(search)
        .then((response: SearchResult) => {
          void searchStore.setShows(response.results);
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => searchStore.setLoading(false));
    }
  };

  async function searchShowsByQuery(value: string) {
    if (!value?.trim()?.length) {
      // If the search value is empty, reset the search results and navigate to home
      searchStore.setQuery(''); // Clear the search query
      searchStore.setShows([]); // Clear the search results

      // Redirect to home if currently on search page
      if (path === '/search') {
        router.push('/home');
      } else {
        window.history.pushState(null, '', '/home');
      }
      return;
    }

    // Update the search query in the URL
    if (getSearchValue('q')?.trim()?.length) {
      window.history.replaceState(null, '', `search?q=${value}`);
    } else {
      window.history.pushState(null, '', `search?q=${value}`);
    }

    // Set the query and show the loading indicator
    searchStore.setQuery(value);
    searchStore.setLoading(true);

    // Fetch the search results
    const shows = await MovieService.searchMovies(value);
    searchStore.setLoading(false);
    searchStore.setShows(shows.results);

    // Smooth scroll to the top of the page
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }


  // change background color on scroll
  React.useEffect(() => {
    const changeBgColor = () => {
      window.scrollY > 0 ? setIsScrolled(true) : setIsScrolled(false);
    };
    window.addEventListener('scroll', changeBgColor);
    return () => window.removeEventListener('scroll', changeBgColor);
  }, [isScrolled]);

  const handleChangeStatusOpen = (value: boolean): void => {
    searchStore.setOpen(value);
    if (!value) searchStore.reset();
  };

  // Handle logout
  const handleLogout = () => {
    // Clear authentication tokens or session storage
    // Example: localStorage.removeItem('userToken');
    // Redirect to the home page or login page
    router.push('/');  // Redirect to base URL ("/")
  };

  return (
    <nav
      className={cn(
        'fixed left-1/2 top-3 z-10 flex h-[70px] md:h-[80px] w-[90%] -translate-x-1/2 items-center justify-between bg-transparent from-secondary/70 from-10% px-4 py-4 sm:px-6 transition-colors duration-300 rounded-full mb-30', // Use `left-1/2` with `-translate-x-1/2` to center it horizontally
        isScrolled ? 'bg-secondary/80 shadow-xl backdrop-blur-2xl backdrop-saturate-300 shadow-lg' : 'bg-transparent', // Adjusted shadow on scroll
      )}

    >
      <div className="flex items-center gap-6 md:gap-6">
        <Link
          href="/home"
          className="hidden md:block"
          onClick={() => handleChangeStatusOpen(false)}
        >
          <div className="flex items-center gap-0">
            <Image
              src={LogoIcon}
              alt="Logo"
              className="w-10"
            />
            {/* <Image
              src={Logo}
              alt="Logo"
              className="w-20"
            /> */}
          </div>
        </Link>
        {items?.length ? (
          <nav className="hidden gap-6 md:flex">
            {items?.map(
              (item, index) =>
                item.href && (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      'flex items-center text-sm font-medium text-foreground/60 transition hover:text-foreground/80',
                      path === item.href && 'font-bold text-foreground',
                      item.disabled && 'cursor-not-allowed opacity-80',
                    )}
                    onClick={() => handleChangeStatusOpen(false)}
                  >
                    {item.title}
                  </Link>
                ),
            )}
          </nav>
        ) : null}
        <div className="block md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-between w-full">
                <Link href="/home">
                  <Image
                    src={LogoIcon}
                    alt="Logo"
                    className="w-10 mr-3"
                  />
                </Link>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={20}
              className="w-full p-8 overflow-y-auto overflow-x-hidden rounded-sm"
            >
              {items?.map((item, index) => (
                <DropdownMenuItem key={index} asChild className="items-center justify-center">
                  {item.href && (
                    <Link href={item.href} onClick={() => handleChangeStatusOpen(false)}>
                      <span
                        className={cn(
                          'line-clamp-1 text-foreground/60 hover:text-foreground/80 mb-5',
                          path === item.href && 'font-bold text-foreground',
                        )}
                      >
                        {item.title}
                      </span>
                    </Link>
                  )}
                </DropdownMenuItem>
              ))}

              <div className="flex items-center gap-4">
                <div className="bg-[#111111] rounded-full p-2">
                  <ThemeToggle />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="rounded-full bg-[#111111] text-white font-[9pt] hover:bg-[#222222] border border-input"
                >
                  Logout
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <DebouncedInput
          id="search-input"
          open={searchStore.isOpen}
          value={searchStore.query}
          onChange={searchShowsByQuery}
          onChangeStatusOpen={handleChangeStatusOpen}
          containerClassName={cn(path === '/' ? 'hidden' : 'flex')}
        />

        <div className="hidden md:flex gap-4">
          <ThemeToggle />
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="rounded-full bg-[#111111] text-white border border-input"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default MainNav;


