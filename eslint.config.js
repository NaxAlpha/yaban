export default [
	{
		ignores: ['.wrangler/**', 'node_modules/**', 'dist/**'],
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: {
				project: './tsconfig.json',
			},
		},
		rules: {
			// Best practices
			'no-console': 'off',
			'no-debugger': 'warn',
			'no-alert': 'warn',
			'no-var': 'error',
			'prefer-const': 'error',

			// TypeScript specific
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',

			// Code style
			'object-shorthand': ['error', 'always'],
			'prefer-destructuring': ['error', { object: true, array: false }],
			'prefer-template': 'error',

			// Import style
			'no-duplicate-imports': 'error',
		},
	},
]
