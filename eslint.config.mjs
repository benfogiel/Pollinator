import tsEslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

const jsRules = {
    quotes: ["error", "double"],
    indent: ["error", 4],
    semi: ["error", "always"],
    "max-len": ["error", { code: 100 }],
};

export default tsEslint.config(...tsEslint.configs.recommended, {
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
});
