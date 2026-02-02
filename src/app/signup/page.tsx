"use client";

import { useState, useRef, useEffect } from "react";
import { User, Mail, Lock, Phone, MapPin, Briefcase, GraduationCap, Calendar, CreditCard, Upload, X, CheckCircle, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { registerMember } from "@/app/actions/register";

// Utility for CNIC Masking
const formatCNIC = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
};

// Utility for Phone Masking (Simple)
const formatPhone = (value: string) => {
    // Allow digits and + only
    return value.replace(/[^0-9+]/g, "");
};

// Reusable Input Component
const InputGroup = ({ label, icon: Icon, error, className = "", ...props }: any) => (
    <div className={`form-group ${className}`}>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block flex items-center justify-between">
            {label}
            {error && <span className="text-red-500 text-xs font-normal">{error}</span>}
        </label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />}
            <input
                className={`w-full bg-gray-50/50 border text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${Icon ? 'pl-10' : ''} ${error ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`}
                {...props}
            />
        </div>
    </div>
);

// Mobile-Optimized File Upload Component
const FileUploadField = ({ label, icon: Icon, file, onChange, onRemove, required, error, isPhoto = false }: any) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Generate preview for images
    useEffect(() => {
        if (file && file.type?.startsWith('image')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, [file]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onChange(e);
        }
        // Reset input value to allow re-selecting same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onRemove();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Accept types: images for photos, images+pdf for documents
    const acceptTypes = isPhoto
        ? "image/jpeg,image/png,image/webp,image/heic,image/heif"
        : "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";

    return (
        <div className="form-group">
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block flex justify-between">
                {label} {required && <span className="text-primary">*</span>}
                {error && <span className="text-red-500 text-xs font-normal">{error}</span>}
            </label>
            <div className={`border-2 border-dashed rounded-xl p-4 transition-all ${file ? 'border-green-300 bg-green-50/30' : error ? 'border-red-300 bg-red-50/30' : 'border-gray-200 active:border-primary/50 active:bg-gray-50'}`}>
                {file ? (
                    <div className="flex items-center gap-3">
                        {/* Show image preview if available */}
                        {preview ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                {file.type?.startsWith('image') ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{file.name || 'Selected file'}</p>
                            <p className="text-xs text-green-600">
                                {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Ready to upload'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-3 bg-red-50 hover:bg-red-100 rounded-full text-red-500 transition-colors touch-manipulation"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <label className="cursor-pointer block text-center py-4 touch-manipulation">
                        {/* Hidden file input with mobile-friendly attributes */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept={acceptTypes}
                            onChange={handleFileSelect}
                        // Allow both camera and gallery on mobile
                        />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700 font-semibold">Tap to {isPhoto ? 'take photo or select' : 'upload'}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {isPhoto ? 'Camera or Gallery' : 'JPG, PNG, PDF'} (Max 5MB)
                                </p>
                            </div>
                        </div>
                    </label>
                )}
            </div>
        </div>
    );
};

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Personal, 2: Professional, 3: Documents

    // Auto-scroll to top on step change
    const formTopRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (formTopRef.current) {
            formTopRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [step]);

    const [formData, setFormData] = useState({
        // Personal
        fullName: "",
        fatherName: "",
        cnic: "",
        dob: "",
        gender: "Male",
        bloodGroup: "",

        // Contact
        email: "",
        phone: "",
        address: "",
        city: "",
        province: "Punjab",

        // Professional/Academic
        role: "Student",
        membershipType: "Student",
        isRenewal: false,
        oldMemberId: "", // Logic for renewal if needed

        institution: "",
        collegeAttended: "",
        qualification: "",
        otherQualification: "",

        postGraduateDegrees: [] as string[],
        hasRelevantPg: false,
        hasNonRelevantPg: false,
        postGraduateInstitution: "",

        currentStatus: "",
        designation: "",
        employmentStatus: "Student",

        // Password
        password: "",
        confirmPassword: ""
    });

    const [files, setFiles] = useState<{
        profilePhoto?: File;
        cnicFront?: File;
        cnicBack?: File;
        transcript?: File;
        transcriptBack?: File;
        studentId?: File;
        paymentProof?: File;
        renewalCard?: File;
    }>({});

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Field Change Handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            let newVal = value;
            // Apply Masks
            if (name === 'cnic') newVal = formatCNIC(value);
            if (name === 'phone') newVal = formatPhone(value);

            setFormData(prev => ({ ...prev, [name]: newVal }));

            // Clear Error if exists
            if (errors[name]) {
                setErrors(prev => {
                    const newErr = { ...prev };
                    delete newErr[name];
                    return newErr;
                });
            }
        }
    };

    // Compress image for mobile upload
    const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
        // Only compress images
        if (!file.type.startsWith('image/') || file.type === 'application/pdf') {
            return file;
        }

        return new Promise((resolve) => {
            const img = document.createElement('img');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Create new file with original name but compressed data
                            const compressedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file); // Fallback to original
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = () => resolve(file); // Fallback to original on error

            // Handle the file
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        });
    };

    // File Handler with compression for mobile
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];

            // Show loading toast for large files
            const isLargeFile = file.size > 2 * 1024 * 1024;
            if (isLargeFile && file.type.startsWith('image/')) {
                toast.loading('Optimizing image...', { id: 'compress' });
            }

            try {
                // Compress images (especially important for mobile camera photos)
                if (file.type.startsWith('image/')) {
                    file = await compressImage(file, 1920, 0.85);
                }

                // Validate Size (Max 5MB after compression)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error("File size must be less than 5MB", { id: 'compress' });
                    return;
                }

                setFiles(prev => ({ ...prev, [field]: file }));

                if (isLargeFile) {
                    toast.success('Image optimized!', { id: 'compress' });
                }
            } catch (error) {
                console.error('File processing error:', error);
                // Still try to use the original file
                if (file.size <= 5 * 1024 * 1024) {
                    setFiles(prev => ({ ...prev, [field]: file }));
                } else {
                    toast.error("Could not process file. Please try a smaller image.", { id: 'compress' });
                }
            }
        }
    };

    const removeFile = (field: string) => {
        setFiles(prev => {
            const newFiles = { ...prev };
            delete (newFiles as any)[field];
            return newFiles;
        });
    };

    // Validation
    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
            if (!formData.fatherName.trim()) newErrors.fatherName = "Father Name is required";
            if (!formData.cnic.trim()) newErrors.cnic = "CNIC is required";
            else if (formData.cnic.length !== 15) newErrors.cnic = "Invalid CNIC format (13 digits required)";

            if (!formData.email.trim()) newErrors.email = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format";

            if (!formData.phone.trim()) newErrors.phone = "Phone is required";
            if (!formData.address.trim()) newErrors.address = "Address is required";
            if (!formData.city.trim()) newErrors.city = "City is required";
        }

        if (currentStep === 2) {
            if (!formData.qualification) newErrors.qualification = "Qualification is required";
            if (formData.qualification === 'Other' && !formData.otherQualification.trim()) newErrors.otherQualification = "Please specify qualification";
            if (formData.employmentStatus !== 'Student' && formData.employmentStatus !== 'Unemployed' && !formData.designation.trim()) {
                newErrors.designation = "Designation is required";
            }
        }

        if (currentStep === 3) {
            // Check Files
            if (!files.profilePhoto) newErrors.profilePhoto = "Profile Photo is required";
            if (!files.paymentProof) newErrors.paymentProof = "Payment Receipt is required";
            if (!files.cnicFront) newErrors.cnicFront = "CNIC Front is required";

            // Password
            if (formData.password.length < 6) newErrors.password = "Password must be at least 6 chars";
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            isValid = false;
            toast.error("Please fix errors before proceeding");
        }

        return isValid;
    };

    const nextStep = () => {
        if (validateStep(step)) setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setIsLoading(true);
        toast.loading('Submitting your application...', { id: 'submit' });

        try {
            const data = new FormData();

            // Map formData to FormData
            Object.entries(formData).forEach(([key, value]) => {
                data.append(mapStateKeyToApi(key), String(value));
            });

            // Append Files manually to generic keys
            if (files.profilePhoto) data.append('profile_photo', files.profilePhoto);
            if (files.cnicFront) data.append('cnic_front', files.cnicFront);
            if (files.cnicBack) data.append('cnic_back', files.cnicBack);
            if (files.transcript) data.append('transcript', files.transcript);
            if (files.transcriptBack) data.append('transcript_back', files.transcriptBack);
            if (files.studentId) data.append('student_id', files.studentId);
            if (files.renewalCard) data.append('renewal_card', files.renewalCard);
            if (files.paymentProof) data.append('payment_proof', files.paymentProof);

            const result = await registerMember(data);

            if (result?.error) {
                toast.error(result.error, { id: 'submit' });
            } else {
                toast.success("Application submitted successfully! Please check your email.", { id: 'submit' });
                router.push("/login?registered=true");
            }

        } catch (error: any) {
            console.error('Registration error:', error);

            // Handle different types of errors
            let errorMessage = "Registration failed. Please try again.";

            if (error.message?.includes('fetch') || error.message?.includes('network')) {
                errorMessage = "Network error. Please check your internet connection and try again.";
            } else if (error.message?.includes('timeout')) {
                errorMessage = "Request timed out. Please try again with a stable connection.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage, { id: 'submit' });
        } finally {
            setIsLoading(false);
        }
    };

    // Helper map
    const mapStateKeyToApi = (key: string) => {
        const map: Record<string, string> = {
            fullName: 'full_name',
            fatherName: 'father_name',
            bloodGroup: 'blood_group',
            membershipType: 'membership_type',
            isRenewal: 'is_renewal',
            collegeAttended: 'college_attended',
            otherQualification: 'other_qualification',
            postGraduateInstitution: 'post_graduate_institution',
            hasRelevantPg: 'has_relevant_pg',
            hasNonRelevantPg: 'has_non_relevant_pg',
            currentStatus: 'current_status',
            employmentStatus: 'employment_status',
            confirmPassword: 'confirm_password'
        };
        return map[key] || key; // Default to key if not mapped (e.g. email, password, cnic)
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
                <div ref={formTopRef} className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Become a Member</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">Join the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan.</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8 flex justify-center items-center gap-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex items-center ${step >= s ? 'text-primary' : 'text-gray-400'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-2 border-2 transition-colors ${step >= s ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30' : 'border-gray-200 bg-white'}`}>
                                    {s}
                                </div>
                                <span className={`hidden md:inline font-medium ${step === s ? 'text-gray-900' : ''}`}>
                                    {s === 1 ? 'Personal Info' : s === 2 ? 'Professional' : 'Documents'}
                                </span>
                                {s < 3 && <div className={`h-1 w-8 md:w-16 mx-4 rounded-full transition-colors ${step > s ? 'bg-primary' : 'bg-gray-200'}`}></div>}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">

                            {/* Step 1: Personal Info */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Personal Information</h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputGroup
                                            label="Full Name" icon={User} name="fullName" value={formData.fullName} onChange={handleChange}
                                            placeholder="As per CNIC" required error={errors.fullName}
                                        />
                                        <InputGroup
                                            label="Father/Husband Name" icon={User} name="fatherName" value={formData.fatherName} onChange={handleChange}
                                            error={errors.fatherName} required
                                        />
                                        <InputGroup
                                            label="CNIC Number" icon={CreditCard} name="cnic" value={formData.cnic} onChange={handleChange}
                                            placeholder="35202-xxxxxxx-x" error={errors.cnic} required maxLength={15}
                                        />
                                        <div className="form-group">
                                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <InputGroup
                                            label="Date of Birth" icon={Calendar} name="dob" type="date" value={formData.dob} onChange={handleChange}
                                            error={errors.dob} required
                                        />
                                        <div className="form-group">
                                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Blood Group</label>
                                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                                                <option value="">Select Group</option>
                                                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-4 pt-6 mb-6">Contact Details</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputGroup
                                            label="Email Address" icon={Mail} name="email" type="email" value={formData.email} onChange={handleChange}
                                            error={errors.email} required
                                        />
                                        <InputGroup
                                            label="Phone / WhatsApp" icon={Phone} name="phone" type="tel" value={formData.phone} onChange={handleChange}
                                            placeholder="+92 300 0000000" error={errors.phone} required
                                        />
                                        <div className="md:col-span-2">
                                            <InputGroup
                                                label="Residential Address" icon={MapPin} name="address" value={formData.address} onChange={handleChange}
                                                error={errors.address} required
                                            />
                                        </div>
                                        <InputGroup
                                            label="City" name="city" value={formData.city} onChange={handleChange}
                                            error={errors.city} required
                                        />
                                        <div className="form-group">
                                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Province</label>
                                            <select name="province" value={formData.province} onChange={handleChange} className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                                                {['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad', 'Gilgit-Baltistan', 'Azad Kashmir', 'International'].map(p => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button type="button" onClick={nextStep} className="btn-primary-action">Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Professional Info */}
                            {step === 2 && (
                                <div className="space-y-8 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Membership & Qualification</h3>

                                    {/* Membership Type Selection */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-semibold text-gray-700">Membership Category</label>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'Full', label: 'Full Member', fee: 'Rs. 1500', icon: Briefcase },
                                                { id: 'Overseas', label: 'Overseas Member', fee: 'Rs. 3000', icon: MapPin },
                                                { id: 'Associate', label: 'Associate Member', fee: 'Rs. 500', icon: User },
                                                { id: 'Student', label: 'Student Member', fee: 'Rs. 1000', icon: GraduationCap }
                                            ].map((type) => (
                                                <label key={type.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.membershipType === type.id ? 'border-primary bg-primary/5 ring-2 ring-primary ring-opacity-20' : 'hover:bg-gray-50 border-gray-200'}`}>
                                                    <input
                                                        type="radio"
                                                        name="membershipType"
                                                        value={type.id}
                                                        checked={formData.membershipType === type.id}
                                                        onChange={(e) => {
                                                            setFormData(p => ({
                                                                ...p,
                                                                membershipType: type.id,
                                                                role: type.id === 'Student' ? 'Student' : 'Professional',
                                                                employmentStatus: type.id === 'Student' ? 'Student' : ''
                                                            }));
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`p-2 rounded-lg ${formData.membershipType === type.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                            <type.icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{type.label}</div>
                                                            <div className="text-xs text-gray-500 font-medium">{type.fee}</div>
                                                        </div>
                                                        {formData.membershipType === type.id && <CheckCircle className="w-5 h-5 text-primary ml-auto" />}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input type="checkbox" name="isRenewal" checked={formData.isRenewal} onChange={handleChange} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                                            <span className="text-sm font-medium text-gray-800">
                                                This is a Membership Renewal application
                                            </span>
                                        </label>
                                    </div>

                                    {/* Education form inputs... reused structure validation applied */}
                                    <div className="grid md:grid-cols-1 gap-6">
                                        <div className="form-group">
                                            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Qualification</label>
                                            <select name="qualification" value={formData.qualification} onChange={handleChange} className={`w-full bg-gray-50/50 border text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${errors.qualification ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`}>
                                                <option value="">Select Qualification</option>
                                                <option value="BSc (HONS) Vision Sciences (Optometry)">BSc (HONS) Vision Sciences (Optometry)</option>
                                                <option value="BSc (HONS) Vision Sciences (Orthoptics)">BSc (HONS) Vision Sciences (Orthoptics)</option>
                                                <option value="BSc (HONS) Investigative Ophthalmology">BSc (HONS) Investigative Ophthalmology</option>
                                                <option value="BSc (HONS) Optometry & Orthoptics">BSc (HONS) Optometry & Orthoptics</option>
                                                <option value="OD">OD</option>
                                                <option value="BS Optometry">BS Optometry</option>
                                                <option value="Other">Other (Specify below)</option>
                                            </select>
                                            {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                                        </div>

                                        {formData.qualification === 'Other' && (
                                            <InputGroup label="Specify Qualification" name="otherQualification" value={formData.otherQualification} onChange={handleChange} error={errors.otherQualification} />
                                        )}

                                        <InputGroup label="College Attended" name="collegeAttended" value={formData.collegeAttended} onChange={handleChange} />

                                        {/* PG Section */}
                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                                            <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-2">Post Graduate Degrees</h4>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input type="checkbox" name="hasRelevantPg" checked={formData.hasRelevantPg} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                                                    Relevant PG (MS, MPhil, PhD, PGD)
                                                </label>
                                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                                    <input type="checkbox" name="hasNonRelevantPg" checked={formData.hasNonRelevantPg} onChange={handleChange} className="rounded text-primary focus:ring-primary" />
                                                    Other PG Degree
                                                </label>
                                            </div>
                                            {(formData.hasRelevantPg || formData.hasNonRelevantPg) && (
                                                <InputGroup label="Institution Name" name="postGraduateInstitution" value={formData.postGraduateInstitution} onChange={handleChange} placeholder="University Name" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Employment */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Employment Status</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="form-group">
                                                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Current Status</label>
                                                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                                                    <option value="Student">Student</option>
                                                    <option value="Full Time Practitioner (Optical)">Full Time Practitioner</option>
                                                    <option value="Part Time Practitioner (Optical)">Part Time Practitioner</option>
                                                    <option value="Academia">Academia</option>
                                                    <option value="Govt Employee">Govt Employee</option>
                                                    <option value="Private Hospital">Private Hospital</option>
                                                    <option value="Unemployed">Unemployed</option>
                                                </select>
                                            </div>
                                            {formData.employmentStatus !== 'Student' && formData.employmentStatus !== 'Unemployed' && (
                                                <InputGroup label="Designation" name="designation" value={formData.designation} onChange={handleChange} error={errors.designation} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-6">
                                        <button type="button" onClick={prevStep} className="btn-secondary-action">Back</button>
                                        <button type="button" onClick={nextStep} className="btn-primary-action">Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Documents & Security */}
                            {step === 3 && (
                                <div className="space-y-8 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-4">Documents & Security</h3>

                                    <div className="bg-blue-50/50 text-blue-900 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-600" />
                                        <p>Please upload clear images or scans. Max size 5MB per file.</p>
                                    </div>

                                    {/* Bank Details Card - Premium Design */}
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden group">
                                        {/* Abstract Decoration */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-700"></div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                                    <CreditCard className="w-6 h-6 text-blue-300" />
                                                </div>
                                                <h4 className="font-bold text-xl tracking-tight">Fee Submission Details</h4>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="grid sm:grid-cols-2 gap-6">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest">Bank Name</p>
                                                        <p className="font-bold text-lg text-white">Meezan Bank</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest">Account Title</p>
                                                        <p className="font-bold text-lg text-white">RUHULLAH</p>
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group-hover:border-white/20 transition-colors">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Number</p>
                                                        <p className="font-mono text-xl md:text-2xl font-bold text-white tracking-widest select-all">
                                                            02750112976719
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText('02750112976719')
                                                                .then(() => toast.success('Account Number Copied!'))
                                                                .catch(() => toast.error('Failed to copy'));
                                                        }}
                                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-all active:scale-95 flex items-center gap-2"
                                                    >
                                                        Copy <span className="sr-only">Account Number</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                                    </button>
                                                </div>

                                                <div className="pt-6 border-t border-white/10 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-400 mb-1">Total Payable Amount</p>
                                                        <p className="text-xs text-blue-300">Non-refundable</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-3xl md:text-4xl font-bold text-emerald-400">
                                                            {formData.membershipType === 'Student' ? 'Rs. 1,000' :
                                                                formData.membershipType === 'Associate' ? 'Rs. 500' :
                                                                    formData.membershipType === 'Overseas' ? 'Rs. 3,000' : 'Rs. 1,500'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FileUploadField
                                            label="Profile Photo (Passport Size)"
                                            icon={User}
                                            file={files.profilePhoto}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'profilePhoto')}
                                            onRemove={() => removeFile('profilePhoto')}
                                            required
                                            error={errors.profilePhoto}
                                            isPhoto={true}
                                        />
                                        <FileUploadField
                                            label="Payment Proof / Receipt"
                                            icon={FileText}
                                            file={files.paymentProof}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'paymentProof')}
                                            onRemove={() => removeFile('paymentProof')}
                                            required
                                            error={errors.paymentProof}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-700">Identity Documents</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <FileUploadField
                                                label="CNIC Front"
                                                file={files.cnicFront}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'cnicFront')}
                                                onRemove={() => removeFile('cnicFront')}
                                                required
                                                error={errors.cnicFront}
                                            />
                                            <FileUploadField
                                                label="CNIC Back"
                                                file={files.cnicBack}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'cnicBack')}
                                                onRemove={() => removeFile('cnicBack')}
                                            />
                                        </div>
                                    </div>

                                    {/* Conditional Files */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FileUploadField
                                            label="Transcript Front (Optional)"
                                            file={files.transcript}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'transcript')}
                                            onRemove={() => removeFile('transcript')}
                                        />
                                        {formData.membershipType === 'Student' && (
                                            <FileUploadField
                                                label="Student ID Card"
                                                file={files.studentId}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'studentId')}
                                                onRemove={() => removeFile('studentId')}
                                            />
                                        )}
                                    </div>

                                    <div className="border-t pt-8 mt-6">
                                        <h4 className="font-bold text-gray-800 mb-6">Create Password</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <InputGroup
                                                label="Password" icon={Lock} type="password" name="password"
                                                value={formData.password} onChange={handleChange}
                                                error={errors.password} required placeholder="Min 6 characters"
                                            />
                                            <InputGroup
                                                label="Confirm Password" icon={Lock} type="password" name="confirmPassword"
                                                value={formData.confirmPassword} onChange={handleChange}
                                                error={errors.confirmPassword} required placeholder="Re-enter password"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-100">
                                        <button type="button" onClick={prevStep} className="w-full sm:w-auto order-2 sm:order-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-10 rounded-2xl border border-gray-200 transition-all hover:border-gray-300 hover:shadow-sm active:scale-[0.98]">
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full sm:w-auto order-1 sm:order-2 bg-primary-900 hover:bg-primary-800 text-white font-bold py-4 px-12 rounded-2xl transition-all shadow-xl shadow-primary-900/25 hover:shadow-primary-900/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    <span>Processing Application...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Complete Registration</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
            {/* Custom Styles for Inputs */}
            <style jsx global>{`
                .btn-primary-action {
                    @apply bg-primary-900 hover:bg-primary-800 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-primary-900/20 hover:shadow-primary-900/35 hover:-translate-y-0.5 active:translate-y-0;
                }
                .btn-secondary-action {
                    @apply bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-10 rounded-2xl border border-gray-200 transition-all hover:border-gray-300 hover:shadow-sm active:scale-[0.98];
                }
            `}</style>
        </>
    );
}
