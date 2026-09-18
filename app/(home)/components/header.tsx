"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { del, get, set } from "idb-keyval";
import { LogOut, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMusicStore } from "@/lib/store/useMusicStore";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
  genres: string[];
  onOpenMobileMenu?: () => void;
  onSearchSubmit?: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedGenre,
  onGenreSelect,
  genres,
  onOpenMobileMenu,
  onSearchSubmit,
}: HeaderProps) {
  const router = useRouter();
  const [users, setUsers] = useState<any>(null);

  const login = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          accessToken: access_token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message);
        return;
      }

      await set("users", data?.user);
      setUsers(data?.user);
      await useMusicStore.getState().loadLibraryFromApi();
      router.refresh();
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const logout = async () => {
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } catch {
      // Ignored
    }
    googleLogout();
    setUsers(null);
    await del("users");
    useMusicStore.getState().setPlaylists([]);
    useMusicStore.getState().setFavorites([]);
    router.refresh();
  };

  useEffect(() => {
    const getUser = async () => {
      const data = await get("users");
      setUsers(data);
      if (data) {
        useMusicStore.getState().loadLibraryFromApi();
      }
    };

    getUser().finally();
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#080c14]/90 backdrop-blur-md pt-4 pb-3 border-b border-slate-900/60">
      {/* Top Search & Profile Row */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="lg:hidden size-10 shrink-0 text-slate-300 hover:text-white"
          aria-label="Buka menu navigasi"
        >
          <Menu className="size-5" />
        </Button>

        {/* Search Bar Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.();
          }}
          className="relative flex-1 max-w-2xl"
        >
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="search"
            placeholder="Search songs, albums, videos, artists (Press Enter to search)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-2xl bg-[#111827] pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-400 border border-slate-800/80 focus-visible:border-emerald-500/80 focus-visible:ring-2 focus-visible:ring-emerald-500/20"
          />
        </form>

        {/* Action icons & User Profile */}
        {!users && (
          <Button
            className={
              "cursor-pointer bg-gradient-to-br from-emerald-500 to-teal-400 text-slate-950"
            }
            variant={"ghost"}
            onClick={() => login()}
          >
            Sign in
          </Button>
        )}
        {users?.id && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className={"cursor-pointer"}>
                <AvatarImage src={users?.picture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel
                  className={"cursor-pointer flex flex-row gap-2"}
                  onClick={logout}
                >
                  <LogOut size={15} /> <span className="my-auto">Sign Out</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Genre Chips Row */}
      <div className="flex items-center gap-2 overflow-x-auto px-4 sm:px-6 pt-3 pb-1 scrollbar-none">
        {genres.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => onGenreSelect(genre)}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/20"
                  : "bg-[#111827] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </header>
  );
}
