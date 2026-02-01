// Helper Component for Subject Tags
import { SUBJECTS_LIST } from '@/lib/constants';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';

export default function SubjectInput({ initialValue, onChange }: { initialValue: string, onChange: (val: string) => void }) {
    const [tags, setTags] = useState<string[]>(initialValue ? initialValue.split(',').map(s => s.trim()) : []);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const updateTags = (newTags: string[]) => {
        setTags(newTags);
        onChange(newTags.join(', '));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        if (val.length > 0) {
            const filtered = SUBJECTS_LIST.filter(s =>
                s.toLowerCase().includes(val.toLowerCase()) && !tags.includes(s)
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const addTag = (tag: string) => {
        if (!tags.includes(tag)) {
            updateTags([...tags, tag]);
        }
        setInputValue('');
        setSuggestions([]);
    };

    const removeTag = (tag: string) => {
        updateTags(tags.filter(t => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                addTag(inputValue.trim());
            }
        }
    };

    return (
        <div className="relative space-y-3">
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-50 text-brand-700 border border-brand-100">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-brand-900">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
            </div>

            <div className="relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type subject (e.g. Maths)..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
                <button
                    type="button"
                    onClick={() => inputValue.trim() && addTag(inputValue.trim())}
                    className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-brand-600"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1">
                    {suggestions.map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => addTag(s)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
