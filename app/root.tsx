import { LoaderFunctionArgs } from '@remix-run/node';
import { Links, Meta, MetaFunction, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { useChangeLanguage } from 'remix-i18next/react';
import './tailwind.css';

import { getLoggedInUser } from './db/auth.server';
import { cx } from './utils/helpers';
import i18next from './utils/i18n/i18next.server';
import { getPreferredTheme, NonFlashOfWrongThemeEls, ThemeProvider, useTheme } from './utils/theme-provider';

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  const user = await getLoggedInUser(request);
  return { locale, userTheme: user?.preferences.theme };
}

export const handle = {
  // In the handle export, we can add a i18n key with namespaces our route
  // will need to load. This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config
  // or if you did not set one, set it to the i18next default namespace "translation"
  i18n: 'common',
};

export const meta: MetaFunction = () => {
  return [
    { title: 'Expense Tracker' },
    {
      name: 'description',
      content: 'Simple expense tracker',
    },
  ];
};

function Layout({ children }: { children: React.ReactNode }) {
  const { locale, userTheme } = useLoaderData<typeof loader>();
  const [theme, setTheme] = useTheme();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);

  useEffect(() => {
    setTheme(userTheme ?? getPreferredTheme());
  }, [setTheme, userTheme]);

  return (
    <html
      className={cx('antialiased', theme?.toLowerCase())}
      lang={locale}>
      <head>
        <meta charSet='utf-8' />
        <meta
          content='width=device-width, initial-scale=1'
          name='viewport'
        />
        <Meta />
        <Links />
        <NonFlashOfWrongThemeEls />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Outlet />
      </Layout>
    </ThemeProvider>
  );
}
