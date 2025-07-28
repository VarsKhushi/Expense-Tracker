import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Upload, User, Mail, Calendar as CalendarIcon, UserCircle, UserCheck, UserCog, UserPlus, UserSquare2, UserX } from 'lucide-react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProfileEditor = ({ isOpen, onClose, onUpdate }) => {
  const { user, updateUser } = useAuth();
  const defaultAvatars = [
    { id: 'default1', icon: <UserCircle size={40} className="text-blue-500" />, value: 'default1' },
    { id: 'default2', icon: <UserCheck size={40} className="text-green-500" />, value: 'default2' },
    { id: 'default3', icon: <UserCog size={40} className="text-purple-500" />, value: 'default3' },
    { id: 'default4', icon: <UserPlus size={40} className="text-yellow-500" />, value: 'default4' },
    { id: 'default5', icon: <UserSquare2 size={40} className="text-red-500" />, value: 'default5' },
    { id: 'default6', icon: <UserX size={40} className="text-pink-500" />, value: 'default6' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    avatar: null,
    avatarPreview: '',
    selectedAvatar: ''
  });
  
  const [showAvatarOptions, setShowAvatarOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        avatarPreview: user.avatar || '',
        selectedAvatar: user.avatarType || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: file,
          avatarPreview: reader.result,
          selectedAvatar: ''
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const selectDefaultAvatar = (avatarValue) => {
    setFormData(prev => ({
      ...prev,
      avatar: null,
      avatarPreview: '',
      selectedAvatar: avatarValue
    }));
    setShowAvatarOptions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      
      if (formData.dateOfBirth) {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      }
      
      // If a new avatar file is selected, append it
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }
      
      // If a default avatar is selected, append the avatarType
      if (formData.selectedAvatar) {
        formDataToSend.append('avatarType', formData.selectedAvatar);
      }
      
      console.log('Sending form data:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }
      
      const response = await authAPI.updateProfile(formDataToSend);
      console.log('Profile update response:', response);
      
      // Call the onUpdate prop with the updated user data
      if (response.data && response.data.user) {
        if (typeof onUpdate === 'function') {
          onUpdate(response.data.user);
        }
        
        // Also update the auth context if updateUser is available
        if (updateUser) {
          updateUser(response.data.user);
        }
      }
      
      toast.success('Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex flex-col items-center">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
                  {formData.avatarPreview ? (
                    <img 
                      src={formData.avatarPreview} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : formData.selectedAvatar ? (
                    <div className="text-4xl">
                      {defaultAvatars.find(a => a.value === formData.selectedAvatar)?.icon || 
                       <UserCircle size={40} className="text-blue-500" />}
                    </div>
                  ) : (
                    <User size={40} className="text-gray-400" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowAvatarOptions(!showAvatarOptions)}
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
                    title="Choose avatar"
                  >
                    <UserCheck size={16} className="text-primary-600" />
                  </button>
                  <label 
                    htmlFor="avatar-upload"
                    className="bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50"
                    title="Upload photo"
                  >
                    <Upload size={16} className="text-primary-600" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>
              
              {showAvatarOptions && (
                <div className="mt-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Choose an avatar</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {defaultAvatars.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => selectDefaultAvatar(avatar.value)}
                        className={`p-2 rounded-full flex items-center justify-center ${
                          formData.selectedAvatar === avatar.value 
                            ? 'ring-2 ring-primary-500 bg-primary-50' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {avatar.icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <span className="text-sm text-gray-500 mt-2">
                {formData.avatar ? 'Custom photo selected' : 
                 formData.selectedAvatar ? 'Default avatar selected' : 
                 'Upload a photo or choose an avatar'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;
