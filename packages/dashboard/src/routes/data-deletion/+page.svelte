<script lang="ts">
  import LegalLayout from '$lib/components/LegalLayout.svelte';
</script>

<LegalLayout title="Data Deletion Request">
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
    <li>Individual violation logs associated with your Discord User ID.</li>
    <li>Offender analytics and frequency data.</li>
    <li>Any cached Discord user profile information (username, avatar).</li>
  </ul>
  <p>
    <em
      >Note: Some records may be retained for a short period in our database backups before being
      purged completely. Deletion of data does not exempt you from future filtering if you continue
      to post blocked content in servers where GWS is active.</em
    >
  </p>
</LegalLayout>
