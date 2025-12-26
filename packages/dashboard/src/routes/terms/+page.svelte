<script lang="ts">
  import LegalLayout from '$lib/components/LegalLayout.svelte';
</script>

<LegalLayout title="Terms of Service">
  <div class="mb-8 border-l-4 border-sky-500 bg-sky-50/50 p-4 text-sm text-sky-900">
    <strong>Self-Hosting Note:</strong> This document outlines the terms for the official GWS service.
    If you are running a self-hosted instance of the GWS open-source project, these terms do not apply
    to your instance, and you should provide your own terms for your users.
  </div>

  <p>
    By adding GWS to your Discord server or using its features, you agree to the following terms.
  </p>

  <h2>Acceptable Use</h2>
  <p>
    GWS is provided to assist in the moderation of Discord communities. You agree not to use the bot
    to harass individuals or violate Discord's Terms of Service.
  </p>

  <h2>Blocklists</h2>
  <p>
    The bot allows guilds to subscribe to community-maintained blocklists. We do not guarantee the
    accuracy or completeness of these lists. Guild administrators are responsible for the actions
    taken by the bot in their respective servers.
  </p>

  <h2>Disclaimer of Warranties</h2>
  <p>
    GWS is provided "as is" without any warranties. We are not responsible for any service
    disruptions or actions taken by the bot based on your configuration.
  </p>

  <h2>Termination</h2>
  <p>
    We reserve the right to restrict access to the bot for any server or user found to be abusing
    its features or violating these terms.
  </p>
</LegalLayout>
