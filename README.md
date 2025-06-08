This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

To use the application:

```bash
npm install
```

Before starting the application, we need to create the `.env.local` file with your Gemini API key. Since I cannot create it directly, please create a file named `.env.local` in the root directory of your project with the following content:

```env
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual Gemini API key.

Once you've created the `.env.local` file, let's start the development server:

```bash
npm run dev
```

The application should now be running! Here's how to use it:

1. Open your browser and go to `http://localhost:3000`

2. To get your Udemy cookie:
   - Go to Udemy.com and log in
   - Open Developer Tools (F12 or right-click > Inspect)
   - Go to the Network tab
   - Make any request (like clicking on a course)
   - Find the request headers and copy the entire cookie value

3. Application flow:
   - Paste your Udemy cookie in the input field
   - Click "Save & Load Courses" to fetch your courses
   - Select a course from the grid
   - Click "Select Lectures" to go to the curriculum page
   - Select the chapters/lectures you want notes for
   - Click "Generate Notes" to start the process
   - Monitor the progress in the modal
   - The ZIP file will download automatically when complete

The application will:

- Cache your cookie and courses in localStorage
- Show a responsive grid of your courses
- Allow searching and sorting courses
- Show completion progress for each course
- Generate well-structured markdown notes using Gemini AI
- Organize notes by chapter and lecture in a ZIP file
