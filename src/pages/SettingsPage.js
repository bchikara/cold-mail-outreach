import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useTemplateStore } from '../stores/templateStore';
import { useDataStore } from '../stores/dataStore';
import { db, storage, appId } from '../lib/firebaseConfig';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User, Briefcase, Code, Globe, FileText, Upload, Loader2, Eye, Linkedin, Github, Twitter, Mail, Trophy, Plus, Minus, Phone } from 'lucide-react';
import {TemplateCard} from '../components/shared/TemplateCard';
import {CustomButton} from '../components/shared/CustomButton';

export default function SettingsPage() {
  const { userId } = useAuthStore();
  const { openModal, notifySuccess, notifyError, isUploading, setUploading } = useAppStore();
  const { emailTemplates, selectedTemplate, setSelectedTemplate } = useTemplateStore();
  const { profile: storedProfile, resumeFile } = useDataStore();

  const [profile, setProfile] = useState(storedProfile || {});
  const [initialProfile, setInitialProfile] = useState(storedProfile || {});
  const profilePicInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    const achievements = storedProfile?.achievements && Array.isArray(storedProfile.achievements) && storedProfile.achievements?.length > 0 ? storedProfile.achievements : [''];
    const initial = { ...storedProfile, achievements } || { name: '', email: '', phone: '', profession: '', skills: '', website: '', experience: '', linkedin: '', github: '', twitter: '', photoURL: '', achievements: [''] };
    setProfile(initial);
    setInitialProfile(initial);
  }, [storedProfile]);

  const handleProfileSave = async () => {
    if (!userId) return;
    const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/main`);
    try {
      const { achievements, ...profileToSave } = profile;
      await setDoc(profileRef, profileToSave, { merge: true });
      notifySuccess("Profile saved successfully!");
      setInitialProfile(prev => ({...prev, ...profileToSave}));
    } catch (error) {
      notifyError("Failed to save profile.");
    }
  };

  const handleAchievementsSave = async () => {
    if (!userId) return;
    const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/main`);
    try {
        const achievementsToSave = profile.achievements.filter(ach => ach.trim() !== '');
        await updateDoc(profileRef, { achievements: achievementsToSave });
        notifySuccess("Achievements saved successfully!");
        setInitialProfile(profile);
    } catch (error) {
        notifyError("Failed to save achievements.");
    }
  };

  const handleAchievementChange = (index, value) => {
    const newAchievements = [...profile.achievements];
    newAchievements[index] = value;
    setProfile({ ...profile, achievements: newAchievements });
  };

  const addAchievementField = () => {
    setProfile({ ...profile, achievements: [...(profile.achievements || []), ''] });
  };

  const removeAchievementField = (index) => {
    if (profile.achievements?.length <= 1) {
        setProfile({ ...profile, achievements: [''] });
        return;
    }
    const newAchievements = profile.achievements.filter((_, i) => i !== index);
    setProfile({ ...profile, achievements: newAchievements });
  };

  const handleFileUpload = async (file, path, successCallback) => {
    if (!file || !userId) return;
    setUploading(true);
    const fileRef = ref(storage, path);
    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      successCallback(url);
      notifySuccess("File uploaded successfully!");
    } catch (error) {
      notifyError("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleProfilePicSelection = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imageSrc = reader.result?.toString() || '';
      openModal('cropImage', { 
        imageSrc, 
        onCropComplete: (croppedBlob) => {
          handleFileUpload(croppedBlob, `profile-pictures/${userId}/avatar.jpg`, (url) => {
            setProfile(p => ({ ...p, photoURL: url }));
          });
        }
      });
    });
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  
  const handleResumeUpload = (file) => {
     handleFileUpload(file, `resumes/${userId}/resume.pdf`, (url) => {
        useDataStore.setState({ resumeFile: { name: file.name, url } });
     });
  };

  const handleViewResume = () => {
    if (resumeFile?.url) {
      window.open(resumeFile.url, '_blank', 'noopener,noreferrer');
    }
  };

  const hasProfileChanges = JSON.stringify({ ...profile, achievements: undefined }) !== JSON.stringify({ ...initialProfile, achievements: undefined });
  const hasAchievementChanges = JSON.stringify(profile.achievements) !== JSON.stringify(initialProfile.achievements);
  const isSaveDisabled = !profile.name || !profile.email || !hasProfileChanges || isUploading;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg space-y-4 lg:col-span-2">
            <h2 className="text-xl font-semibold text-white">Your Profile</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                    <img src={profile.photoURL || 'https://placehold.co/128x128/1f2937/9ca3af?text=Avatar'} alt="Profile Avatar" className="w-32 h-32 rounded-full object-cover border-2 border-gray-600"/>
                    <CustomButton onClick={() => profilePicInputRef.current.click()} disabled={isUploading} className="bg-gray-600 text-xs w-full">
                        {isUploading ? <Loader2 className="animate-spin"/> : 'Change Picture'}
                    </CustomButton>
                    <input type="file" ref={profilePicInputRef} onChange={handleProfilePicSelection} className="hidden" accept="image/*"/>
                </div>
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="flex items-center gap-3"><User className="text-gray-400" /><input type="text" placeholder="Your Name*" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                    <div className="flex items-center gap-3"><Mail className="text-gray-400" /><input type="email" placeholder="Your Email* (for tests)" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                    <div className="flex items-center gap-3"><Phone className="text-gray-400" /><input type="tel" placeholder="Phone Number" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                    <div className="flex items-center gap-3"><Briefcase className="text-gray-400" /><input type="text" placeholder="Years of Experience" value={profile.experience || ''} onChange={e => setProfile({...profile, experience: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                    <div className="md:col-span-2 flex items-center gap-3"><Code className="text-gray-400" /><input type="text" placeholder="Your Skills (e.g., React, Node.js)" value={profile.skills || ''} onChange={e => setProfile({...profile, skills: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                    <div className="flex items-center gap-3"><Linkedin className="text-gray-400" /><input type="text" placeholder="LinkedIn URL" value={profile.linkedin || ''} onChange={e => setProfile({...profile, linkedin: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                    <div className="flex items-center gap-3"><Github className="text-gray-400" /><input type="text" placeholder="GitHub URL" value={profile.github || ''} onChange={e => setProfile({...profile, github: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                    <div className="flex items-center gap-3"><Twitter className="text-gray-400" /><input type="text" placeholder="Twitter URL" value={profile.twitter || ''} onChange={e => setProfile({...profile, twitter: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                    <div className="flex items-center gap-3"><Globe className="text-gray-400" /><input type="text" placeholder="Personal Website URL" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"/></div>
                </div>
            </div>
            <CustomButton onClick={handleProfileSave} disabled={isSaveDisabled} className="w-full bg-blue-600 mt-4">Save Profile Changes</CustomButton>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Your Resume</h2>
          <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-md">
            <FileText size={24} className="text-gray-400"/>
            <div className="flex-grow">
              <p className="text-white font-medium">{resumeFile?.name || 'No resume uploaded'}</p>
              <p className="text-xs text-gray-400">Upload a single PDF file.</p>
            </div>
            <div className="flex items-center gap-2">
                {isUploading ? <Loader2 className="animate-spin text-white"/> : (
                  <>
                    {resumeFile && <CustomButton onClick={handleViewResume} className="bg-blue-600"><Eye size={18}/> View</CustomButton>}
                    <CustomButton onClick={() => resumeInputRef.current.click()} className="bg-gray-600"><Upload size={18}/> {resumeFile ? 'Replace' : 'Upload'}</CustomButton>
                  </>
                )}
            </div>
            <input type="file" ref={resumeInputRef} onChange={e => handleResumeUpload(e.target.files[0])} className="hidden" disabled={isUploading}/>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Key Achievements</h2>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {(profile.achievements || ['']).map((achievement, index) => (
              <div key={index} className="flex items-center gap-2">
                <Trophy className="text-gray-400 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder={`Achievement #${index + 1}`}
                  value={achievement}
                  onChange={(e) => handleAchievementChange(index, e.target.value)}
                  className="w-full bg-gray-700 p-2 border border-gray-600 rounded-md"
                />
                <button onClick={() => removeAchievementField(index)} disabled={profile.achievements?.length <= 1 && achievement === ''} className="p-2 text-red-400 hover:text-red-500 disabled:text-gray-600 disabled:cursor-not-allowed">
                  <Minus size={18}/>
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <CustomButton onClick={addAchievementField} className="bg-gray-600 text-sm">
              <Plus size={16}/> Add Achievement
            </CustomButton>
            <CustomButton onClick={handleAchievementsSave} disabled={!hasAchievementChanges} className="bg-blue-600">
              Save Achievements
            </CustomButton>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">Email Templates</h2>
            <p className="text-sm text-gray-400 mb-4">Click a template to set it as the default for new campaigns.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emailTemplates.map(template => (
                    <TemplateCard 
                        key={template.id}
                        template={template}
                        isSelected={selectedTemplate.id === template.id}
                        onSelect={setSelectedTemplate}
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
