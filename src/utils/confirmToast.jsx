import { toast } from "react-toastify";
import "./confirmToast.css";
/**
 * confirmToast(message)
 * window.confirm() ka drop-in replacement, react-toastify pe based.
 * Ek toast dikhata hai jisme "Yes" / "Cancel" buttons hote hain,
 * aur ek Promise<boolean> return karta hai — jaise window.confirm() karta tha.
 *
 * Usage:
 *   if (!(await confirmToast("Delete this post?"))) return;
 */
export default function confirmToast(message) {
  return new Promise((resolve) => {
    const toastId = "confirm-toast";

    const handle = (result) => {
      toast.dismiss(toastId);
      resolve(result);
    };

    toast(
      ({ closeToast }) => (
        <div className="confirm-toast">
          <p className="confirm-toast-message">{message}</p>
          <div className="confirm-toast-actions">
            <button
              type="button"
              className="confirm-toast-btn confirm-toast-btn-confirm"
              onClick={() => {
                closeToast();
                handle(true);
              }}
            >
              Yes
            </button>
            <button
              type="button"
              className="confirm-toast-btn confirm-toast-btn-cancel"
              onClick={() => {
                closeToast();
                handle(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        toastId,
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        onClose: () => resolve(false),
      },
    );
  });
}
