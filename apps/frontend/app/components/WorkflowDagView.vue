<script setup lang="ts">
import BaseBadge from '../../../../packages/ui/components/base/badge/index.vue'

defineProps<{
  dagLayout: {
    width: number
    height: number
    nodes: Array<{ id: string, type: string, dependsOn: string[], x: number, y: number, width: number, height: number }>
    edges: Array<{ id: string, x1: number, y1: number, x2: number, y2: number }>
  }
  stepCount: number
  markerId?: string
  getStatusBadge: (status: string) => { variantText: string, variantBGColor: string }
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-lg font-semibold">Visual DAG</h3>
      <BaseBadge rounded="full" text-size="xs" v-bind="getStatusBadge('pending')">
        {{ stepCount }} steps
      </BaseBadge>
    </div>

    <div class="overflow-x-auto rounded-[28px] border border-slate-200 bg-white p-4">
      <div
        class="relative min-w-full rounded-[24px] bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.16),_transparent_55%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]"
        :style="{ width: `${Math.max(dagLayout.width, 720)}px`, height: `${Math.max(dagLayout.height, 220)}px` }"
      >
        <svg
          class="absolute inset-0 h-full w-full"
          :viewBox="`0 0 ${Math.max(dagLayout.width, 720)} ${Math.max(dagLayout.height, 220)}`"
          fill="none"
        >
          <defs>
            <marker :id="markerId || 'dag-arrow'" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L10,5 L0,10 z" fill="#64748b" />
            </marker>
          </defs>

          <path
            v-for="edge in dagLayout.edges"
            :key="edge.id"
            :d="`M ${edge.x1} ${edge.y1} C ${edge.x1 + 48} ${edge.y1}, ${edge.x2 - 48} ${edge.y2}, ${edge.x2} ${edge.y2}`"
            stroke="#64748b"
            stroke-width="2.5"
            stroke-linecap="round"
            :marker-end="`url(#${markerId || 'dag-arrow'})`"
          />
        </svg>

        <div
          v-for="node in dagLayout.nodes"
          :key="node.id"
          class="absolute rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur"
          :style="{ left: `${node.x}px`, top: `${node.y}px`, width: `${node.width}px`, height: `${node.height}px` }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-semibold text-slate-900">{{ node.id }}</p>
              <p class="text-xs uppercase tracking-[0.16em] text-slate-500">{{ node.type }}</p>
            </div>
            <span class="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
              {{ node.dependsOn.length ? `${node.dependsOn.length} deps` : 'root' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
