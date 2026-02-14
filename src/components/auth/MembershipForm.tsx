"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { membershipSchema, type MembershipFormData } from "@/lib/validations/membership";
import { Upload, Check, CreditCard, User, FileText, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { submitApplication } from "@/app/actions/application";
import { useRouter } from "next/navigation";

export default function MembershipForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [fileStates, setFileStates] = useState<Record<string, File | null>>({});
    const supabase = createClient();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<MembershipFormData>({
        resolver: zodResolver(membershipSchema) as any,
        defaultValues: {
            membershipType: "Full",
            isRenewal: false,
        },
    });

    const membershipType = watch("membershipType");
    const isRenewal = watch("isRenewal");

    // Helper to store file in state
    const handleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFileStates(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    const uploadFile = async (file: File, bucket: string, path: string) => {
        const { error, data } = await supabase.storage.from(bucket).upload(path, file);
        if (error) throw error;

        // Construct public URL or get it
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        return publicUrl;
    };

    const onSubmit = async (data: MembershipFormData) => {
        setIsSubmitting(true);
        try {
            // Validate Required Files
            const requiredFiles = [
                { key: 'photo', label: 'Profile Photo' },
                { key: 'cnicFront', label: 'CNIC Front' },
                { key: 'cnicBack', label: 'CNIC Back' },
                { key: 'receipt', label: 'Payment Receipt' }
            ];

            if (data.membershipType === 'Student') {
                requiredFiles.push({ key: 'studentId', label: 'Student ID' });
            }
            if (data.isRenewal) {
                requiredFiles.push({ key: 'oldCard', label: 'Old Membershp Certificate' });
            }

            for (const req of requiredFiles) {
                if (!fileStates[req.key]) {
                    toast.error(`${req.label} is required`);
                    setIsSubmitting(false);
                    return;
                }
            }

            const formData = new FormData();

            // Append Text Fields
            formData.append('membershipType', data.membershipType);
            formData.append('isRenewal', String(data.isRenewal));
            formData.append('fullName', data.fullName);
            formData.append('fatherName', data.fatherName);
            formData.append('contactNumber', data.contactNumber);
            formData.append('cnic', data.cnic);
            formData.append('dob', data.dob);
            formData.append('gender', data.gender);
            formData.append('residentialAddress', data.residentialAddress);
            formData.append('bloodGroup', data.bloodGroup || '');
            formData.append('city', data.employmentCity);
            formData.append('province', data.province);
            formData.append('collegeAttended', data.collegeAttended);
            formData.append('qualification', data.qualification);
            if (data.otherQualification) formData.append('otherQualification', data.otherQualification);
            if (data.postGraduateInstitution) formData.append('postGraduateInstitution', data.postGraduateInstitution);
            formData.append('hasRelevantPg', String(data.hasRelevantPg || false));
            formData.append('hasNonRelevantPg', String(data.hasNonRelevantPg || false));
            formData.append('designation', data.designation || '');
            formData.append('employmentStatus', data.employmentStatus);
            if (data.transactionId) formData.append('transactionId', data.transactionId);

            // Append Files from fileStates
            if (fileStates.photo) formData.append('photo', fileStates.photo);
            if (fileStates.cnicFront) formData.append('cnicFront', fileStates.cnicFront);
            if (fileStates.cnicBack) formData.append('cnicBack', fileStates.cnicBack);
            if (fileStates.transcriptFront) formData.append('transcriptFront', fileStates.transcriptFront);
            if (fileStates.transcriptBack) formData.append('transcriptBack', fileStates.transcriptBack);
            if (fileStates.studentId) formData.append('studentId', fileStates.studentId);
            if (fileStates.oldCard) formData.append('oldCard', fileStates.oldCard);
            if (fileStates.receipt) formData.append('receipt', fileStates.receipt);

            // 2. Call Server Action
            const result = await submitApplication(formData);

            if (!result.success) {
                throw new Error(result.error);
            }

            setSubmitSuccess(true);
            window.scrollTo(0, 0);

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="text-center py-20 animate-fade-in px-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-primary-900 mb-4">Application Submitted!</h2>
                <p className="text-gray-600 max-w-lg mx-auto mb-8">
                    Your application has been received and is under review. <br />You can track your status in the dashboard.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-primary-900 text-white p-8 rounded-2xl shadow-soft-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <User className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Membership Application</h1>
                    <p className="text-blue-200">Complete the form below to become a member.</p>
                </div>
            </div>

            {/* ERROR SUMMARY */}
            {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-red-800">Please fix the errors below</h3>
                        <p className="text-sm text-red-600">Some required fields are missing or invalid.</p>
                    </div>
                </div>
            )}

            {/* MEMBERSHIP TYPE */}
            <div className="card space-y-6">
                <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" /> Membership Type
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { type: "Full", fee: "Rs. 1,500" },
                        { type: "Overseas", fee: "Rs. 3,000" },
                        { type: "Associate", fee: "Rs. 500" },
                        { type: "Student", fee: "Rs. 1,000" },
                    ].map((item) => (
                        <label key={item.type} className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${membershipType === item.type ? "border-accent bg-accent/5" : "border-gray-100 hover:bg-gray-50"}`}>
                            <input type="radio" value={item.type} {...register("membershipType")} className="sr-only" />
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-bold ${membershipType === item.type ? "text-primary-900" : "text-gray-700"}`}>{item.type}</span>
                                {membershipType === item.type && <Check className="w-5 h-5 text-accent" />}
                            </div>
                            <span className="text-sm text-gray-500">{item.fee}</span>
                        </label>
                    ))}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <input type="checkbox" id="renewal" {...register("isRenewal")} className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent" />
                    <label htmlFor="renewal" className="text-gray-700 font-medium cursor-pointer">This is a Renewal</label>
                </div>
                {isRenewal && (
                    <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Old Membershp Certificate</label>
                        <input type="file" onChange={(e) => handleFileChange('oldCard', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary" />
                    </div>
                )}
            </div>

            {/* PERSONAL INFO */}
            <div className="card space-y-6">
                <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <Input label="Full Name *" name="fullName" register={register} error={errors.fullName} />
                    <Input label="Father's Name *" name="fatherName" register={register} error={errors.fatherName} />
                    <Input label="Contact Number *" name="contactNumber" register={register} error={errors.contactNumber} placeholder="03XXXXXXXXX" />
                    <Input label="CNIC *" name="cnic" register={register} error={errors.cnic} placeholder="35202-XXXXXXX-X" />

                    <div>
                        <label className="label">Date of Birth *</label>
                        <input {...register("dob")} type="date" className="input" />
                        {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
                    </div>
                    <div>
                        <label className="label">Gender *</label>
                        <select {...register("gender")} className="select">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">Residential Address *</label>
                        <textarea {...register("residentialAddress")} className="textarea" rows={2} />
                        {errors.residentialAddress && <p className="text-red-500 text-xs mt-1">{errors.residentialAddress.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="label">Profile Photo *</label>
                        <div className="flex items-center gap-4 p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            {fileStates.photo ? (
                                <img src={URL.createObjectURL(fileStates.photo)} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400"><User className="w-8 h-8" /></div>
                            )}
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange('photo', e)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary file:text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* DOCUMENTS */}
            <div className="card space-y-6">
                <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" /> Required Documents
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FileField label="CNIC Front *" onChange={(e: any) => handleFileChange('cnicFront', e)} />
                    <FileField label="CNIC Back *" onChange={(e: any) => handleFileChange('cnicBack', e)} />
                    <FileField label="Transcript Front" onChange={(e: any) => handleFileChange('transcriptFront', e)} />
                    <FileField label="Transcript Back" onChange={(e: any) => handleFileChange('transcriptBack', e)} />
                    {membershipType === 'Student' && (
                        <FileField label="Student ID *" onChange={(e: any) => handleFileChange('studentId', e)} />
                    )}
                </div>
            </div>

            {/* PAYMENT */}
            <div className="card space-y-6 border-l-4 border-l-accent">
                <h3 className="text-xl font-bold text-primary-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" /> Payment Details
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div><p className="text-gray-500">Bank</p><p className="font-bold">Meezan Bank</p></div>
                        <div><p className="text-gray-500">Account Title</p><p className="font-bold">RUHULLAH</p></div>
                        <div className="md:col-span-2">
                            <p className="text-gray-500">IBAN</p>
                            <code className="bg-white px-2 py-1 rounded border">PK75MEZN0002750112976719</code>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Input label="Transaction ID *" name="transactionId" register={register} error={errors.transactionId} />
                    <FileField label="Payment Receipt *" onChange={(e: any) => handleFileChange('receipt', e)} />
                </div>
            </div>

            <button disabled={isSubmitting} className="btn btn-primary w-full h-12 text-lg shadow-xl">
                {isSubmitting ? <><Loader2 className="animate-spin mr-2" /> Submitting...</> : "Submit Application"}
            </button>
        </form>
    )
}

function Input({ label, name, register, error, placeholder }: any) {
    return (
        <div>
            <label className="label">{label}</label>
            <input {...register(name)} placeholder={placeholder} className="input" />
            {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>
    )
}

function FileField({ label, onChange }: any) {
    return (
        <div>
            <label className="label">{label}</label>
            <input type="file" onChange={onChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-primary-50 file:text-primary border border-gray-200 rounded-lg p-1" />
        </div>
    )
}

