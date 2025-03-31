# Deploying the Responsive Animated Piano to Vercel and Supabase

This guide will walk you through the process of deploying the Responsive Animated Piano application to Vercel with Supabase as the backend database.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- A [Vercel](https://vercel.com/) account
- A [Supabase](https://supabase.io/) account

## Step 1: Set Up Supabase

1. Log in to your Supabase account and create a new project.
2. Note your Supabase URL and anon key (public API key) from the project settings.
3. In the SQL Editor, run the SQL commands from the `supabase-schema.sql` file to set up the database schema.

## Step 2: Configure Environment Variables

1. Create a `.env` file in the root directory of your project by copying the `.env.example` file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your Supabase credentials:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

## Step 3: Test Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000` to ensure everything is working correctly.

## Step 4: Deploy to Vercel

### Option 1: Deploy with Vercel CLI

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Log in to Vercel:

```bash
vercel login
```

3. Deploy the application:

```bash
vercel
```

4. Follow the prompts to configure your deployment.

### Option 2: Deploy with GitHub Integration

1. Push your code to a GitHub repository.
2. Log in to your Vercel account.
3. Click "New Project" and import your GitHub repository.
4. Configure the project settings:
   - Build Command: `npm run build` (if applicable)
   - Output Directory: Leave as default
   - Environment Variables: Add your Supabase credentials (SUPABASE_URL and SUPABASE_ANON_KEY)
5. Click "Deploy" to start the deployment process.

## Step 5: Verify Deployment

1. Once the deployment is complete, Vercel will provide you with a URL for your application.
2. Open the URL in your browser to verify that the application is working correctly.
3. Test the functionality to ensure that recordings can be saved to and loaded from Supabase.

## Additional Configuration

### Custom Domain

If you want to use a custom domain for your application:

1. Go to your project settings in Vercel.
2. Navigate to the "Domains" section.
3. Add your custom domain and follow the instructions to configure DNS settings.

### Environment Variables

If you need to update your environment variables after deployment:

1. Go to your project settings in Vercel.
2. Navigate to the "Environment Variables" section.
3. Add or update your environment variables as needed.

## Troubleshooting

- **CORS Issues**: If you encounter CORS issues, make sure your Supabase project has the correct CORS configuration. In the Supabase dashboard, go to Settings > API and add your Vercel domain to the allowed origins.
- **Database Connection Issues**: Verify that your Supabase credentials are correct and that the database schema has been set up properly.
- **Deployment Failures**: Check the Vercel deployment logs for any errors. Common issues include missing dependencies or environment variables.

## Maintenance

- **Updating the Application**: To update your application, simply push changes to your GitHub repository (if using GitHub integration) or run `vercel` again from your local environment.
- **Database Backups**: Supabase provides automatic backups of your database. You can also manually export your data from the Supabase dashboard.
