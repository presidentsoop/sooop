"use client";

import { useState, useRef, useEffect } from "react";
import { User, Phone, MapPin, Briefcase, GraduationCap, Calendar, CreditCard, Upload, X, CheckCircle, AlertCircle, FileText, Image as ImageIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitApplication } from "@/app/actions/application";

// Utility for CNIC Masking
const formatCNIC = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
};

// Utility for Phone Masking
const formatPhone = (value: string) => {
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
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept={acceptTypes}
                            onChange={handleFileSelect}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-700 font-semibold">Tap to {isPhoto ? 'take photo or select' : 'upload'}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {isPhoto ? 'Camera or Gallery' : 'JPG, PNG, PDF'} (Max 3MB)
                                </p>
                            </div>
                        </div>
                    </label>
                )}
            </div>
        </div>
    );
};

export default function MembershipForm({ profile }: { profile?: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [step, setStep] = useState(1);

    // Auto-scroll to top on step change
    const formTopRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (formTopRef.current) {
            formTopRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [step]);

    const [formData, setFormData] = useState({
        // Personal
        fullName: profile?.full_name || "",
        fatherName: profile?.father_name || "",
        cnic: profile?.cnic || "",
        dob: profile?.date_of_birth || "",
        gender: profile?.gender || "Male",
        bloodGroup: profile?.blood_group || "",

        // Contact
        phone: profile?.contact_number || "",
        address: profile?.residential_address || "",
        city: profile?.city || "",
        province: profile?.province || "Punjab",

        // Professional/Academic
        membershipType: profile?.membership_type || "Student",
        isRenewal: false,
        oldMemberId: profile?.membership_number || "",

        institution: profile?.institution || "",
        collegeAttended: profile?.college_attended || "",
        qualification: profile?.qualification || "",
        otherQualification: profile?.other_qualification || "",

        hasRelevantPg: profile?.has_relevant_pg || false,
        hasNonRelevantPg: profile?.has_non_relevant_pg || false,
        postGraduateInstitution: profile?.post_graduate_institution || "",

        currentStatus: profile?.current_status || "",
        designation: profile?.designation || "",
        employmentStatus: profile?.employment_status || "Student",

        transactionId: "" // Set upon transfer
    });

    const [files, setFiles] = useState<{
        photo?: File;
        cnicFront?: File;
        cnicBack?: File;
        transcriptFront?: File;
        transcriptBack?: File;
        studentId?: File;
        receipt?: File;
        oldCard?: File;
    }>({});

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            let newVal = value;
            if (name === 'cnic') newVal = formatCNIC(value);
            if (name === 'phone') newVal = formatPhone(value);
            setFormData(prev => ({ ...prev, [name]: newVal }));
            if (errors[name]) {
                setErrors(prev => {
                    const newErr = { ...prev };
                    delete newErr[name];
                    return newErr;
                });
            }
        }
    };

    const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
        if (!file.type.startsWith('image/') || file.type === 'application/pdf') {
            return file;
        }
        return new Promise((resolve) => {
            const img = document.createElement('img');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => resolve(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];
            const isLargeFile = file.size > 2 * 1024 * 1024;
            if (isLargeFile && file.type.startsWith('image/')) {
                toast.loading('Optimizing image...', { id: 'compress' });
            }
            try {
                if (file.type.startsWith('image/')) {
                    file = await compressImage(file, 1280, 0.7);
                }
                if (file.size > 3 * 1024 * 1024) {
                    toast.error("File size must be less than 3MB", { id: 'compress' });
                    return;
                }
                setFiles(prev => ({ ...prev, [field]: file }));
                if (isLargeFile) {
                    toast.success('Image optimized!', { id: 'compress' });
                }
            } catch (error) {
                if (file.size <= 3 * 1024 * 1024) {
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

    const validateStep = (currentStep: number) => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
            if (!formData.fatherName.trim()) newErrors.fatherName = "Father Name is required";
            if (!formData.cnic.trim()) newErrors.cnic = "CNIC is required";
            else if (formData.cnic.length !== 15) newErrors.cnic = "Invalid CNIC format (13 digits required)";

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
            if (!files.photo) newErrors.photo = "Profile Photo is required";
            if (!files.receipt) newErrors.receipt = "Payment Receipt is required";
            if (!files.cnicFront) newErrors.cnicFront = "CNIC Front is required";
            if (!formData.transactionId) newErrors.transactionId = "Transaction ID is required";
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
        toast.loading('Submitting application...', { id: 'submit' });

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, String(value));
            });

            if (files.photo) data.append('photo', files.photo);
            if (files.cnicFront) data.append('cnicFront', files.cnicFront);
            if (files.cnicBack) data.append('cnicBack', files.cnicBack);
            if (files.transcriptFront) data.append('transcriptFront', files.transcriptFront);
            if (files.transcriptBack) data.append('transcriptBack', files.transcriptBack);
            if (files.studentId) data.append('studentId', files.studentId);
            if (files.oldCard) data.append('oldCard', files.oldCard);
            if (files.receipt) data.append('receipt', files.receipt);

            const result = await submitApplication(data);

            if (!result.success) {
                toast.error(result.error || "Failed to submit application", { id: 'submit' });
            } else {
                toast.success("Application submitted successfully!", { id: 'submit' });
                setSubmitSuccess(true);
                window.scrollTo(0, 0);
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || "An unexpected error occurred", { id: 'submit' });
        } finally {
            setIsLoading(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="text-center py-20 animate-fade-in px-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                <p className="text-gray-600 max-w-lg mx-auto mb-8">
                    Your application has been received and is under review. Our team will verify your documents shortly.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-all">Reload Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div ref={formTopRef} className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-6 md:mb-8 flex justify-center items-center gap-2 sm:gap-4 px-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className={`flex items-center ${step >= s ? 'text-primary' : 'text-gray-400'}`}>
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold border-2 transition-colors ${step >= s ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30' : 'border-gray-200 bg-white'}`}>
                                {s}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s === 1 ? 'Personal' : s === 2 ? 'Professional' : 'Documents'}
                            </span>
                        </div>
                        {s < 3 && <div className={`h-0.5 sm:h-1 w-8 sm:w-12 md:w-16 mx-1.5 sm:mx-3 rounded-full transition-colors mb-4 ${step > s ? 'bg-primary' : 'bg-gray-200'}`}></div>}
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8">

                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-b pb-3 sm:pb-4 mb-4 sm:mb-6">Personal Information</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-b pb-3 sm:pb-4 pt-4 sm:pt-6 mb-4 sm:mb-6">Contact Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <InputGroup
                                    label="Phone / WhatsApp" icon={Phone} name="phone" type="tel" value={formData.phone} onChange={handleChange}
                                    placeholder="+92 300 0000000" error={errors.phone} required
                                />
                                <div className="sm:col-span-2">
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

                            <div className="flex justify-end pt-4 sm:pt-6">
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-400 hover:to-primary-300 text-white font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] touch-manipulation text-sm sm:text-base"
                                >
                                    <span>Continue to Step 2</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Professional Info */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-b pb-3 sm:pb-4">Membership & Qualification</h3>

                            {/* Membership Type Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-700">Membership Category</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                            {/* Qualification Options */}
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

                                <InputGroup label="College/University Attended" name="collegeAttended" value={formData.collegeAttended} onChange={handleChange} />

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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 sm:pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 sm:py-3.5 px-6 rounded-xl border border-gray-200 transition-all hover:border-gray-300 active:scale-[0.98] touch-manipulation text-sm sm:text-base"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Back</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-400 hover:to-primary-300 text-white font-bold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] touch-manipulation text-sm sm:text-base"
                                >
                                    <span>Continue to Final Step</span>
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Documents & Security */}
                    {step === 3 && (
                        <div className="space-y-8 animate-fade-in">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800 border-b pb-3 sm:pb-4">Documents & Security</h3>

                            <div className="bg-blue-50/50 text-blue-900 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-600" />
                                <p>Please upload clear images or scans. Max size 3MB per file.</p>
                            </div>

                            {/* Bank Details Card */}
                            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-5 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                                {/* Abstract Decoration */}
                                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6 sm:mb-8">
                                        <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                                            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base sm:text-xl text-white">Fee Submission Details</h4>
                                            <p className="text-xs text-indigo-200">Transfer your fee to complete registration</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] sm:text-xs font-semibold text-indigo-200 uppercase tracking-wider">Bank Name</p>
                                                <p className="font-bold text-sm sm:text-lg text-white">Meezan Bank</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] sm:text-xs font-semibold text-indigo-200 uppercase tracking-wider">Account Title</p>
                                                <p className="font-bold text-sm sm:text-lg text-white">RUHULLAH</p>
                                            </div>
                                        </div>

                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                                <div className="space-y-1 w-full sm:w-auto">
                                                    <p className="text-[10px] sm:text-xs font-semibold text-indigo-200 uppercase tracking-wider">Account Number</p>
                                                    <p className="font-mono text-lg sm:text-2xl font-bold text-white tracking-wider select-all break-all">
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
                                                    className="w-full sm:w-auto px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 touch-manipulation"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                                    <span>Copy</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                                            <div>
                                                <p className="text-sm text-indigo-200">Total Payable Amount</p>
                                                <p className="text-[10px] text-indigo-300">Non-refundable</p>
                                            </div>
                                            <div className="bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-400/30">
                                                <span className="text-2xl sm:text-3xl font-bold text-emerald-300">
                                                    {formData.membershipType === 'Student' ? 'Rs. 1,000' :
                                                        formData.membershipType === 'Associate' ? 'Rs. 500' :
                                                            formData.membershipType === 'Overseas' ? 'Rs. 3,000' : 'Rs. 1,500'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group pt-4">
                                <InputGroup
                                    label="Enter Payment Transaction ID" icon={CheckCircle} name="transactionId" value={formData.transactionId} onChange={handleChange}
                                    placeholder="e.g. 129384792384" required error={errors.transactionId}
                                    className="bg-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4">
                                <FileUploadField
                                    label="Profile Photo (Passport Size)"
                                    icon={User}
                                    file={files.photo}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'photo')}
                                    onRemove={() => removeFile('photo')}
                                    required
                                    error={errors.photo}
                                    isPhoto={true}
                                />
                                <FileUploadField
                                    label="Payment Proof / Receipt"
                                    icon={FileText}
                                    file={files.receipt}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'receipt')}
                                    onRemove={() => removeFile('receipt')}
                                    required
                                    error={errors.receipt}
                                />
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-700">Identity Documents</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <FileUploadField
                                    label="Transcript Front (Optional)"
                                    file={files.transcriptFront}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'transcriptFront')}
                                    onRemove={() => removeFile('transcriptFront')}
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

                            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 sm:pt-8 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 sm:py-3.5 px-6 rounded-xl border border-gray-200 transition-all hover:border-gray-300 active:scale-[0.98] touch-manipulation text-sm sm:text-base"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    <span>Back</span>
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3.5 sm:py-4 px-8 sm:px-10 rounded-xl shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 touch-manipulation text-sm sm:text-base"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Submit Application</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            <style jsx global>{`
                .btn-primary-action {
                    @apply bg-primary-500 hover:bg-primary-400 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-primary-500/20 hover:shadow-primary-500/35 hover:-translate-y-0.5 active:translate-y-0;
                }
                .btn-secondary-action {
                    @apply bg-white hover:bg-gray-50 text-gray-700 font-bold py-4 px-10 rounded-2xl border border-gray-200 transition-all hover:border-gray-300 hover:shadow-sm active:scale-[0.98];
                }
            `}</style>
        </div>
    );
}
