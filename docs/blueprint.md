# **App Name**: TempMail Client

## Core Features:

- Parameter Configuration: Display a form where users can configure parameters such as desired name length of the temp mail to be requested.
- Request Email Address: Fetch a new email address using the TempMail REST API and the provided configuration. Consider this REST API as a tool, using reasoning to determine whether to provide some output to the user.
- Email Address Display: Display the newly generated email address with a button to copy it to clipboard.
- Check for New Emails: Periodically check for new emails using the TempMail REST API, and display the number of unread emails.
- Email List Display: Display a list of received emails with sender, subject, and a short preview.
- Email Content View: Display the full content of the selected email.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082), chosen for its association with technology and sophistication.
- Background color: Light Lavender (#E6E6FA), a desaturated version of deep indigo, for a calm and clean interface.
- Accent color: Vivid Violet (#9400D3), an analogous hue to deep indigo, providing contrast for highlights and active elements.
- Font: 'Inter', a grotesque-style sans-serif, providing a modern, machined, neutral, functional look appropriate for UI elements.
- Use minimalist icons for email actions (refresh, copy, delete) and navigation.
- Employ a clean, card-based layout for displaying email lists and content.
- Subtle animations for loading new emails and transitioning between views.