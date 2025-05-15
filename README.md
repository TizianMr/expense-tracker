
<div align='center'>
    <img src="./public/logo-horizontal.png" width="500px" alt='Expense tracker logo'/>
</div>


# Expense Tracker

Expense Tracker is a simple budgeting app build with Remix to manage and monitor your expenses and budgets.

The main purpose of the project was to get to know Remix and Prisma and to expand my knowledge.

## Techstack

The project is developed using the following technologies:

[Remix](https://remix.run/) as full stack web framework\
[Prisma](https://www.prisma.io/) as ORM\
[PostgreSQL](https://www.postgresql.org/) as database\
[tremor](https://npm.tremor.so/) as component library\
[Amazon S3](https://aws.amazon.com/s3/?nc1=h_ls) for storing and accessing profile pictures

## How to install

Install all dependencies by running:
```sh
npm install
```

Run the dev server by executing:
```sh
npm run dev
```

For building you app for production, run:
```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

### Configure database and prisma

This project uses a PostgreSQL database for storing users, expenses and budgets.

You're free to use a different database such as `mysql` if you prefer. Just note that you'll likely need to update the `schema.prisma` file accordingly.

To configure this project with a database create a new PostgreSQL database and paste the connection string into your `.env` file.

```
# replace with your database connection string
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Next, to generate all tables, including a demo user with the email `demo@example.com` and password `SuperPassword`, as well as some sample expenses and budgets, and to initialize your PrismaClient, run the following command:
```sh
npx prisma migrate dev
```

If you wish to create a completely empty database instead, run:
```sh
npm run prisma:init:empty
```

To only generate your `PrismaClient`, run:
```sh
npx prisma generate
```

To quickly fill your database with some example data, you can run:
```sh
npx prisma db seed
```

This populates your db with a demo user having the mail address `demo@example.com` and password `SuperPassword` along with some expenses and budgets.

### Configure Amazon S3

This project uses an Amazon S3 Bucket to store and retrieve the profile pictures of users. You may use another solution for this or completely remove the possibility to add profile pictures. Note, however, that in these cases the code would have to be adapted accordingly. To setup an Amazon S3 Bucket follow the following steps:

1. Set up an [AWS account](https://aws.amazon.com/?nc1=h_ls) (skip this step if you already have an account).
2. Create an IAM user (skip this step if you already have an user that you want to use).
3. Create a new access key for this user. Note down the access key id and secret access key.
4. Set up a new S3 bucket.
5. Navigate to the permission settings of the newly created S3 bucket and uncheck the 'block all public access' option.
6. In the Bucket policy section, paste the following content and replace with your created user and bucket name.

```json
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "AllowPublicRead",
            "Effect": "Allow",
            "Principal": {
                "AWS": "<arn-of-user>"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<bucket-name>/*"
        }
    ]
}
```

7. After that replace the values in the `.env` file with your values

```
# AWS S3 Bucket
ACCESS_KEY_ID="<access key ID>"
SECRET_ACCESS_KEY="<secret key>"
BUCKET_NAME="<s3 bucket name>"
BUCKET_REGION="<s3 bucket region>"
```


## Limitations

### E-Mail verification

Currently, e-mail addresses are not checked for their actual existence.

It is only ensured that the format of the e-mail addresses entered is valid and that they are unique within the user base.

## Challenges in development
### Dialog routes

In the initial implementation, dialogs were controlled via a local useState variable that managed their open state through props, rather than having dedicated routes. If the dialog required data, it was passed in as a prop, and on submit, a [resource route](https://remix.run/docs/en/main/guides/resource-routes) was triggered to handle the corresponding action.

To make dialogs independent of other components—and ensure they don't interfere with them—I decided to give each dialog its own route. This approach allows dialogs to use their own loader and action functions, eliminating the need for separate resource routes.

However, this introduced the issue that when a dialog was closed, the navigation back occurred before its close animation had finished. To resolve this, I used a custom hook (`useDelayedNavigation`) to delay the navigation by the duration of the animation. When switching to the dialog routes and back again, the search params are preserved so as not to reset the state of the app.

### Pending UI

The dashboard component loads multiple data sets that are shared across various sections of the page (expenses, budgets and statistics data).
The challenge was identifying which data had changed—and therefore which parts of the page needed to update—and displaying a loading spinner when the update process took longer than expected.

Initially I used the `useNavigation` hook to determine when the dashboard loader was active. However, it was not possible to distinguish which data had to be reloaded. As a result, a loading spinner was displayed across all areas of the application.

The solution to this problem were two custom hooks.

The first one (`useDelayedQueryParamLoading`) is triggered when the query params are updating. It compares the current query params with the ones that are being loaded and returns true if they don't match within a given delay. Only the relevant part of the query params is considered and compared.

The second one (`useDelayedNavigationLoading`) is rather similiar. This hook is used when data is loading after a navigation. It compares the source branch with the target branch and returns true if they are different for longer than the specified delay.

Altough this solution solves the problems this application has with pending ui it fells a bit like a hacky one.

## Useful Ressources

* [useEncapsulation](https://kyleshevlin.com/use-encapsulation/) - This article has helped me to develop a perspective on when I should outsource extra logic to my own hooks
* [The Complete Guide to Dark Mode with Remix ](https://www.mattstobbs.com/remix-dark-mode/) - This article helped me a lot to get started with setting up different color themes in my application