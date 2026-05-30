import clsx from 'clsx';

/**
 * Утилита для условной композиции CSS-классов.
 * Тонкая обёртка над clsx — единая точка использования в проекте.
 */
export const cn = (...args) => clsx(...args);
