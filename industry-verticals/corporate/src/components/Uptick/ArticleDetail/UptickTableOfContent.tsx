import React, { useEffect, useRef, useState } from 'react';
import { BREAKPOINTS, uptickTableOfContents, uptickArticleDetail } from '@/constants/appConstants';
import { useShouldRender } from '@/utils/useShouldRender';
import { useI18n } from 'next-localization';
import { useRouter } from 'next/router';

const UptickTableOfContent = (): JSX.Element | null => {
  interface Heading {
    id: string;
    text: string;
  }

  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const tocRef = useRef<HTMLElement | null>(null);
  const { TOC_STICKY_HEADER_HEIGHT, TOC_VISIBLE_THRESHOLD ,TOC_BOTTOM_THRESHOLD } = uptickTableOfContents;
  const stickyHeaderHeight = TOC_STICKY_HEADER_HEIGHT;

  const shouldRender = useShouldRender();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    const container = document.getElementById(uptickArticleDetail.uptickArticleId);
    if (!container) return;

    const elements = Array.from(container.querySelectorAll<HTMLHeadingElement>('h2')).map(
      (heading, index) => {
        const baseId =
          heading.textContent
            ?.trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase() ?? '';

        const uniqueId = heading.id || `${baseId}-${index}`;
        heading.id = uniqueId;

        return { id: uniqueId, text: heading.textContent ?? '' };
      }
    );

    setHeadings(elements);
  }, [router.asPath]);

  // Sticky + Scrollspy logic using performant requestAnimationFrame scroll handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parentDiv = document.querySelector('.column-splitter .article-detail');
    if (!(parentDiv instanceof HTMLElement)) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      window.requestAnimationFrame(() => {
        const isMobile = window.innerWidth < BREAKPOINTS.md;
        if (isMobile) {
          setIsSticky(false);
          ticking = false;
          return;
        }

        const rect = parentDiv.getBoundingClientRect();

        // Sticky logic
        const topEntered = rect.top <= stickyHeaderHeight;
        const bottomVisible = rect.bottom + TOC_BOTTOM_THRESHOLD >= window.innerHeight;
        const shouldBeSticky = topEntered && bottomVisible;
        setIsSticky(shouldBeSticky);

        // Scrollspy logic
        let currentActiveId: string | null = null;
        headings.forEach((heading) => {
          const element = document.getElementById(heading.id);
          if (element) {
            const top = element.getBoundingClientRect().top;
            if (top - stickyHeaderHeight <= TOC_VISIBLE_THRESHOLD) {
              currentActiveId = heading.id;
            }
          }
        });

        if (currentActiveId) {
          setActiveId(currentActiveId);
        } else {
          setActiveId(null);
        }

        ticking = false;
      });

      ticking = true;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [headings, stickyHeaderHeight]);

  // Click-to-scroll TOC behavior
  const handleClick = (id: string) => {
    const element = document.getElementById(id);

    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const scrollOffsetFromHeader = stickyHeaderHeight;

      window.scrollTo({
        top: elementTop - scrollOffsetFromHeader,
        behavior: 'smooth',
      });
    }
  };

  if (!shouldRender(headings.length > 0)) {
    return null;
  }

  return (
    <nav ref={tocRef} className={`uptick-toc-container`} aria-label={t('tableofcontents')}>
      <div className={`${isSticky ? 'sticky' : ''}`}>
        <div className="uptick-toc-content">
          <h2 className="toc-heading-title">{t('tableofcontents')}</h2>
          <ol className="toc-content-list">
            {headings.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className={`toc-list-item ${activeId === h.id ? 'active-item' : ''}`}
                  onClick={() => handleClick(h.id)}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
};

export default UptickTableOfContent;
