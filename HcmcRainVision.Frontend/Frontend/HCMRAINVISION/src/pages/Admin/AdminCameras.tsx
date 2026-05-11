/**
 * Admin – camera CRUD (list, add, edit, delete).
 */
import { useState, useEffect } from 'react';
import * as cameraApi from '../../services/cameraApi';
import { createCamera, updateCamera, deleteCamera } from '../../services/adminApi';
import { validate } from '../../lib/validation';
import * as locationApi from '../../services/locationApi';
import type { CameraInfo } from '../../types';
import type { CreateCameraRequest, UpdateCameraRequest, WardDto } from '../../types/api';
import { getApiErrorMessage } from './adminShared';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminErrorMessage from './AdminErrorMessage';

export default function AdminCameras() {
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [wards, setWards] = useState<WardDto[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [formDistrict, setFormDistrict] = useState<string>('');
  const [formWards, setFormWards] = useState<WardDto[]>([]);
  const [editFormDistrict, setEditFormDistrict] = useState<string>('');
  const [editFormWards, setEditFormWards] = useState<WardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateCameraRequest>({
    Id: '',
    Name: '',
    Latitude: 10.77,
    Longitude: 106.7,
    WardId: '',
    StreamUrl: '',
  });
  const [editForm, setEditForm] = useState<UpdateCameraRequest | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = () => {
    setError(null);
    Promise.all([cameraApi.getCameras(), locationApi.getWards(), locationApi.getDistricts()])
      .then(([raw, w, dist]) => {
        const wardMap = locationApi.buildWardMap(w);
        setCameras(raw.map((c) => cameraApi.mapCameraToInfo(c, wardMap))); setWards(w); setDistricts(Array.isArray(dist) ? dist : []);
      })
      .catch((e) => setError(getApiErrorMessage(e, 'Tải danh sách thất bại')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, []);

  const openAdd = () => {
    setForm({ Id: '', Name: '', Latitude: 10.77, Longitude: 106.7, WardId: '', StreamUrl: '' });
    setFormDistrict(''); setFormWards(wards); setModal('add');
  };

  const openEdit = (c: CameraInfo) => {
    setEditingId(c.id);
    const ward = wards.find((w) => w.WardName === c.ward);
    setEditForm({
      Name: c.name,
      Latitude: c.lat,
      Longitude: c.lng,
      WardId: ward?.WardId ?? '',
      Status: undefined,
      StreamUrl: '',
    });
    setEditFormDistrict(c.district); if (c.district) { locationApi.getWardsByDistrict(c.district).then(setEditFormWards).catch(() => setEditFormWards(wards)); } else { setEditFormWards(wards); } setModal('edit');
  };

  const handleCreate = () => {
    const payload = { ...form, WardId: form.WardId || undefined };
    const result = validate('createCamera', payload);
    if (!result.valid) {
      setError(result.firstMessage ?? 'Dữ liệu không hợp lệ');
      return;
    }
    setError(null);
    setSubmitLoading(true);
    createCamera(result.data as CreateCameraRequest)
      .then(() => {
        setModal(null);
        load();
      })
      .catch((e) => setError(getApiErrorMessage(e, 'Tạo camera thất bại')))
      .finally(() => setSubmitLoading(false));
  };

  const handleUpdate = () => {
    if (!editingId || !editForm) return;
    const payload = { ...editForm, WardId: editForm.WardId || undefined };
    const result = validate('updateCamera', payload);
    if (!result.valid) {
      setError(result.firstMessage ?? 'Dữ liệu không hợp lệ');
      return;
    }
    setError(null);
    setSubmitLoading(true);
    updateCamera(editingId, result.data as UpdateCameraRequest)
      .then(() => {
        setModal(null);
        setEditingId(null);
        load();
      })
      .catch((e) => setError(getApiErrorMessage(e, 'Cập nhật thất bại')))
      .finally(() => setSubmitLoading(false));
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    deleteCamera(id)
      .then(() => {
        setDeleteConfirm(null);
        load();
      })
      .catch((e) => setError(getApiErrorMessage(e, 'Xóa thất bại')));
  };

  if (loading) return <AdminLoadingBlock />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Quản lý camera</h2>
        <button type="button" onClick={openAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 font-medium">
          Thêm camera
        </button>
      </div>
      {error && <AdminErrorMessage message={error} />}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ward / District</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(cameras ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{c.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.ward}, {c.district}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button type="button" onClick={() => openEdit(c)} className="text-blue-600 hover:underline text-sm focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded">Sửa</button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:underline text-sm focus:ring-2 focus:ring-red-400 focus:ring-offset-1 rounded"
                    >
                      {deleteConfirm === c.id ? 'Xác nhận xóa?' : 'Xóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'add' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Thêm camera</h3>
            <input placeholder="Id" value={form.Id} onChange={(e) => setForm((f) => ({ ...f, Id: e.target.value }))} className="w-full border rounded px-3 py-2" />
            <input placeholder="Name" value={form.Name} onChange={(e) => setForm((f) => ({ ...f, Name: e.target.value }))} className="w-full border rounded px-3 py-2" />
            <input type="number" step="any" placeholder="Latitude" value={form.Latitude} onChange={(e) => setForm((f) => ({ ...f, Latitude: Number(e.target.value) }))} className="w-full border rounded px-3 py-2" />
            

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qu?n</label>
              <select value={formDistrict} onChange={(e) => { const d = e.target.value; setFormDistrict(d); setForm((f) => ({ ...f, WardId: '' })); if (d) locationApi.getWardsByDistrict(d).then(setFormWards).catch(() => setFormWards(wards)); else setFormWards(wards); }} className="w-full border rounded px-3 py-2">
                <option value="">T?t c? qu?n</option>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <select value={form.WardId ?? ''} onChange={(e) => setForm((f) => ({ ...f, WardId: e.target.value }))} className="w-full border rounded px-3 py-2">
              <option value="">Chọn phường</option>
              {(formDistrict ? formWards : wards)?.map((w) => <option key={w.WardId} value={w.WardId}>{w.WardName}</option>) ?? []}
            </select>
            <input placeholder="Stream URL" value={form.StreamUrl} onChange={(e) => setForm((f) => ({ ...f, StreamUrl: e.target.value }))} className="w-full border rounded px-3 py-2" />
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 border rounded">Hủy</button>
              <button type="button" onClick={handleCreate} disabled={submitLoading} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'edit' && editForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Sửa camera</h3>
            <input placeholder="Name" value={editForm.Name} onChange={(e) => setEditForm((f) => f ? { ...f, Name: e.target.value } : null)} className="w-full border rounded px-3 py-2" />
            <input type="number" step="any" value={editForm.Latitude} onChange={(e) => setEditForm((f) => f ? { ...f, Latitude: Number(e.target.value) } : null)} className="w-full border rounded px-3 py-2" />
            <input type="number" step="any" value={editForm.Longitude} onChange={(e) => setEditForm((f) => f ? { ...f, Longitude: Number(e.target.value) } : null)} className="w-full border rounded px-3 py-2" />
            <select value={editForm.WardId ?? ''} onChange={(e) => setEditForm((f) => f ? { ...f, WardId: e.target.value || undefined } : null)} className="w-full border rounded px-3 py-2">
              <option value="">Chọn phường</option>
              {(editFormDistrict ? editFormWards : wards)?.map((w) => <option key={w.WardId} value={w.WardId}>{w.WardName}</option>) ?? []}
            </select>
            <input placeholder="Stream URL (tùy chọn)" value={editForm.StreamUrl ?? ''} onChange={(e) => setEditForm((f) => f ? { ...f, StreamUrl: e.target.value || undefined } : null)} className="w-full border rounded px-3 py-2" />
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" onClick={() => { setModal(null); setEditingId(null); }} className="px-4 py-2 border rounded">Hủy</button>
              <button type="button" onClick={handleUpdate} disabled={submitLoading} className="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
