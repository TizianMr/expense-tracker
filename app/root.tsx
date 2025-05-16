import { Links, Meta, MetaFunction, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import './tailwind.css';

import { cx } from './utils/helpers';
import { NonFlashOfWrongThemeEls, ThemeProvider, useTheme } from './utils/theme-provider';

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
  const [theme] = useTheme();

  return (
    <html
      className={cx('antialiased', theme?.toLowerCase())}
      lang='en'>
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
