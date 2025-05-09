import { LoaderFunctionArgs } from '@remix-run/node';

import { seedDemoUserData } from 'prisma/seed-demo';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const authHeader = request.headers.get('Authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    await seedDemoUserData();
  } catch (error) {
    return new Response('Error seeding demo user data ' + error, {
      status: 500,
    });
  }

  return { message: 'Resetted demo user at: ' + new Date() };
};
