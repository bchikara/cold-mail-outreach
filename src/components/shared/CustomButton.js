export function CustomButton({ onClick, children, className = 'bg-blue-600 hover:bg-blue-700', disabled, ...props }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors duration-200 flex items-center justify-center gap-2 ${className} ${disabled ? 'bg-gray-500 cursor-not-allowed' : ''}`}
            {...props}
        >
            {children}
        </button>
    );
}