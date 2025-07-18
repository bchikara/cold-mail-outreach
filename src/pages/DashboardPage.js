import React, { useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useTemplateStore } from '../stores/templateStore';
import { Users, Send, Mail, Clock } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { StatCard } from '../components/shared/StatCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const { contacts, history, scheduledEmails } = useDataStore();
  const { emailTemplates } = useTemplateStore();

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString();
    }).reverse();

    const counts = last7Days.reduce((acc, date) => {
        acc[date] = 0;
        return acc;
    }, {});

    history.forEach(h => {
        const sentDate = new Date(h.sentAt.seconds * 1000).toLocaleDateString();
        if (counts[sentDate] !== undefined) {
            counts[sentDate]++;
        }
    });

    return {
        labels: last7Days,
        datasets: [{
            label: 'Emails Sent',
            data: Object.values(counts),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.1,
        }]
    };
  }, [history]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Contacts" value={contacts.length} icon={<Users size={28} className="text-blue-400"/>} />
        <StatCard title="Emails Sent (All Time)" value={history.length} icon={<Send size={28} className="text-green-400"/>} />
        <StatCard title="Scheduled" value={scheduledEmails.length} icon={<Clock size={28} className="text-yellow-400"/>} />
        <StatCard title="Templates Available" value={emailTemplates.length} icon={<Mail size={28} className="text-purple-400"/>} />
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Activity (Last 7 Days)</h2>
        <div className="h-72">
            <Line data={chartData} options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                        callback: function (value) {
                          return value;
                        }
                      }
                    },
                    x: {
                      ticks: {
                        autoSkip: true,
                        maxTicksLimit: 7 
                      }
                    }
                  }
             }} />
        </div>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming Scheduled Emails</h2>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {scheduledEmails.length > 0 ? (
              scheduledEmails.slice(0,10).map(email => (
                <div key={email.id} className="p-3 bg-gray-700/50 rounded-md">
                  <p className="font-semibold text-white">{email.to}</p>
                  <p className="text-sm text-gray-400">
                    Scheduled for: {new Date(email.sendAt.seconds * 1000).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center pt-10">No emails scheduled.</p>
            )}
          </div>
        </div>
    </div>
  );
}
