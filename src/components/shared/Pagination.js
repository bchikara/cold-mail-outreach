import { CustomButton } from './CustomButton';

export function Pagination({ onNext, onPrev, hasNext, hasPrev }) {
    return (
        <div className="flex justify-end items-center gap-2 mt-4 p-4">
            <CustomButton
                onClick={onPrev}
                disabled={!hasPrev}
                className={`${!hasPrev ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500'}`}
            >
                Previous
            </CustomButton>

            <CustomButton
                onClick={onNext}
                disabled={!hasNext}
                className={`${!hasNext ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500'}`}
            >
                Next
            </CustomButton>
        </div>
    );
}