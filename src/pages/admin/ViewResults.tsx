import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { useApi } from '../../hooks/useApi';
import { getResults } from '../../api/resultsApi';
import { formatDate, calculatePercentage } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

export default function ViewResults() {
  const { data: results, loading } = useApi(() => getResults(), []);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#f9fafb',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `results_report_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">All Results</h1>
        <Button onClick={handleDownload} variant="secondary">
          Download Report
        </Button>
      </div>

      <div ref={reportRef} className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-bold text-primary">Study Hub Hasilpur - Results Report</h2>
          <p className="text-sm text-gray-500">Generated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Exam</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">%</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {results?.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.studentName}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.studentId}</td>
                  <td className="px-4 py-3 text-gray-500">{r.studentPhone}</td>
                  <td className="px-4 py-3">{r.examTitle}</td>
                  <td className="px-4 py-3">{r.type === 'mcq' ? 'MCQ' : 'Short'}</td>
                  <td className="px-4 py-3 font-bold">{r.score}/{r.total}</td>
                  <td className="px-4 py-3">{calculatePercentage(r.score, r.total)}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(r.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!results || results.length === 0) && (
          <p className="text-center text-gray-500 py-8">No results available.</p>
        )}
      </div>
    </div>
  );
}
