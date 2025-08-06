# Frontend Mentor - Bento grid solution

This is a solution to the [Bento grid challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/bento-grid-RMydElrlOj).

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)

## Overview

### The challenge

Users should be able to:

- View the optimal layout for the interface depending on their device's screen size

### Links

- Solution URL: [github repo](https://github.com/hana1203/fm-challenges/tree/main/bento-grid-main)
- Live Site URL: [link](https://hana1203.github.io/fm-challenges/bento-grid-main/)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- Mobile-first workflow
- [TailwindCSS](https://tailwindcss.com/docs/installation/tailwind-cli) - For styles

### What I learned

- I defined the layout structure using `grid-template-areas` by assigning names to specific areas within the grid container. This CSS property allowed me to visually arrange grid items by referencing the names of the grid areas, making it easier to position complex layouts that are difficult to place using row/column grid lines.

- I learned that the `transform` property (e.g., `scale`, `translate`) does NOT affect the layout of the page. Even if an image is visually scaled up(e.g., to 190%), it still only occupies the original space of the element in the layout.

- I learned how to clip the image to fit in the entire content box while maintaining its aspect ratio.

```css
/* container */
aspect-ratio: 50/31;
/* image */
object-fit: cover;
```

### Continued development

I am not sure if it is the most efficient way to handle desktop responsiveness, because I had to manually add the desktop keyword to every class in order to define media queries with the tailwind css.

### Useful resources

- [Example resource 1](https://css-tricks.com/snippets/css/complete-guide-grid/) - It helped me to get the basic concept of the CSS grid.
- [Example resource 2](https://www.youtube.com/watch?v=h4dHvo09cG4) - It helped me to solve the issue where the last row was too tall when I first applied the grid-template-areas layout.
