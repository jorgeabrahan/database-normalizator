/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
        tabWidth: 2,
        useTabs: false,
        singleQuote: true,
        bracketSpacing: true,
        jsxBracketSameLine: false,
        htmlWhitespaceSensitivity: "strict",
        proseWrap: "always",
      },
    },
  ],
};
