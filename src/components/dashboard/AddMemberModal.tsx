"use client";

import { useState } from "react";
import { User, Mail, Lock, Phone, MapPin, Briefcase, GraduationCap, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { createMember } from "@/app/actions/admin";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        fatherName: "",
        email: "",
        password: "", // Admin sets temp password
        cnic: "",
        gender: "Male",
        phone: "",
        role: "member",
        institution: "",
        membership_status: "approved"
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Using Server Action to avoid Auth Issues
            const result = await createMember(formData);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Member created successfully!");
                onSuccess();
                // Reset form
                setFormData({
                    fullName: "",
                    fatherName: "",
                    email: "",
                    password: "",
                    cnic: "",
                    gender: "Male",
                    phone: "",
                    role: "member",
                    institution: "",
                    membership_status: "approved"
                });
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create member");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add New Member</h2>
                    <button
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Personal Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input name="fullName" value={formData.fullName} onChange={handleChange} className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="As per CNIC" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">Father/Husband Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Required" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">CNIC</label>
                                <input name="cnic" value={formData.cnic} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono" placeholder="35202-xxxxxxx-x" required />
                            </div>
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" required />
                                </div>
                            </div>
                        </div>

                        {/* Professional & Role */}
                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">Role / Type</label>
                                <select name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                    <option value="student">Student Member</option>
                                    <option value="associate">Associate Member</option>
                                    <option value="member">Full Member</option>
                                    <option value="overseas">Overseas Member</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">Initial Status</label>
                                <select name="membership_status" value={formData.membership_status} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                    <option value="active">Active (Set Subscription)</option>
                                    <option value="pending">Pending Review</option>
                                    <option value="approved">Approved</option>
                                </select>
                            </div>
                            <div className="form-group md:col-span-2">
                                <label className="label text-sm font-semibold text-gray-700 mb-1.5 block">Institution / Clinic Name</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input name="institution" value={formData.institution} onChange={handleChange} className="w-full pl-10 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder="Optional" />
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <div className="form-group">
                                <label className="label text-sm font-semibold text-yellow-800 mb-1.5 block flex items-center gap-2">
                                    <Lock className="w-4 h-4" /> Secure Password Login
                                </label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-yellow-200 text-yellow-900 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all" placeholder="Min 6 characters" required minLength={6} />
                                <p className="text-xs text-yellow-600 mt-2">Generate a temporary password. The member can change it later.</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 gap-3 border-t border-gray-100">
                            <button type="button" onClick={onClose} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                            <button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Create Member</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
