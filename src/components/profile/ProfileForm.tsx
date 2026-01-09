"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, User, Mail, Lock, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
    user: any;
    profile: any;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Form states
    const [fullName, setFullName] = useState(profile?.full_name || "");
    const [email, setEmail] = useState(user?.email || "");

    // Password change states
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);

    // Profile Image
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.profile_photo_url || null);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Update Profile Data
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Update Email if changed (requires verification)
            if (email !== user.email) {
                const { error: emailError } = await supabase.auth.updateUser({ email });
                if (emailError) throw emailError;
                toast.success("Confirmation email sent to new address");
            }

            // Update Password if provided
            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    toast.error("Passwords do not match");
                    setIsLoading(false);
                    return;
                }
                const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
                if (passwordError) throw passwordError;
                toast.success("Password updated successfully");
                setNewPassword("");
                setConfirmPassword("");
                setIsPasswordSectionOpen(false);
            }

            toast.success("Profile updated successfully");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ profile_photo_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            toast.success("Profile photo updated!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

                {/* Profile Card - Left on Desktop, Top on Mobile */}
                <div className="w-full lg:w-[320px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
                    <div className="bg-gradient-to-br from-primary-50 to-white p-8 text-center border-b border-gray-100">
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg mx-auto relative group ring-4 ring-primary-50">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt="Profile"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}

                                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer text-white backdrop-blur-[2px]">
                                    <Camera className="w-8 h-8 mb-2 drop-shadow-md" />
                                    <span className="text-xs font-bold uppercase tracking-wider drop-shadow-sm">Change</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 rounded-full">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile?.full_name || "Guest User"}</h2>
                        <p className="text-gray-500 text-sm font-medium mb-4">{user.email}</p>
                        <div className="inline-flex items-center px-4 py-1.5 bg-green-50 text-green-700 border border-green-100 text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                            {profile?.role || "Member"}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                    <div className="p-6 md:p-8 border-b border-gray-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Personal Information</h3>
                            <p className="text-gray-500 text-sm">Manage your personal details and account settings</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary-50 transition-all outline-none font-medium text-gray-900"
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary-50 transition-all outline-none font-medium text-gray-900"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 ml-1">Confirmation required for email changes.</p>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    Security Settings
                                </h4>
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isPasswordSectionOpen
                                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                                        }`}
                                >
                                    {isPasswordSectionOpen ? "Cancel Change" : "Change Password"}
                                </button>
                            </div>

                            {isPasswordSectionOpen && (
                                <div className="space-y-6 animate-slide-down bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary-50 transition-all outline-none"
                                                placeholder="Min. 6 characters"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary-50 transition-all outline-none"
                                                placeholder="Re-enter password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary px-8 py-3 rounded-xl shadow-lg shadow-primary-200 hover:shadow-primary-300 transition-all flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Saving Changes
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" /> Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
