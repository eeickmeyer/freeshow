<script type="ts">
    import { slide } from "svelte/transition"
    import { activeEdit, activeShow, dictionary, drawTool, os, outputDisplay, outputs, paintCache, saved, shows } from "../../stores"
    import Icon from "../helpers/Icon.svelte"
    import { displayOutputs } from "../helpers/output"
    import T from "../helpers/T.svelte"
    import Button from "../inputs/Button.svelte"
    import TopButton from "../inputs/TopButton.svelte"

    export let isWindows = false

    // && !$editHistory.length
    $: editDisabled = $activeEdit.id && ($activeEdit.type || "show") !== "show" ? false : $activeShow && ($activeShow?.type || "show") === "show" ? $shows[$activeShow?.id || ""]?.locked : $activeShow?.type === "pdf" || !$activeShow?.id
    $: physicalOutputWindows = Object.values($outputs).filter((a) => a.enabled && !a.invisible)

    let confirm = false
    let disableClick = false
    let cancelConfirmTimeout: NodeJS.Timeout | null = null
    function toggleOutput(e: any) {
        if (cancelConfirmTimeout) clearTimeout(cancelConfirmTimeout)

        if (!$outputDisplay || confirm) {
            if (confirm) {
                // prevent displaying just after close
                disableClick = true
                setTimeout(() => (disableClick = false), 800)
            }

            confirm = false
            displayOutputs(e)
            return
        }

        let forceKey = e.ctrlKey || e.metaKey
        if (forceKey) return

        confirm = true
        cancelConfirmTimeout = setTimeout(() => {
            confirm = false
        }, 1800)
    }
</script>

<div class="top" class:drag={!isWindows}>
    <!-- {#if !isWindows}
    <div class="dragZone" />
    {/if} -->
    <span style="width: var(--navigation-width);">
        {#if !$saved && $os.platform !== "win32"}
            <div class="unsaved" />
        {/if}
        <!-- logo -->
        <h1 style="align-self: center;width: 100%;padding: 0px 10px;text-align: center;font-size: 1.8em;">FreeShow</h1>
        <!-- <div class="logo">
            <img style="height: 35px;" src="./import-logos/freeshow.webp" alt="FreeShow-logo" draggable={false} />
            <h1 style="color: var(--text);font-size: 1.7em;">FreeShow</h1>
        </div> -->
    </span>
    <span>
        <TopButton id="show" />
        <TopButton id="edit" disabled={editDisabled} />
        <!-- <TopButton id="draw" /> -->
        <TopButton id="stage" />
    </span>
    <span style="width: var(--navigation-width);justify-content: flex-end;">
        <!-- <TopButton id="stage" hideLabel /> -->
        <TopButton id="draw" red={$drawTool === "fill" || $drawTool === "zoom" || !!($drawTool === "paint" && $paintCache?.length)} hideLabel />
        <TopButton id="settings" hideLabel />
        <Button
            id="output_window_button"
            title={($outputDisplay ? (confirm ? $dictionary.menu?.again_confirm : $dictionary.menu?._title_display_stop) : $dictionary.menu?._title_display) + " [Ctrl+O]"}
            style={$outputDisplay || disableClick ? "" : "border-bottom: 2px solid var(--secondary);"}
            on:click={toggleOutput}
            class="context #output display {$outputDisplay ? 'on' : 'off'}"
            red={$outputDisplay}
            disabled={(!$outputDisplay && !physicalOutputWindows.length) || disableClick}
        >
            {#if $outputDisplay}
                {#if confirm}
                    <Icon id="close" size={1.6} white />
                {:else}
                    <Icon id="cancelDisplay" size={1.6} white />
                {/if}
            {:else}
                <Icon id="outputs" size={1.6} white />
            {/if}

            {#if $outputDisplay && confirm}
                <div class="click_again" transition:slide>
                    <T id="menu.again_confirm" />
                </div>
            {/if}
        </Button>
    </span>
</div>

<style>
    .top {
        position: relative;
        display: flex;
        justify-content: space-between;
        z-index: 30;
        min-height: 40px;
        height: 40px;

        /* disabled because it's causing unexpected behaviour in Windows 11 */
        /* -webkit-app-region: drag; */
    }
    .top span {
        display: flex;
    }

    .top.drag {
        -webkit-app-region: drag;
    }

    .top.drag :global(button) {
        -webkit-app-region: no-drag;
    }

    /* .dragZone {
        position: absolute;

        display: flex;
        justify-content: space-between;
        background-color: var(--primary-darker);
        width: 100%;
        height: 3px;

        z-index: 2;
        -webkit-app-region: drag;
    } */

    div :global(button.display) {
        display: flex;
        justify-content: center;
        min-width: 60px;
    }

    .unsaved {
        position: absolute;
        inset-inline-start: 0;
        height: 100%;
        width: 5px;
        background-color: rgb(255 0 0 / 0.25);
    }

    /* .logo {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0px 10px;
        width: 100%;
        gap: 10px;
    } */

    @media screen and (max-width: 580px) {
        .top span:first-child {
            display: none;
        }
    }

    .click_again {
        position: absolute;
        bottom: 0;
        inset-inline-end: 0;
        transform: translateY(100%);

        font-size: 1.1em;
        padding: 4px 10px;
        background-color: var(--primary-darker);
        color: var(--text);

        border: 2px solid var(--secondary);
        border-top: none;
        border-inline-end: none;
    }
</style>
