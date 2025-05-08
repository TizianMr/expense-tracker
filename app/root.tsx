import { Links, Meta, MetaFunction, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import './tailwind.css';

export const meta: MetaFunction = () => {
  return [
    { title: 'Expense Tracker' },
    {
      name: 'description',
      content: 'Simple expense tracker',
    },
  ];
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      className='antialiased'
      lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta
          content='width=device-width, initial-scale=1'
          name='viewport'
        />
        <Meta />
        <Links />
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
  return <Outlet />;
}
