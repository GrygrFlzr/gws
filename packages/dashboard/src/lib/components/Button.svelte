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

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:shadow-md disabled:bg-sky-600',
    secondary:
      'bg-badge-neutral-bg text-fg-primary border border-border-main hover:bg-muted hover:border-fg-secondary',
    danger:
      'bg-error-bg text-error-text border border-error-border hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-error-text'
  };

  const combinedClasses = $derived([baseClasses, variantClasses[variant], className]);
</script>

{#if rest.href}
  <a class={combinedClasses} {...rest as HTMLAnchorAttributes}>
    {#if loading}
      <span class="inline-flex items-center gap-2">
        <span
          class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        ></span>
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
        <span
          class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        ></span>
        {@render children()}
      </span>
    {:else}
      {@render children()}
    {/if}
  </button>
{/if}
