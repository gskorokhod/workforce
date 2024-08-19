# Workforce Planning demo

Frontend for a workforce planning tool using the Conjure constraints modelling tool under the hood

Written as part of a STARIS project led by Ozgur Akgun

This is a [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte) project

## Resources

- [FigJam board](https://www.figma.com/board/yIjbMS3WQcrM8b9vHYLCl3/Whiteboard?node-id=0-1&t=c8V2wENENyR81JPP-1)
- [Figma UI wireframe](https://www.figma.com/design/irzfj48pXn8jfiYQ7XBCVP/UI-Wireframe?node-id=183-23584&t=t7OhI3Lw7eZROIcT-1)

## Development tools

This app is written in Typescript for type-safety. See: [svelte & typescript](https://svelte.dev/docs/typescript)

- We use the default set of tools suggested by create-svelte:
  - [Vitest](https://vitest.dev/) for unit testing.
  - [Playwright](https://playwright.dev/) for end-to-end testing
  - [Prettier](https://prettier.io/) for formatting
  - ESLint for linting

See:

- [How do I test svelte apps?](https://svelte.dev/docs/faq#how-do-i-test-svelte-apps)

## Developing

Install dependencies:

```
npm install
```

Run development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
