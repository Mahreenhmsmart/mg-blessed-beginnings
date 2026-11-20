import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { removeToast } from '@/store/slices/uiSlice';
import Toast from './Toast';

/**
 * Container component that renders all active toasts from Redux state.
 * Place this in your Layout or App component.
 */
export default function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.ui.toasts);

  const handleClose = (id: string) => {
    dispatch(removeToast(id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      data-icod-id="src_components_ui_toastcontainer_tsx_d425">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto"
          data-icod-id={`src_components_ui_toastcontainer_tsx_7728_${toast.id}`}>
          <Toast
            id={toast.id}
            message={toast.message}
            variant={toast.variant}
            onClose={handleClose}
            data-icod-id={`src_components_ui_toastcontainer_tsx_6059_${toast.id}`} />
        </div>
      ))}
    </div>
  );
}
