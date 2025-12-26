<script lang="ts">
  import LegalLayout from '$lib/components/LegalLayout.svelte';
</script>

<LegalLayout title="Data Deletion Request">
  <div class="mb-8 border-l-4 border-sky-500 bg-sky-50/50 p-4 text-sm text-sky-900">
    <strong>Self-Hosting Note:</strong> This process is for requesting data deletion from the official
    GWS service. For self-hosted instances, please contact the administrator of that specific instance.
  </div>

  <p>
    GWS respects your right to privacy and provides a straightforward process for users to request
    the deletion of their data.
  </p>

  <h2>How to Request Deletion</h2>
  <p>
    You can request the deletion of your Discord-associated data (such as violation logs or
    analytics) by using any of the following methods:
  </p>
  <ul>
    <li>
      <strong>Direct Message:</strong> You can send a direct message to the bot developers if you share
      a server with them.
    </li>
  </ul>

  <h2>What Data is Deleted</h2>
  <p>Upon receiving a valid request, we will remove the following records from our database:</p>
  <ul>
    <li>Detailed violation logs associated with your Discord User ID.</li>
    <li>Individual message metadata linked to your account.</li>
    <li>Any cached Discord user profile information (username, avatar, global name).</li>
  </ul>

  <h2>What Data is Retained</h2>
  <p>
    To protect the safety of server communities and ensure that moderation actions (such as
    auto-mutes or bans for repeat offenders) remain effective, GWS retains certain high-level
    analytical data:
  </p>
  <ul>
    <li>
      <strong>Violation Counts:</strong> The total number of times your account has triggered a blocklist
      violation remains on record for each guild.
    </li>
    <li>
      <strong>Recency Data:</strong> The timestamp of your most recent violation is retained to calculate
      frequency and risk levels.
    </li>
  </ul>
  <p>
    <em>
      Note: This retained data is used strictly for community protection and is not shared with
      third parties. Deletion of personal identifiers does not reset your violation history for the
      purpose of guild-level moderation thresholds.
    </em>
  </p>
</LegalLayout>
