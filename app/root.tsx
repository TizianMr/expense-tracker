import { ColorTheme } from '@prisma/client';
import { LoaderFunctionArgs } from '@remix-run/node';
import { Links, Meta, MetaFunction, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import notify, { Toaster } from 'react-hot-toast';
import { useChangeLanguage } from 'remix-i18next/react';
import { getToast } from 'remix-toast';
import './tailwind.css';

import { getLoggedInUser } from './db/auth.server';
import { cx } from './utils/helpers';
import i18next from './utils/i18n/i18next.server';
import { getPreferredTheme, NonFlashOfWrongThemeEls, ThemeProvider, useTheme } from './utils/theme-provider';

export async function loader({ request }: LoaderFunctionArgs) {
  const locale = await i18next.getLocale(request);
  const user = await getLoggedInUser(request);

  const { toast, headers } = await getToast(request);
  return Response.json({ locale, userTheme: user?.preferences.theme, toast }, { headers });
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
  const { locale, userTheme, toast } = useLoaderData<typeof loader>();
  const [theme, setTheme] = useTheme();

  // This hook will change the i18n instance language to the current locale
  // detected by the loader, this way, when we do something to change the
  // language, this locale will change and i18next will load the correct
  // translation files
  useChangeLanguage(locale);

  useEffect(() => {
    // when userTheme = null, check if there is a stored theme in localStorage, otherwise use the preferred theme
    const storedTheme = window.localStorage.getItem('theme') as ColorTheme | null;
    setTheme(userTheme ? userTheme : (storedTheme ?? getPreferredTheme()));
  }, [setTheme, userTheme]);

  useEffect(() => {
    switch (toast?.type) {
      case 'success':
        notify.success(toast.message);
        return;
      case 'error':
        notify.error(toast.message);
        return;
      default:
        return;
    }
  }, [toast]);

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
        <Toaster
          position='bottom-center'
          reverseOrder={false}
        />
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
