<script lang="ts">
  import LegalLayout from '$lib/components/LegalLayout.svelte';
</script>

<LegalLayout title="Privacy Policy">
  <p>
    GWS ("the Bot", "we", "us") is committed to protecting the privacy of its users. This Privacy
    Policy explains how we collect, use, and share information when you use our Discord application.
  </p>

  <h2>Information We Collect</h2>
  <p>
    To provide our tactical filtering services, GWS collects and processes the following information
    from Discord:
  </p>
  <ul>
    <li>
      <strong>Message Content:</strong> We scan message content specifically for Twitter/X URLs. This
      content is processed in real-time to extract IDs and is not stored permanently unless a violation
      is detected.
    </li>
    <li>
      <strong>User Identifiers:</strong> We collect Discord User IDs, Usernames, and Guild (Server) IDs
      to associate messages with authors and apply guild-specific blocklist settings.
    </li>
    <li>
      <strong>Violation Data:</strong> When a blocked Twitter account is linked, we log the event (Message
      ID, Author ID, Channel ID, and the matched Twitter ID) for moderation and analytics purposes.
    </li>
  </ul>

  <h2>How We Use Information</h2>
  <p>The information collected is used solely for the operation of the GWS Bot, including:</p>
  <ul>
    <li>Enforcing guild-specific blocklist settings.</li>
    <li>Providing moderation logs to guild administrators.</li>
    <li>Analyzing trends in blocklist violations to improve filtering accuracy.</li>
  </ul>

  <h2>Data Retention</h2>
  <p>
    Violation logs and analytics are stored securely. Non-violating message content is never stored.
    Users may request the deletion of their data by visiting our
    <a href="/data-deletion">Data Deletion Request</a> page.
  </p>
</LegalLayout>
