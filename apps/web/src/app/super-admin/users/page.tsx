"use client";

import { useEffect, useState } from "react";
import { getUsers, createUserAction, toggleUserStatus } from "./actions";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "TENANT" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    const res = await getUsers();
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("role", formData.role);

    const res = await createUserAction(data);
    if (res.success) {
      setMessage({ type: "success", text: res.message || "" });
      setFormData({ name: "", email: "", password: "", role: "TENANT" });
      setShowModal(false);
      fetchUsers();
    } else {
      setMessage({ type: "error", text: res.error || "Hata oluştu." });
    }
    setIsSubmitting(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleUserStatus(id, currentStatus);
    fetchUsers();
  };

  if (isLoading) return <div className="p-8">Kullanıcılar Yükleniyor...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kullanıcı Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Sistemdeki tüm kullanıcıları ve yetkilerini yönetin.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90"
        >
          + Yeni Kullanıcı
        </button>
      </div>

      {message && !showModal && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-[#0D1B32] shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-[#081326]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#0D1B32] divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleToggleStatus(user.id, user.isActive)} className="text-primary hover:underline">
                    {user.isActive ? "Askıya Al" : "Aktifleştir"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#0D1B32] w-full max-w-md p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Yeni Kullanıcı Ekle</h2>
            {message && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{message.text}</div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">İsim Soyisim</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2 dark:bg-[#081326] dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">E-Posta</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border rounded p-2 dark:bg-[#081326] dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Şifre</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded p-2 dark:bg-[#081326] dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Rol</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full border rounded p-2 dark:bg-[#081326] dark:border-gray-700">
                  <option value="SUPER_ADMIN">Süper Admin</option>
                  <option value="SUB_ADMIN">Yardımcı Admin</option>
                  <option value="MARKETING">Pazarlama</option>
                  <option value="TENANT">Salon Sahibi (Tenant)</option>
                  <option value="STAFF">Personel</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">İptal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90">
                  {isSubmitting ? "Oluşturuluyor..." : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
