<script lang="ts">
  import LegalLayout from '$lib/components/LegalLayout.svelte';
</script>

<LegalLayout title="Privacy Policy">
  <div class="mb-8 border-l-4 border-sky-500 bg-sky-50/50 p-4 text-sm text-sky-900">
    <strong>Self-Hosting Note:</strong> This policy applies specifically to the official GWS service.
    If you are using a self-hosted version of this software, the operator of that instance is responsible
    for their own privacy practices and data handling.
  </div>

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
    Violation logs and analytics are stored securely to provide essential moderation services to
    server owners. While users may request the deletion of their personal information, GWS retains
    aggregate violation counts and frequency data to ensure that community protection measures
    remain effective against repeat offenders. For more details, visit our
    <a href="/data-deletion">Data Deletion Request</a> page.
  </p>
</LegalLayout>
