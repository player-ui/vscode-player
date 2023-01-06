import { window, extensions, ExtensionContext, workspace } from "vscode";
import type { TSManifest } from "@player-tools/xlr";

const TYPESCRIPT_EXTENSION_NAME = "vscode.typescript-language-features";
const TYPESCRIPT_EXPR_PLUGIN = "@player-tools/typescript-expression-plugin";
const CONFIG_SECTION = "player";
const log = window.createOutputChannel("Player");

type TypescriptAPI = {
  configurePlugin(pluginId: string, configuration: any): void;
};

/**
 * get typescript api from build-in extension
 * https://github.com/microsoft/vscode/blob/master/extensions/typescript-language-features/src/api.ts
 */
async function getTypescriptAPI(): Promise<TypescriptAPI> {
  const extension = extensions.getExtension(TYPESCRIPT_EXTENSION_NAME);
  const err = new Error(
    "Cannot get typescript APIs. try restart Visual Studio Code."
  );

  if (!extension) {
    throw err;
  }

  await extension.activate();

  if (!extension.exports || !extension.exports.getAPI) {
    throw err;
  }

  const api = extension.exports.getAPI(0);

  if (!api) {
    throw err;
  }

  return api;
}

/** Connect to the TS language plugin and forward the config over */
async function updatePluginWithConfig(config: {
  /** The manifest entries for the plugins */
  plugins: Array<TSManifest>;
}) {
  const api = await getTypescriptAPI();
  api.configurePlugin(TYPESCRIPT_EXPR_PLUGIN, config);
  log.appendLine("Plugin config updated");
  log.appendLine(JSON.stringify(config));
}

/** Dynamically fetch all of the plugins from the given locations */
async function populatePlugins(plugins: string[]) {
  const populatedPlugins = plugins.map(async (plugin) => {
    const mod = await import(plugin);
    return mod.default ?? mod;
  });

  return Promise.all(populatedPlugins);
}

/** Grab the latest config from vscode and send it to the ts-plugin */
async function updateConfig() {
  const config = workspace.getConfiguration(CONFIG_SECTION);
  const plugins = config.get<string[]>("plugins") ?? [];

  try {
    await updatePluginWithConfig({
      plugins: await populatePlugins(plugins),
    });
  } catch (e: any) {
    log.appendLine(`Error: ${e.message}`);
  }
}

/** entry point for vscode */
export async function activate(context: ExtensionContext) {
  log.appendLine("Activating...");
  updateConfig();

  context.subscriptions.push(
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(CONFIG_SECTION)) {
        log.appendLine("Configuration changed");
        updateConfig();
      }
    })
  );
}
