import { useState, useEffect, useRef } from 'react'

interface SaveAgentModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (filename: string) => void
}

export default function SaveAgentModal({ isOpen, onClose, onSave }: SaveAgentModalProps) {
    const [filename, setFilename] = useState('my-agent')
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setFilename('my-agent')
            // Focus input after a short delay to ensure modal is rendered
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    const handleSave = () => {
        if (filename.trim()) {
            onSave(filename.trim())
            onClose()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-2 border-[#4a4a4a] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b-2 border-[#4a4a4a] flex items-center justify-between bg-gradient-to-r from-[#3a3a3a] to-[#2a2a2a]">
                    <div className="flex items-center gap-2">
                        <span>💾</span>
                        <h2 className="text-sm font-bold text-amber-100 uppercase tracking-wider">Save Agent</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-amber-100/60 hover:text-amber-100 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-amber-100 uppercase tracking-wider mb-2">
                            Filename
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="my-agent"
                                className="flex-1 px-3 py-2 bg-[#0a0a0a] border-2 border-[#3a3a3a] rounded
                           text-amber-100 placeholder-amber-100/30 text-sm
                           focus:outline-none focus:border-amber-600"
                            />
                            <span className="text-amber-100/40 text-sm">.md</span>
                        </div>
                        <p className="mt-2 text-[10px] text-amber-100/40">
                            Your agent will be saved to ~/.claude/agents/
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t-2 border-[#4a4a4a] flex justify-end gap-2 bg-[#1a1a1a]">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-amber-100/60 hover:text-amber-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!filename.trim()}
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-600 border border-amber-500 text-amber-100 text-sm font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
