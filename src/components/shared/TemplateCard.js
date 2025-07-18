export function TemplateCard({ template, isSelected, onSelect }) {
    return (
        <div 
            onClick={() => onSelect(template)}
            className={`bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all ${isSelected ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'}`}
        >
            <h3 className="text-lg font-semibold text-white mb-3">{template.name}</h3>
            <div className="p-3 bg-gray-900/70 rounded-md h-48 overflow-y-auto text-xs text-gray-400 scale-90 origin-top-left">
                <div dangerouslySetInnerHTML={{ __html: template.body.replace(/\[.*?\]/g, '...') }} />
            </div>
        </div>
    );
}