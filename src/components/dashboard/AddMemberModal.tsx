"use client";

import { useState } from "react";
import { User, Mail, Lock, Phone, MapPin, Briefcase, GraduationCap, FileText } from "lucide-react";
import { toast } from "sonner";
import { createMember } from "@/app/actions/admin";
import Modal, { Button } from "@/components/ui/Modal";

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
        password: "",
        cnic: "",
        gender: "Male",
        phone: "",
        role: "member",
        institution: "",
        membership_status: "approved"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await createMember(formData);

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Member created successfully!");
                onSuccess();
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add New Member"
            subtitle="Create a new member account with pre-approved status"
            size="lg"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => document.getElementById('add-member-form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
                        loading={isLoading}
                        icon={<User className="w-4 h-4" />}
                    >
                        Create Member
                    </Button>
                </>
            }
        >
            <form id="add-member-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Personal Details */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        Personal Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                    placeholder="As per CNIC"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Father/Husband Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="fatherName"
                                    value={formData.fatherName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">CNIC *</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="cnic"
                                    value={formData.cnic}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-mono"
                                    placeholder="00000-0000000-0"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Contact Details */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        Contact & Account
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                    placeholder="member@example.com"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                    placeholder="Temporary password"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Member can change this after first login</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                    placeholder="+92 300 0000000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Professional Details */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        Professional (Optional)
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution/Organization</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                name="institution"
                                value={formData.institution}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                                placeholder="University or Organization name"
                            />
                        </div>
                    </div>
                </div>

                {/* Status Notice */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <p className="text-sm text-emerald-800">
                        <strong>Note:</strong> This member will be created with <span className="font-semibold">Approved</span> status and 1 year subscription.
                    </p>
                </div>
            </form>
        </Modal>
    );
}
