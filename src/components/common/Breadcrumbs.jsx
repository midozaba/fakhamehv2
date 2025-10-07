import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getBreadcrumbSchema } from '../../utils/structuredData';
import { Helmet } from 'react-helmet-async';

/**
 * Breadcrumbs Component for Navigation and SEO
 * Automatically generates breadcrumbs based on current route
 * Includes Schema.org structured data for rich snippets
 */
const Breadcrumbs = ({ customCrumbs }) => {
  const { language } = useApp();
  const location = useLocation();

  // Route name translations
  const routeNames = {
    en: {
      '/': 'Home',
      '/cars': 'Browse Cars',
      '/booking': 'Book Now',
      '/contact-us': 'Contact Us',
      '/about-us': 'About Us',
      '/faq': 'FAQ',
      '/terms-of-service': 'Terms of Service',
      '/admin': 'Admin Dashboard',
    },
    ar: {
      '/': 'الرئيسية',
      '/cars': 'تصفح السيارات',
      '/booking': 'احجز الآن',
      '/contact-us': 'اتصل بنا',
      '/about-us': 'من نحن',
      '/faq': 'الأسئلة الشائعة',
      '/terms-of-service': 'شروط الخدمة',
      '/admin': 'لوحة التحكم',
    }
  };

  // Generate breadcrumb items from current path
  const generateCrumbs = () => {
    if (customCrumbs) return customCrumbs;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs = [
      { name: routeNames[language]['/'], path: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip numeric IDs (like /booking/123)
      if (!isNaN(segment)) {
        return;
      }

      const name = routeNames[language][currentPath] ||
                   segment.split('-').map(word =>
                     word.charAt(0).toUpperCase() + word.slice(1)
                   ).join(' ');

      crumbs.push({
        name,
        path: currentPath
      });
    });

    return crumbs;
  };

  const breadcrumbs = generateCrumbs();

  // Don't show breadcrumbs on homepage or admin
  if (location.pathname === '/' || location.pathname.startsWith('/admin')) {
    return null;
  }

  // Generate Schema.org structured data
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);

  return (
    <>
      {/* Schema.org Structured Data */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Breadcrumb UI */}
      <nav
        aria-label="Breadcrumb"
        className={`bg-gray-50 border-b border-gray-200 ${language === 'ar' ? 'rtl' : 'ltr'}`}
      >
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center flex-wrap gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const isHome = crumb.path === '/';

              return (
                <li key={crumb.path} className="flex items-center gap-2">
                  {/* Home Icon for first item */}
                  {isHome ? (
                    <Link
                      to={crumb.path}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                      aria-label={crumb.name}
                    >
                      <Home size={16} />
                      <span className="hidden sm:inline">{crumb.name}</span>
                    </Link>
                  ) : isLast ? (
                    /* Current page (not clickable) */
                    <span className="text-gray-700 font-medium" aria-current="page">
                      {crumb.name}
                    </span>
                  ) : (
                    /* Regular link */
                    <Link
                      to={crumb.path}
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}

                  {/* Separator (not after last item) */}
                  {!isLast && (
                    <ChevronRight
                      size={16}
                      className={`text-gray-400 ${language === 'ar' ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
};

export default Breadcrumbs;
