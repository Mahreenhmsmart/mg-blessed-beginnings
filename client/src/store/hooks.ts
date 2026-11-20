import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './store';

// Use these typed hooks everywhere instead of raw useDispatch/useSelector.
// These are standard typed wrappers — no try/catch around hook calls as that
// would violate React's rules of hooks. If called outside a Provider, React
// will throw an error which should be caught by ErrorBoundary.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector.withTypes<RootState>();
