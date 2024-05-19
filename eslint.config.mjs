import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

const jsRules = {
    quotes: ["error", "double"],
    indent: ["error", 4],
    semi: ["error", "always"],
    "max-len": ["error", { code: 100 }],
};

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            ...jsRules,
            ...prettierPlugin.configs.recommended.rules,
            ...eslintConfigPrettier.rules,
            "prettier/prettier": [
                "error",
                {
                    singleQuote: false,
                    semi: true,
                    tabWidth: 4,
                },
            ],
        },
    },
);
