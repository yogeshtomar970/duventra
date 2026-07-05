import { useState } from "react";
import { toast } from "react-toastify";

/**
 * useShare
 * Share URL banao aur copy-to-clipboard handle karo.
 */
export default function useShare(postId) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/post/${postId}`;
  const shareText = encodeURIComponent(`Check this out: ${shareUrl}`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.info(shareUrl);
    }
  };

  return { shareUrl, shareText, copied, copyLink };
}
