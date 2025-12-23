<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'danger';

  const {
    variant = 'primary',
    disabled = false,
    loading = false,
    type = 'button',
    onclick,
    children
  }: {
    variant?: Variant;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit';
    onclick?: () => void;
    children: any;
  } = $props();

  const baseClasses =
    'rounded-md px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-50 text-red-800 hover:bg-red-100'
  };
</script>

<button
  {type}
  class="{baseClasses} {variantClasses[variant]}"
  disabled={disabled || loading}
  {onclick}
>
  {#if loading}
    <span class="inline-flex items-center gap-2">
      <span class="spinner" aria-hidden="true"></span>
      {@render children()}
    </span>
  {:else}
    {@render children()}
  {/if}
</button>

<style>
  .spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
