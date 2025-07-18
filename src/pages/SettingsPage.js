import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useTemplateStore } from '../stores/templateStore';
import { useDataStore } from '../stores/dataStore';
import { db, storage, appId } from '../lib/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getMetadata, getDownloadURL } from 'firebase/storage';
import { User, Briefcase, Code, Globe, FileText, Upload, Loader2, Eye } from 'lucide-react';
import {TemplateCard} from '../components/shared/TemplateCard';
import {CustomButton} from '../components/shared/CustomButton';

export default function SettingsPage() {
  const { userId } = useAuthStore();
  const { notifySuccess, notifyError, isUploading, setUploading } = useAppStore();
  const { emailTemplates, selectedTemplate, setSelectedTemplate } = useTemplateStore();
  const { profile: storedProfile, resumeFile } = useDataStore();
  const [profile, setProfile] = useState(storedProfile || { name: '', profession: '', skills: '', website: '' });
  const resumeInputRef = useRef(null);

  useEffect(() => {
    setProfile(storedProfile || { name: '', profession: '', skills: '', website: '' });
  }, [storedProfile]);

  const handleProfileSave = async () => {
    if (!userId) return;
    const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/main`);
    try {
      await setDoc(profileRef, profile, { merge: true });
      notifySuccess("Profile saved successfully!");
    } catch (error) {
      notifyError("Failed to save profile.");
      console.error(error);
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file || !userId || isUploading) return;
    setUploading(true);
    const resumeRef = ref(storage, `resumes/${userId}/resume.pdf`);
    try {
      await uploadBytes(resumeRef, file);
      const metadata = await getMetadata(resumeRef);
      const url = await getDownloadURL(resumeRef);
      useDataStore.setState({ resumeFile: { name: metadata.name, url } });
      notifySuccess("Resume uploaded successfully!");
    } catch (error) {
      notifyError("Failed to upload resume.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleViewResume = () => {
    if (resumeFile?.url) {
      window.open(resumeFile.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold text-white">Your Profile</h2>
            <div className="flex items-center gap-3"><User className="text-gray-400" /><input type="text" placeholder="Your Name" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/></div>
            <div className="flex items-center gap-3"><Briefcase className="text-gray-400" /><input type="text" placeholder="Your Profession (e.g., Software Engineer)" value={profile.profession || ''} onChange={e => setProfile({...profile, profession: e.target.value})} className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/></div>
            <div className="flex items-center gap-3"><Code className="text-gray-400" /><input type="text" placeholder="Your Skills (e.g., React, Node.js)" value={profile.skills || ''} onChange={e => setProfile({...profile, skills: e.target.value})} className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/></div>
            <div className="flex items-center gap-3"><Globe className="text-gray-400" /><input type="text" placeholder="Your Website URL (https://...)" value={profile.website || ''} onChange={e => setProfile({...profile, website: e.target.value})} className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/></div>
            <CustomButton onClick={handleProfileSave} className="w-full bg-blue-600">Save Profile</CustomButton>
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
