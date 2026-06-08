import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getExams, createExam, updateExam, deleteExam } from '../../api/examsApi';
import type { Exam, ExamType } from '../../types/exam';
import { generateId } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

export default function ManageExams() {
  const { data: exams, loading, refetch } = useApi(() => getExams(), []);
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'mcq' as ExamType,
    totalMarks: 100,
    isActive: true,
  });

  const openCreate = () => {
    setEditExam(null);
    setForm({ title: '', description: '', type: 'mcq', totalMarks: 100, isActive: true });
    setShowModal(true);
  };

  const openEdit = (exam: Exam) => {
    setEditExam(exam);
    setForm({
      title: exam.title,
      description: exam.description,
      type: exam.type,
      totalMarks: exam.totalMarks,
      isActive: exam.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editExam) {
        await updateExam(editExam.id, form);
      } else {
        await createExam({ id: generateId(), ...form });
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save exam');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam?')) return;
    await deleteExam(id);
    refetch();
  };

  const toggleActive = async (exam: Exam) => {
    await updateExam(exam.id, { isActive: !exam.isActive });
    refetch();
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Exams</h1>
        <Button onClick={openCreate}>Create Exam</Button>
      </div>

      <div className="space-y-4">
        {exams?.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-800">{exam.title}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  exam.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {exam.type === 'mcq' ? 'MCQ' : 'Short Answer'}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  exam.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {exam.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-500">{exam.description || 'No description'}</p>
              <p className="text-sm text-gray-500 mt-1">Total Marks: {exam.totalMarks}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => toggleActive(exam)} className="text-sm text-primary hover:underline">
                {exam.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => openEdit(exam)} className="text-sm text-amber-600 hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(exam.id)} className="text-sm text-red-500 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
        {(!exams || exams.length === 0) && (
          <p className="text-gray-500 text-center py-8">No exams created yet.</p>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editExam ? 'Edit Exam' : 'Create Exam'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ExamType })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              >
                <option value="mcq">MCQ</option>
                <option value="short_answer">Short Answer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
              <input
                type="number"
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
                min={1}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">{editExam ? 'Update' : 'Create'} Exam</Button>
        </form>
      </Modal>
    </div>
  );
}
