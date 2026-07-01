/**
 * helpData.js
 * Saara static data — FAQs aur contact options.
 * Alag file mein isliye ki component mein clutter na ho.
 */

export const faqs = [
  {
    category: "Account",
    icon: "👤",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Sign Up' on the welcome screen. Choose your role — Student or Society — then fill in your details and verify your college email. Your account will be ready instantly.",
      },
      {
        q: "I forgot my password. What should I do?",
        a: "On the login screen, tap 'Forgot Password' and enter your registered email. You will receive a reset link within a few minutes. Check your spam folder if it doesn't arrive.",
      },
      {
        q: "How do I update my profile picture?",
        a: "Go to My Profile from the sidebar, tap the camera icon on your avatar, choose a photo from your gallery, and save. Changes are reflected immediately across the app.",
      },
      {
        q: "Can I change my registered email?",
        a: "Email changes require identity verification. Please contact our support team via the 'Contact Us' section below and we'll guide you through the process securely.",
      },
    ],
  },
  {
    category: "Posts & News",
    icon: "📰",
    items: [
      {
        q: "Who can upload posts and news?",
        a: "Society accounts can upload event posts and news updates. Student accounts can like, comment, follow societies, and join events but cannot upload posts or news directly.",
      },
      {
        q: "Why was my post removed?",
        a: "Posts are removed if they violate our community guidelines — this includes spam, misleading information, or inappropriate content. You'll receive a notification explaining the reason.",
      },
      {
        q: "How do I delete a post I uploaded?",
        a: "Open the post, tap the three-dot menu (⋯) in the top-right corner of the card, and select 'Delete'. Deletion is permanent and cannot be undone.",
      },
    ],
  },
  {
    category: "Notifications",
    icon: "🔔",
    items: [
      {
        q: "Why am I not receiving notifications?",
        a: "Make sure notifications are enabled in your device settings for this app. Also check that you are logged in — notifications only work for authenticated users.",
      },
      {
        q: "How do I mark all notifications as read?",
        a: "On the Notifications page, tap the double-checkmark (✓✓) icon next to 'Notifications' in the header. All unread notifications will be marked as read at once.",
      },
      {
        q: "Can I turn off specific notification types?",
        a: "Currently you can filter notifications by type (Likes, Comments, Posts, Joins) using the tabs on the Notifications page. Full per-type settings are coming in a future update.",
      },
    ],
  },
  {
    category: "Following & Communities",
    icon: "👥",
    items: [
      {
        q: "How do I follow a society?",
        a: "Visit any society's public profile and tap the 'Follow' button. Their new posts and news will appear in your feed. You can unfollow anytime from the same button.",
      },
      {
        q: "How do I join an event?",
        a: "Open an event post and tap 'Join Event'. If a registration form link is attached, you'll be redirected to it. Your join count is tracked on the society's side.",
      },
    ],
  },
];

export const contactOptions = [
  {
    icon: "✉️",
    label: "Email Support",
    value: "support.duventra@gmail.com",
    action: () => window.open("mailto:support.duventra@gmail.com"),
    color: "#6c63ff",
  },
  
];
