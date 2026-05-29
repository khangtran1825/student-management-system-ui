import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useGetScoresQuery, useGetMyScoresQuery, useCreateScoreMutation, useUpdateScoreMutation, useDeleteScoreMutation, useGetSubjectsQuery, useGetSemestersQuery, useGetMyScheduleQuery, useGetClassScoresForTeacherQuery, useSaveBatchScoresMutation } from '../../store/api/academicApi';
import { useGetStudentsQuery } from '../../store/api/studentApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Trash2, Plus, Pencil, FileSpreadsheet, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : '/api';

const downloadFile = async (url: string, filename: string, token: string | null) => {
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.message || 'Tải file thất bại');
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
};

const orderClasses = (classes: any[]) => [...classes].sort((left, right) => {
  const leftPriority = (left.studentCount ?? 0) > 0 ? 0 : 1;
  const rightPriority = (right.studentCount ?? 0) > 0 ? 0 : 1;
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;
  return String(left.className || '').localeCompare(String(right.className || ''));
});

export const ScoreList = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const { data: myScheduleRes } = useGetMyScheduleQuery(undefined, { skip: !isTeacher });
  const { data: scoresRes, isLoading } = useGetScoresQuery(undefined, { skip: isStudent || isTeacher });
  const { data: myScoresRes, isLoading: isMyScoresLoading } = useGetMyScoresQuery(undefined, { skip: !isStudent });
  const [createScore, { isLoading: isCreating }] = useCreateScoreMutation();
  const [updateScore, { isLoading: isUpdating }] = useUpdateScoreMutation();
  const [deleteScore] = useDeleteScoreMutation();
  const [saveBatchScores, { isLoading: isBatchSaving }] = useSaveBatchScoresMutation();

  const teacherClasses = useMemo(() => {
    const schedules = myScheduleRes?.data || [];
    const map = new Map<number, any>();
    schedules.forEach((schedule: any) => {
      if (schedule.classEntity?.id && !map.has(schedule.classEntity.id)) {
        map.set(schedule.classEntity.id, schedule.classEntity);
      }
    });
    return orderClasses(Array.from(map.values()));
  }, [myScheduleRes?.data]);

  const subjects = useGetSubjectsQuery(undefined).data?.data || [];
  const semesters = useGetSemestersQuery(undefined).data?.data || [];

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  
  // Local state for inline editing
  const [editedScores, setEditedScores] = useState<Record<number, { midtermScore?: string; finalScore?: string }>>({});

  useEffect(() => {
    if (isTeacher && !selectedClassId && teacherClasses.length > 0) {
      setSelectedClassId(String(teacherClasses[0].id));
    }
  }, [isTeacher, selectedClassId, teacherClasses]);

  const { data: classScoresRes, isLoading: isClassScoresLoading } = useGetClassScoresForTeacherQuery(
    { classId: Number(selectedClassId), subjectId: Number(selectedSubjectId), semesterId: Number(selectedSemesterId) },
    { skip: !isTeacher || !selectedClassId || !selectedSubjectId || !selectedSemesterId }
  );

  const { data: studentsRes } = useGetStudentsQuery(
    { page: 0, size: 200, classId: selectedClassId ? Number(selectedClassId) : undefined },
    { skip: !isAdminOrTeacher }
  );
  const students = studentsRes?.data?.content || [];

  const teacherClassScores = classScoresRes?.data || [];

  // Initialize editedScores when classScores data changes without causing infinite loops
  useEffect(() => {
    if (isTeacher && classScoresRes?.data) {
      setEditedScores((prev) => {
        const next: Record<number, any> = {};
        let isChanged = false;
        
        classScoresRes.data.forEach((record: any) => {
          const m = record.midtermScore !== null && record.midtermScore !== undefined ? String(record.midtermScore) : '';
          const f = record.finalScore !== null && record.finalScore !== undefined ? String(record.finalScore) : '';
          next[record.studentId] = { midtermScore: m, finalScore: f };
          
          if (!prev[record.studentId] || prev[record.studentId].midtermScore !== m || prev[record.studentId].finalScore !== f) {
            isChanged = true;
          }
        });
        
        if (Object.keys(prev).length !== Object.keys(next).length) {
          isChanged = true;
        }
        
        return isChanged ? next : prev;
      });
    }
  }, [classScoresRes?.data, isTeacher]);

  const allScores = isStudent ? (myScoresRes?.data || []) : (scoresRes?.data || []);
  const scores = isTeacher ? [] : allScores;

  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ studentId: '', subjectId: '', semesterId: '', midtermScore: '', finalScore: '' });
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setEditId(null);
    setFormData({ studentId: '', subjectId: '', semesterId: '', midtermScore: '', finalScore: '' });
    setFormError('');
    setIsOpen(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      studentId: String(item.studentId || item.student?.id || ''),
      subjectId: String(item.subjectId || item.subject?.id || ''),
      semesterId: String(item.semesterId || item.semester?.id || ''),
      midtermScore: item.midtermScore ?? '',
      finalScore: item.finalScore ?? '',
    });
    setFormError('');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const tid = toast.loading(editId ? 'Đang cập nhật điểm...' : 'Đang lưu điểm...');
    try {
      const payload = {
        studentId: Number(formData.studentId),
        subjectId: Number(formData.subjectId),
        semesterId: Number(formData.semesterId),
        midtermScore: formData.midtermScore !== '' ? Number(formData.midtermScore) : null,
        finalScore: formData.finalScore !== '' ? Number(formData.finalScore) : null,
      };
      if (editId !== null) {
        await updateScore({ id: editId, ...payload }).unwrap();
        toast.success('Cập nhật điểm thành công!', { id: tid });
      } else {
        await createScore(payload).unwrap();
        toast.success('Nhập điểm thành công!', { id: tid });
      }
      setIsOpen(false);
    } catch (err: any) {
      const msg = err?.data?.message || 'Đã xảy ra lỗi.';
      setFormError(msg);
      toast.error(msg, { id: tid });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa điểm này?')) return;
    const tid = toast.loading('Đang xóa...');
    try {
      await deleteScore(id).unwrap();
      toast.success('Xóa điểm thành công!', { id: tid });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Xóa thất bại', { id: tid });
    }
  };

  const handleBatchSave = async () => {
    if (!selectedSubjectId || !selectedSemesterId) {
      toast.error('Vui lòng chọn môn học và học kỳ.');
      return;
    }
    const tid = toast.loading('Đang lưu bảng điểm...');
    try {
      const scoresPayload = Object.keys(editedScores).map(studentId => {
        const edits = editedScores[Number(studentId)];
        return {
          studentId: Number(studentId),
          subjectId: Number(selectedSubjectId),
          semesterId: Number(selectedSemesterId),
          midtermScore: edits.midtermScore !== '' ? Number(edits.midtermScore) : null,
          finalScore: edits.finalScore !== '' ? Number(edits.finalScore) : null,
        };
      });
      await saveBatchScores({
        subjectId: Number(selectedSubjectId),
        semesterId: Number(selectedSemesterId),
        scores: scoresPayload
      }).unwrap();
      toast.success('Lưu điểm thành công!', { id: tid });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Lưu điểm thất bại', { id: tid });
    }
  };

  const exportClassReport = async () => {
    if (!selectedClassId) return;
    const token = localStorage.getItem('token');
    const tid = toast.loading('Đang tải báo cáo lớp...');
    try {
      await downloadFile(`${BASE_URL}/reports/class/${selectedClassId}/grades.xlsx`, `class-grades-${selectedClassId}.xlsx`, token);
      toast.success('Tải báo cáo thành công!', { id: tid });
    } catch (error: any) {
      toast.error(error?.message || 'Tải báo cáo thất bại', { id: tid });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Điểm số</h1>
          {isTeacher && <p className="text-sm text-slate-500 mt-1">Lớp đang học được ưu tiên lên trước, lớp đã đóng nằm sau.</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdminOrTeacher && <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Nhập điểm</Button>}
          {(isTeacher || user?.role === 'ADMIN') && <Button variant="outline" onClick={exportClassReport} disabled={!selectedClassId}><FileSpreadsheet className="w-4 h-4 mr-2" />Xuất báo cáo lớp</Button>}
        </div>
      </div>

      {isTeacher && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Chọn lớp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teacherClasses.map((classItem: any) => (
                <button
                  key={classItem.id}
                  type="button"
                  onClick={() => setSelectedClassId(String(classItem.id))}
                  className={`rounded-xl border p-3 text-left transition ${String(classItem.id) === selectedClassId ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-900">{classItem.className}</div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${classItem.studentCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {classItem.studentCount > 0 ? 'Đang học' : 'Đã đóng'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">{classItem.classCode} · {classItem.major}</div>
                  <div className="text-xs text-slate-400 mt-1">{classItem.studentCount ?? 0} sinh viên</div>
                </button>
              ))}
            </div>
            {teacherClasses.length === 0 && <p className="text-sm text-slate-500">Chưa có lớp nào trong lịch giảng dạy.</p>}
          </CardContent>
        </Card>
      )}

      {isTeacher && selectedClassId && (
        <Card>
          <CardHeader className="pb-2 border-b bg-slate-50">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <CardTitle className="text-base">Bảng điểm lớp</CardTitle>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Label className="font-medium whitespace-nowrap">Môn học:</Label>
                  <select
                    className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm w-40"
                    value={selectedSubjectId}
                    onChange={e => setSelectedSubjectId(e.target.value)}
                  >
                    <option value="">-- Chọn môn --</option>
                    {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="font-medium whitespace-nowrap">Học kỳ:</Label>
                  <select
                    className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm w-40"
                    value={selectedSemesterId}
                    onChange={e => setSelectedSemesterId(e.target.value)}
                  >
                    <option value="">-- Chọn học kỳ --</option>
                    {semesters.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={handleBatchSave} disabled={isBatchSaving || !selectedSubjectId || !selectedSemesterId}>
                  <Save className="w-4 h-4 mr-2" /> Lưu tất cả
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">STT</TableHead>
                  <TableHead>Sinh viên</TableHead>
                  <TableHead>Mã SV</TableHead>
                  <TableHead className="w-24">GK</TableHead>
                  <TableHead className="w-24">CK</TableHead>
                  <TableHead className="w-20 text-center">TB</TableHead>
                  <TableHead className="w-16 text-center">Hệ chữ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!selectedSubjectId || !selectedSemesterId ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">Vui lòng chọn môn học và học kỳ</TableCell></TableRow>
                ) : isClassScoresLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10">Đang tải...</TableCell></TableRow>
                ) : teacherClassScores.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">Lớp chưa có sinh viên</TableCell></TableRow>
                ) : (
                  teacherClassScores.map((record: any, index: number) => (
                    <TableRow key={record.studentId}>
                      <TableCell className="text-center text-slate-500">{index + 1}</TableCell>
                      <TableCell className="font-medium">{record.fullName}</TableCell>
                      <TableCell>{record.studentCode}</TableCell>
                      <TableCell>
                        <Input 
                          type="number" min="0" max="10" step="0.1" 
                          className="h-8 w-20 px-2"
                          value={editedScores[record.studentId]?.midtermScore ?? ''}
                          onChange={(e) => setEditedScores(prev => ({ ...prev, [record.studentId]: { ...prev[record.studentId], midtermScore: e.target.value } }))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" min="0" max="10" step="0.1" 
                          className="h-8 w-20 px-2"
                          value={editedScores[record.studentId]?.finalScore ?? ''}
                          onChange={(e) => setEditedScores(prev => ({ ...prev, [record.studentId]: { ...prev[record.studentId], finalScore: e.target.value } }))}
                        />
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {record.averageScore?.toFixed ? record.averageScore.toFixed(1) : '-'}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {record.grade || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!isTeacher && (
        <Card>
          <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sinh viên</TableHead>
                <TableHead>Môn học</TableHead>
                <TableHead>Học kỳ</TableHead>
                <TableHead>GK</TableHead>
                <TableHead>CK</TableHead>
                <TableHead>TB</TableHead>
                {isAdminOrTeacher && <TableHead className="text-right w-28">Thao tác</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isMyScoresLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10">Đang tải...</TableCell></TableRow>
              ) : scores.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-400">Không có dữ liệu</TableCell></TableRow>
              ) : (
                scores.map((item: any) => (
                  <TableRow key={item.id} className={isTeacher && selectedClassId ? 'bg-blue-50/40' : ''}>
                    <TableCell>{item.student?.fullName || item.studentName}</TableCell>
                    <TableCell>{item.subject?.subjectName || item.subjectName}</TableCell>
                    <TableCell>{item.semester?.name || item.semesterName}</TableCell>
                    <TableCell>{item.midtermScore ?? '-'}</TableCell>
                    <TableCell>{item.finalScore ?? '-'}</TableCell>
                    <TableCell>{item.averageScore?.toFixed ? item.averageScore.toFixed(1) : item.averageScore ?? '-'}</TableCell>
                    {isAdminOrTeacher && (
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50"><Pencil className="w-4 h-4" /></Button>
                        {user?.role === 'ADMIN' && <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? 'Cập nhật điểm' : 'Nhập điểm mới'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {isTeacher && (
              <div className="space-y-1">
                <Label>Lớp</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} required>
                  <option value="">-- Chọn lớp --</option>
                  {teacherClasses.map((classItem: any) => <option key={classItem.id} value={classItem.id}>{classItem.className} {classItem.studentCount > 0 ? '(đang học)' : '(đã đóng)'}</option>)}
                </select>
              </div>
            )}
            {!editId && (
              <div className="space-y-1">
                <Label>Sinh viên</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} required>
                  <option value="">-- Chọn sinh viên --</option>
                  {students.map((student: any) => <option key={student.id} value={student.id}>{student.studentCode} - {student.fullName}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-1">
              <Label>Môn học</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.subjectId} onChange={e => setFormData({ ...formData, subjectId: e.target.value })} required>
                <option value="">-- Chọn môn --</option>
                {subjects.map((subject: any) => <option key={subject.id} value={subject.id}>{subject.subjectName}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Học kỳ</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.semesterId} onChange={e => setFormData({ ...formData, semesterId: e.target.value })} required>
                <option value="">-- Chọn học kỳ --</option>
                {semesters.map((semester: any) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Điểm GK</Label><Input type="number" min="0" max="10" step="0.1" value={formData.midtermScore} onChange={e => setFormData({ ...formData, midtermScore: e.target.value })} /></div>
              <div className="space-y-1"><Label>Điểm CK</Label><Input type="number" min="0" max="10" step="0.1" value={formData.finalScore} onChange={e => setFormData({ ...formData, finalScore: e.target.value })} /></div>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isCreating || isUpdating}>{editId ? 'Cập nhật' : 'Lưu điểm'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
