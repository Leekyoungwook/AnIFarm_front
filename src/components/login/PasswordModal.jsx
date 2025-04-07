import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUpdateAuthData } from '../../redux/slices/authslice';
import Swal from 'sweetalert2';

const PasswordModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: '새 비밀번호가 일치하지 않습니다.'
      });
      return;
    }

    try {
      const result = await dispatch(fetchUpdateAuthData({
        current_password: passwords.current,
        new_password: passwords.new
      })).unwrap();

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '성공',
          text: '비밀번호가 성공적으로 변경되었습니다.'
        });
        onClose();
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '오류',
        text: error.message || '비밀번호 변경에 실패했습니다.'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-xl font-bold mb-4">비밀번호 변경</h3>
        <form onSubmit={handleSubmit} className="space-y-4 border border-gray-400 rounded-lg p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">현재 비밀번호</label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-[#3a9d1f] focus:ring-[#3a9d1f]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-[#3a9d1f] focus:ring-[#3a9d1f]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-[#3a9d1f] focus:ring-[#3a9d1f]"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#3a9d1f] text-white rounded-lg hover:bg-[#0aab65]"
            >
              변경
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal; 