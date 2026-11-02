"use client";

import { SITE } from "@/lib/site";

import Link from "next/link";
import { useI18n } from "./i18n-provider";
import { LangSwitch } from "./lang-switch";
import { ThemeToggle } from "./theme-toggle";
import { Icon } from "./icons";
import { CATEGORIES } from "@/lib/site";

export function Nav() {
  const { locale, t } = useI18n();
  return (
    <>
          <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--color-accent)] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

    <header className="sticky top-0 z-40 border-b hairline bg-[var(--color-nav)] backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex rounded-lg bg-[var(--color-ink)] p-1.5 text-white">
            <Icon name="sparkle" size={16} />
          </span>
          <span className="text-[15px]">{SITE.name}</span>
        </Link>
        <nav
          className="no-scrollbar -mx-1 flex flex-1 items-center gap-5 overflow-x-auto px-1 text-[13.5px] text-[var(--color-sub)]"
          aria-label={t.nav.menu}
        >
          <Link href={`/${locale}/tools`} className="flex-none transition-colors hover:text-[var(--color-ink)]">
            {t.nav.tools}
          </Link>
          {CATEGORIES.slice(0, 5).map((c) => (
            <Link
              key={c}
              href={`/${locale}/categories/${c}`}
              className="flex-none transition-colors hover:text-[var(--color-ink)]"
            >
              {t.categories[c].name}
            </Link>
          ))}
        </nav>
        <Link
          href={`/${locale}/tools`}
          className="hidden items-center gap-2 rounded-full border hairline px-3.5 py-1.5 text-[13px] text-[var(--color-sub)] transition-colors hover:bg-[var(--color-surface)] sm:flex"
        >
          <Icon name="search" size={14} />
          {t.tools.filterPlaceholder.replace("…", "")}
        </Link>
        <ThemeToggle />
        <LangSwitch />
      </div>
    </header>
    </>
  );
}
