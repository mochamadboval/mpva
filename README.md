# mpva - Multi Page Vite App

Run:

```sh
npx mpva my-project
```

This will install the latest Vite (^5.x.x) and Tailwind CSS (^3.x.x).

## Things you need to know

- The `src` directory is the root of the project during `npm run dev` and `npm run build`, so the `"/..."` path starts from the `src`.
- The `404.html` page only appears when the project has been deployed (in this case on Netlify). During development, pages that are not found will use the browser's default view.
