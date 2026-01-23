import { useBuildStore } from '../stores/buildStore'
import { generateSummary } from '../utils/markdownGenerator'

export default function PreviewPanel() {
  const {
    previewOpen,
    setPreviewOpen,
    generatedMarkdown,
    equippedSlots,
    exportToClipboard
  } = useBuildStore()

  const equippedItems = Object.values(equippedSlots).filter(Boolean) as NonNullable<typeof equippedSlots[keyof typeof equippedSlots]>[]
  const summary = generateSummary(equippedItems)

  return (
    <div className={`
      border-t-2 border-[#4a4a4a] bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]
      transition-all duration-300 ease-in-out
      ${previewOpen ? 'h-64' : 'h-9'}
    `}>
      {/* Toggle Header */}
      <button
        onClick={() => setPreviewOpen(!previewOpen)}
        className="w-full h-9 px-4 flex items-center justify-between hover:bg-[#2a2a2a] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`text-amber-100/60 transition-transform ${previewOpen ? 'rotate-90' : ''}`}>▶</span>
          <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">Preview</span>
          <span className="text-[10px] text-amber-100/40">{summary}</span>
        </div>

        {previewOpen && equippedItems.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              exportToClipboard()
            }}
            className="text-[10px] px-2 py-0.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#4a4a4a] rounded text-amber-100 transition-colors"
          >
            📋 Copy
          </button>
        )}
      </button>

      {/* Preview Content */}
      {previewOpen && (
        <div className="h-[calc(100%-36px)] overflow-auto p-4 bg-[#0a0a0a] m-2 mt-0 rounded border border-[#3a3a3a]">
          {generatedMarkdown ? (
            <pre className="text-[11px] text-amber-100/80 font-mono whitespace-pre-wrap leading-relaxed">
              {generatedMarkdown}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-full text-amber-100/40 text-sm">
              Equip items to see generated agents.md
            </div>
          )}
        </div>
      )}
    </div>
  )
}
