import type { DebuggerMessages } from '@masknet/plugin-debugger/messages';
import type { PluginMessageEmitter } from '@masknet/plugin-infra';

export let PluginDebuggerMessages: PluginMessageEmitter<DebuggerMessages> | undefined;

export function setPluginDebuggerMessages(messages: PluginMessageEmitter<DebuggerMessages>) {
    PluginDebuggerMessages = messages;
}
