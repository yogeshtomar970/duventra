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
    let answered = false; // taaki onClose galti se "false" resolve na kar de jab already answer chuka ho

    const handle = (result) => {
      answered = true;
      resolve(result);        // pehle resolve karo...
      toast.dismiss(toastId); // ...phir toast band karo (dismiss se onClose trigger ho sakta hai, par ab woh no-op hoga)
    };

    toast(
      () => (
        <div className="confirm-toast">
          <p className="confirm-toast-message">{message}</p>
          <div className="confirm-toast-actions">
            <button
              type="button"
              className="confirm-toast-btn confirm-toast-btn-confirm"
              onClick={() => handle(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className="confirm-toast-btn confirm-toast-btn-cancel"
              onClick={() => handle(false)}
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
        onClose: () => {
          if (!answered) resolve(false); // sirf tab jab user ne button na dabaya ho (e.g. swipe se band kiya)
        },
      },
    );
  });
}
