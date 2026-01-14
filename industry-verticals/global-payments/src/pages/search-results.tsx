import { useState, useRef, useEffect, JSX } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl?: string;
}

interface SidebarAd {
  title: string;
  snippet: string;
  source: string;
  url?: string;
}

const SearchResultsPage = (): JSX.Element => {
  const router = useRouter();
  const { q } = router.query;
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const suggestionsData = ['Global Payments Genius POS'];

  // Mock search results - in a real app, these would come from an API
  const mockResults: SearchResult[] = [
    {
      title: 'Genius POS by Global Payments - Point of Sale Platform',
      url: 'https://www.globalpayments.com/genius-pos',
      snippet:
        'Genius POS by Global Payments is a versatile, cloud-based Point of Sale platform offering integrated payment processing, software, and business management tools for retail, restaurants, and enterprises...',
      displayUrl: 'globalpayments.com › genius-pos',
    },
    {
      title: 'Genius Retail POS System - Payment Solution',
      url: 'https://www.globalpayments.com/genius-retail',
      snippet:
        "That's Genius. GENIUS FOR RETAIL. Running a retail business is tough — getting the right tech shouldn't be. Genius is our retail point of sale system designed to streamline operations...",
      displayUrl: 'globalpayments.com › genius-retail',
    },
    {
      title: 'Genius for Enterprise - POS Solution',
      url: 'https://www.globalpayments.com/genius-enterprise',
      snippet:
        'Global Payments Announces the Launch of its Genius™ for Enterprise POS Solution. All the functionality enterprise POS customers demand with the flexibility to scale...',
      displayUrl: 'globalpayments.com › genius-enterprise',
    },
  ];

  const sidebarAds: SidebarAd[] = [
    {
      title: 'Genius Retail POS System and Payment Solution',
      snippet:
        "That's Genius. GENIUS FOR RETAIL. Running a retail business is tough — getting the right tech shouldn't be. Genius is our retail p...",
      source: 'Global Payments',
      url: '/?utm_campaign=genius-retail',
    },
    {
      title: 'Global Payments Launches New Genius™ POS Platform',
      snippet:
        'The new Genius platform enables global expansion and vertical specialization at scale, allowing Global Payments to rapidly launch ...',
      source: 'Global Payments',
      url: '/?utm_campaign=genius-restaurants',
    },
    {
      title: 'Global Payments Announces the Launch of its Genius™ for ...',
      snippet:
        'Global Payments Announces the Launch of its Genius™ for Enterprise POS Solution * All the functionality enterprise POS customers d...',
      source: 'Global Payments',
    },
  ];

  useEffect(() => {
    if (typeof q === 'string' && q) {
      setQuery(q);
    }
  }, [q]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (!value) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = suggestionsData.filter((s) =>
      s.toLowerCase().includes(value.toLowerCase())
    );

    if (matches.length > 0) {
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeIndex >= 0) {
        setQuery(suggestions[activeIndex]);
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
      handleSubmit();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setActiveIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (query.trim()) {
      router.push(`/search-results?q=${encodeURIComponent(query)}`);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }, 120);
  };

  return (
    <>
      <Head>
        <title>{query ? `${query} - Search Results` : 'Search Results'}</title>
        <meta name="description" content="Search results page" />
      </Head>
      <div className="search-results-page">
        <header className="search-results-page__header">
          <div className="search-results-page__header-container">
            <div className="search-results-page__logo">
              <Link href="/search" className="search-results-page__logo-link">
                <svg
                  className="search-results-page__logo-svg"
                  aria-label="Google"
                  height="30"
                  role="img"
                  viewBox="0 0 272 92"
                  width="92"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                    fill="#EA4335"
                  />
                  <path
                    d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
                    fill="#4285F4"
                  />
                  <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
                  <path
                    d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
                    fill="#EA4335"
                  />
                  <path
                    d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
                    fill="#4285F4"
                  />
                </svg>
              </Link>
            </div>

            <form
              id="searchForm"
              className="search-results-page__form"
              onSubmit={handleSubmit}
            >
              <div className="search-results-page__input-container">
                <div className="search-results-page__input-wrapper">
                  <div className="search-results-page__search-icon">
                    <svg
                      focusable="false"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                    </svg>
                  </div>
                  <textarea
                    ref={inputRef}
                    id="q"
                    className="search-results-page__input"
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder=""
                    aria-label="Search"
                    rows={1}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul
                      ref={suggestionsRef}
                      id="suggestions"
                      className="search-results-page__suggestions"
                    >
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className={`search-results-page__suggestion ${
                            index === activeIndex ? 'active' : ''
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSuggestionClick(suggestion);
                          }}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </form>
          </div>
        </header>

        <main className="search-results-page__main" id="main">
          <div className="search-results-page__content-wrapper">
            <div className="search-results-page__container">
              <div className="search-results-page__stats">
                {query && (
                  <p>
                    About {mockResults.length} results for <strong>{query}</strong>
                  </p>
                )}
              </div>

              {/* AI Overview Section */}
              {query && query.toLowerCase().includes('genius pos') && (
                <div className="search-results-page__ai-overview">
                  <div className="search-results-page__ai-header">
                    <h2 className="search-results-page__ai-title">AI Overview</h2>
                  </div>
                  <div className="search-results-page__ai-content">
                    <p>
                      Genius POS by Global Payments is a versatile, cloud-based Point of Sale
                      platform offering integrated payment processing, software, and business
                      management tools for retail, restaurants, and enterprises, enabling features
                      like inventory, customer management, and omnichannel sales (in-store, online,
                      mobile) to streamline operations and enhance customer experience globally.
                      It&apos;s designed to be scalable for businesses of all sizes, from small shops to
                      large chains, providing a unified command center for payments and operations.
                    </p>
                    <div className="search-results-page__ai-features">
                      <h3 className="search-results-page__ai-features-title">
                        Key Features & Capabilities
                      </h3>
                      <ul className="search-results-page__ai-features-list">
                        <li>
                          <strong>Omnichannel Sales:</strong> Supports in-store (countertop,
                          handheld), online (virtual terminal, payment links), and mobile payments.
                        </li>
                        <li>
                          <strong>Integrated Payments:</strong> Handles credit, debit, gift, and
                          contactless payments seamlessly.
                        </li>
                        <li>
                          <strong>Retail Management:</strong> Includes inventory tracking, customer
                          data analytics, promotions, and back-office management.
                        </li>
                        <li>
                          <strong>Restaurant Management:</strong> Offers table management, kitchen
                          communication, and scan-to-order/pay.
                        </li>
                        <li>
                          <strong>Enterprise-Ready:</strong> Built for scale with features for large
                          organizations, including food service and specialized sectors.
                        </li>
                        <li>
                          <strong>Global Expansion:</strong> Enables rapid deployment across
                          different countries with localized requirements.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="search-results-page__results" id="search">
                {mockResults.map((result, index) => (
                  <div key={index} className="search-results-page__result">
                    <div className="search-results-page__result-header">
                      {result.displayUrl && (
                        <div className="search-results-page__result-url">
                          {result.displayUrl}
                        </div>
                      )}
                      <h3 className="search-results-page__result-title">
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          {result.title}
                        </a>
                      </h3>
                    </div>
                    <div className="search-results-page__result-snippet">{result.snippet}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar with Ads */}
            <aside className="search-results-page__sidebar">
              <div className="search-results-page__sidebar-ads">
                {sidebarAds.map((ad, index) => (
                  <div key={index} className="search-results-page__sidebar-ad">
                    <h4 className="search-results-page__sidebar-ad-title">
                      {ad.url ? (
                        <Link href={ad.url}>
                          {ad.title}
                        </Link>
                      ) : (
                        ad.title
                      )}
                    </h4>
                    <p className="search-results-page__sidebar-ad-snippet">{ad.snippet}</p>
                    <div className="search-results-page__sidebar-ad-source">{ad.source}</div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default SearchResultsPage;
