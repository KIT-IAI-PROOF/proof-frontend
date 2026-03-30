import eslint from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import reactQuery from '@tanstack/eslint-plugin-query';

export default [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: ['./tsconfig.node.json', './tsconfig.app.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        settings: {react: {version: '18.3'}},
        ignores: ['dist', 'dev-dist'],
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@tanstack/query': reactQuery,
            'react': react,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...reactQuery.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-misused-promises': 'off',
            '@typescript-eslint/unbound-method': 'off',
            "@typescript-eslint/no-unused-vars": "off",
            '@typescript-eslint/no-unsafe-member-access': 'off',
            'react-refresh/only-export-components': [
                'warn',
                {
                    allowConstantExport: true,
                },
            ],
        },
    },
];
