import { config } from "@/configs/wagmiClient.js"
import { noop } from "lodash-es"
import { getClient } from "wagmi/actions"

export function createEIP1193Provider() {
    return {
        async request<T>(parameters: unknown): Promise<T> {
            const client = await getClient(config)
            if (!client) throw new Error("Client not found")

            return client.request(parameters as Parameters<typeof client.request>[0]) 
        },
        on: noop,
        removeListener: noop,
    }
}
