<script lang="ts">
  import type { ClassValue, HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

  type Variant = 'primary' | 'secondary' | 'danger';

  type Props = (
    | ({ href: string } & Partial<HTMLAnchorAttributes>)
    | ({ href?: never } & Partial<HTMLButtonAttributes>)
  ) & {
    variant?: Variant;
    loading?: boolean;
    class?: ClassValue;
    children: any;
  };

  let {
    variant = 'primary',
    loading = false,
    class: className,
    children,
    ...rest
  }: Props = $props();

  const baseClasses =
    'rounded-md px-4 py-2 text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center hover:scale-[1.02] active:scale-[0.98]';

  const variantClasses = {
    primary: 'variant-primary',
    secondary: 'variant-secondary',
    danger: 'variant-danger'
  };

  const combinedClasses = $derived([baseClasses, variantClasses[variant], className]);
</script>

{#if rest.href}
  <a class={combinedClasses} {...rest as HTMLAnchorAttributes}>
    {#if loading}
      <span class="inline-flex items-center gap-2">
        <span class="spinner" aria-hidden="true"></span>
        {@render children()}
      </span>
    {:else}
      {@render children()}
    {/if}
  </a>
{:else}
  <button
    class={combinedClasses}
    disabled={(rest as HTMLButtonAttributes).disabled || loading}
    {...rest as HTMLButtonAttributes}
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
{/if}

<style>
  .variant-primary {
    background-color: var(--color-sky-600);
    color: white;
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  }
  .variant-primary:hover:not(:disabled) {
    background-color: var(--color-sky-700);
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .variant-secondary {
    background-color: var(--color-badge-neutral-bg);
    color: var(--color-fg-primary);
    border: 1px solid var(--color-border-main);
  }
  .variant-secondary:hover:not(:disabled) {
    background-color: var(--color-muted);
    border-color: var(--color-fg-secondary);
  }

  .variant-danger {
    background-color: var(--color-error-bg);
    color: var(--color-error-text);
    border: 1px solid var(--color-error-border);
  }
  .variant-danger:hover:not(:disabled) {
    background-color: light-dark(
      var(--color-red-100),
      color-mix(in srgb, var(--color-red-900) 40%, transparent)
    );
    border-color: var(--color-error-text);
  }

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
