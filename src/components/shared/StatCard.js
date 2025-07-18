export function StatCard({ title, value, icon }) {
    return (
         <div className="bg-gray-800 p-6 rounded-lg flex items-center gap-4">
            {icon}
            <div>
                <h3 className="text-sm font-medium text-gray-400">{title}</h3>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    )
}