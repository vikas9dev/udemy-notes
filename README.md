**🌐 Live Site:** [https://clever-liger-2e7c60.netlify.app/](https://clever-liger-2e7c60.netlify.app/)

> ⚠️ **Note:** This Netlify deployment runs on a free tier with limited resources (4 GB RAM). As a result, downloading **multiple lectures at once** may cause the app to freeze.
>
> ✅ You can **download one lecture at a time** via the live site.
> 🚀 To download **multiple lectures together**, it's recommended to **run the app locally**.

### 🛠️ Local Setup Requirements:

* Built with **[Next.js](https://nextjs.org)**
* Requires a valid **Gemini API key**
* To access Udemy course content, you'll need to provide your **Udemy cookies**

---

To use the application:

```bash
npm install
```

Before starting the application, we need to create the `.env.local` file with your Gemini API key. Create a file named `.env.local` in the root directory of your project with the following content:

```env
GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual Gemini API key.

Once you've created the `.env.local` file, let's start the development server:

```bash
npm run dev
```

The application should now be running! Here's how to use it:

1. Open your browser and go to [http://localhost:3000](http://localhost:3000)

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

---

To check the ESLint issue (only for deployment, not required while running locally):-

```bash
npm run lint
npm run build
```
