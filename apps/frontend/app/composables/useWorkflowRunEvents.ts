import { io, type Socket } from "socket.io-client";
import type { WorkflowStepEvent } from '../types/workflow'

export function useWorkflowRunEvents() {
  const config = useRuntimeConfig()
  const events = ref<WorkflowStepEvent[]>([])
  const isConnected = ref(false)
  const errorMessage = ref<string | null>(null)
  const activeRunId = ref<string | null>(null)
  let socket: Socket | null = null

  function attachListeners(instance: Socket) {
    instance.on('connect', () => {
      isConnected.value = true
      errorMessage.value = null

      if (activeRunId.value) {
        instance.emit('workflow-run:subscribe', activeRunId.value)
      }
    })

    instance.on('disconnect', () => {
      isConnected.value = false
    })

    instance.on('connect_error', (error) => {
      errorMessage.value = error.message
    })

    instance.on('step_started', (event: WorkflowStepEvent) => {
      events.value.push(event)
    })

    instance.on('step_completed', (event: WorkflowStepEvent) => {
      events.value.push(event)
    })

    instance.on('step_failed', (event: WorkflowStepEvent) => {
      events.value.push(event)
    })
  }

  function connect(runId: string, token: string) {
    disconnect()
    events.value = []
    activeRunId.value = runId

    socket = io(config.public.apiBase, {
      transports: ['websocket'],
      auth: {
        token,
      },
    })

    attachListeners(socket)
  }

  function disconnect() {
    if (socket && activeRunId.value) {
      socket.emit('workflow-run:unsubscribe', activeRunId.value)
    }

    socket?.close()
    socket = null
    isConnected.value = false
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    events,
    isConnected,
    errorMessage,
  }
}
