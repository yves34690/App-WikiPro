/**
 * Index des composants communs - WikiPro
 * Export centralisé de tous les composants communs
 */

// Composants existants
export { default as Header } from './Header';
export { default as Navigation } from './Navigation';
export { default as NavTab } from './NavTab';
export { default as TabContent } from './TabContent';

// Nouveaux composants API
export { default as AuthGuard, withAuthGuard, useAuthGuard, PermissionGate } from './AuthGuard';
export { 
  default as LoadingState,
  LoadingSpinner,
  LoadingWithText,
  SkeletonCard,
  SkeletonList,
  SkeletonChart,
  ErrorState,
  EmptyState,
  SuspenseWrapper,
  ErrorBoundary,
  useLoadingState,
} from './LoadingState';