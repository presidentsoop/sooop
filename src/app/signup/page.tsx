"use client";

import { useState } from "react";
import { User, Mail, Lock, Phone, MapPin, Briefcase, GraduationCap, Calendar, CreditCard, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";



export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Personal, 2: Professional, 3: Documents

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
        role: "Student", // Determine UI layout
        membershipType: "Student", // Full, Overseas, Associate, Student
        isRenewal: false,

        institution: "",
        collegeAttended: "",
        qualification: "",
        otherQualification: "",

        postGraduateDegrees: [] as string[],
        hasRelevantPg: false,
        hasNonRelevantPg: false,
        postGraduateInstitution: "",

        currentStatus: "", // Job title or Study year
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name === 'isRenewal') {
                setFormData(prev => ({ ...prev, isRenewal: checked }));
            } else if (name === 'hasRelevantPg') {
                setFormData(prev => ({ ...prev, hasRelevantPg: checked }));
            } else if (name === 'hasNonRelevantPg') {
                setFormData(prev => ({ ...prev, hasNonRelevantPg: checked }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        cnic: formData.cnic,
                        role: 'member'
                    }
                }
            });

            if (authError) throw authError;

            const userId = authData.user?.id;
            if (!userId) throw new Error("User creation failed");

            // 2. Upload Files & Create Document Records
            const fileUploads = [
                { file: files.profilePhoto, type: 'profile_photo', bucket: 'profile-photos', public: true },
                { file: files.cnicFront, type: 'cnic_front', bucket: 'documents', public: false },
                { file: files.cnicBack, type: 'cnic_back', bucket: 'documents', public: false },
                { file: files.paymentProof, type: 'payment_proof', bucket: 'documents', public: false },
                { file: files.transcript, type: 'transcript_front', bucket: 'documents', public: false },
                { file: files.transcriptBack, type: 'transcript_back', bucket: 'documents', public: false },
                { file: files.studentId, type: 'student_id', bucket: 'documents', public: false },
                { file: files.renewalCard, type: 'renewal_card', bucket: 'documents', public: false }
            ];

            let fileUrls: Record<string, string> = {};

            for (const upload of fileUploads) {
                if (!upload.file) continue;

                const fileExt = upload.file.name.split('.').pop();
                const fileName = `${userId}/${upload.type}_${Date.now()}.${fileExt}`;

                const { error: uploadError, data: uploadData } = await supabase.storage
                    .from(upload.bucket)
                    .upload(fileName, upload.file, { upsert: true });

                if (uploadError) {
                    console.error(`Failed to upload ${upload.type}:`, uploadError);
                    continue;
                }

                // Get Public URL for all (or construct path)
                // For 'documents' bucket which is private, we store the PATH.
                // For 'profile-photos' which is public, we calculate publicUrl.

                let storedPath = uploadData.path;
                if (upload.bucket === 'profile-photos') {
                    const { data: { publicUrl } } = supabase.storage.from(upload.bucket).getPublicUrl(fileName);
                    storedPath = publicUrl;
                }

                fileUrls[upload.type] = storedPath;

                // Insert into documents table
                await supabase.from('documents').insert({
                    user_id: userId,
                    document_type: upload.type,
                    file_url: storedPath,
                    verified: false
                });
            }

            // 3. Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.fullName,
                    father_name: formData.fatherName,
                    cnic: formData.cnic,
                    contact_number: formData.phone,
                    gender: formData.gender,
                    date_of_birth: formData.dob,
                    blood_group: formData.bloodGroup,
                    residential_address: formData.address,
                    city: formData.city,
                    province: formData.province,

                    // Professional
                    institution: formData.institution,
                    college_attended: formData.collegeAttended,
                    qualification: formData.qualification,
                    other_qualification: formData.otherQualification,
                    post_graduate_institution: formData.postGraduateInstitution,

                    has_relevant_pg: formData.hasRelevantPg,
                    has_non_relevant_pg: formData.hasNonRelevantPg,

                    current_status: formData.currentStatus,
                    designation: formData.designation,
                    employment_status: formData.employmentStatus,

                    role: 'member',
                    membership_type: formData.membershipType,
                    membership_status: 'pending',
                    profile_photo_url: fileUrls['profile_photo'] || null
                })
                .eq('id', userId);

            // 3b. Create Membership Application Record
            await supabase.from('membership_applications').insert({
                user_id: userId,
                membership_type: formData.membershipType,
                is_renewal: formData.isRenewal,
                status: 'pending',
                renewal_card_url: fileUrls['renewal_card'] || null,
                student_id_url: fileUrls['student_id'] || null,
                transcript_front_url: fileUrls['transcript_front'] || null,
                transcript_back_url: fileUrls['transcript_back'] || null
            });

            if (profileError) throw profileError;

            // 4. Create initial Payment Record if payment proof uploaded
            // (Optional, or handled via 'documents' table trigger/admin view)
            // But let's create a pending payment record so it shows up in Payments too.
            if (files.paymentProof) {
                await supabase.from('payments').insert({
                    user_id: userId,
                    amount: 0,
                    payment_mode: 'Upload',
                    status: 'pending',
                    receipt_url: fileUrls['payment_proof'] || 'Refer to Documents'
                });
            }

            toast.success("Registration successful! verifying your email...");
            router.push("/login?registered=true");

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-4">Become a Member</h1>
                        <p className="text-gray-600 max-w-2xl mx-auto">Join the Society of Optometrists, Orthoptists and Ophthalmic Technologists Pakistan. Complete the form below to start your journey.</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8 flex justify-center items-center gap-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex items-center ${step > s ? 'text-primary' : (step === s ? 'text-primary font-bold' : 'text-gray-400')}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 border-2 ${step === s ? 'border-primary bg-primary text-white' : (step > s ? 'border-primary bg-primary text-white' : 'border-gray-300')}`}>
                                    {s}
                                </div>
                                <span className="hidden md:inline">{s === 1 ? 'Personal Info' : s === 2 ? 'Professional' : 'Documents'}</span>
                                {s < 3 && <div className={`h-1 w-8 md:w-16 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-200'}`}></div>}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">

                            {/* Step 1: Personal Info */}
                            {step === 1 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Personal Information</h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="form-group">
                                            <label className="label">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input name="fullName" value={formData.fullName} onChange={handleChange} className="input pl-10" placeholder="As per CNIC" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Father/Husband Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input name="fatherName" value={formData.fatherName} onChange={handleChange} className="input pl-10" placeholder="Father or Husband Name" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">CNIC Number</label>
                                            <div className="relative">
                                                <CreditCard className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input name="cnic" value={formData.cnic} onChange={handleChange} className="input pl-10" placeholder="35202-xxxxxxx-x" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="input">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Date of Birth</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input pl-10" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Blood Group</label>
                                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input" required>
                                                <option value="">Select Group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2 pt-4">Contact Details</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="form-group">
                                            <label className="label">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input pl-10" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Phone / WhatsApp</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input pl-10" required />
                                            </div>
                                        </div>
                                        <div className="form-group md:col-span-2">
                                            <label className="label">Residential Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                <input name="address" value={formData.address} onChange={handleChange} className="input pl-10" placeholder="Full residential address" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">City</label>
                                            <input name="city" value={formData.city} onChange={handleChange} className="input" required />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">City</label>
                                            <input name="city" value={formData.city} onChange={handleChange} className="input" required />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Province</label>
                                            <select name="province" value={formData.province} onChange={handleChange} className="input" required>
                                                <option value="Punjab">Punjab</option>
                                                <option value="Sindh">Sindh</option>
                                                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                                                <option value="Balochistan">Balochistan</option>
                                                <option value="Islamabad">Islamabad</option>
                                                <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                                                <option value="Azad Kashmir">Azad Kashmir</option>
                                                <option value="International">International</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button type="button" onClick={nextStep} className="btn btn-primary px-8">Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Professional Info */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Membership & Qualification</h3>

                                    {/* Membership Type Selection */}
                                    <div className="space-y-4">
                                        <label className="label block">Membership Category</label>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'Full', label: 'Full Member', fee: 'Rs. 1500', icon: Briefcase },
                                                { id: 'Overseas', label: 'Overseas Member', fee: 'Rs. 3000', icon: MapPin },
                                                { id: 'Associate', label: 'Associate Member', fee: 'Rs. 500', icon: User },
                                                { id: 'Student', label: 'Student Member', fee: 'Rs. 1000', icon: GraduationCap }
                                            ].map((type) => (
                                                <label key={type.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.membershipType === type.id ? 'border-primary bg-primary/5 ring-2 ring-primary ring-opacity-50' : 'hover:bg-gray-50'}`}>
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
                                                    <div className="flex items-center gap-3">
                                                        <type.icon className={`w-6 h-6 ${formData.membershipType === type.id ? 'text-primary' : 'text-gray-400'}`} />
                                                        <div>
                                                            <div className="font-bold text-sm">{type.label}</div>
                                                            <div className="text-xs text-gray-500">{type.fee}</div>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 mt-4 bg-gray-50 p-3 rounded-lg">
                                            <input type="checkbox" name="isRenewal" checked={formData.isRenewal} onChange={handleChange} id="renewal" className="w-5 h-5 text-primary rounded" />
                                            <label htmlFor="renewal" className="text-sm font-medium cursor-pointer">
                                                This is a Membership Renewal (I am already registered)
                                            </label>
                                        </div>
                                    </div>

                                    {/* Education */}
                                    <div className="grid md:grid-cols-1 gap-6">
                                        <div className="form-group">
                                            <label className="label">Qualification</label>
                                            <select name="qualification" value={formData.qualification} onChange={handleChange} className="input" required>
                                                <option value="">Select Qualification</option>
                                                <option value="BSc (HONS) Vision Sciences (Optometry)">BSc (HONS) Vision Sciences (Optometry)</option>
                                                <option value="BSc (HONS) Vision Sciences (Orthoptics)">BSc (HONS) Vision Sciences (Orthoptics)</option>
                                                <option value="BSc (HONS) Optometry & Orthoptics">BSc (HONS) Optometry & Orthoptics</option>
                                                <option value="OD">OD</option>
                                                <option value="BS Optometry">BS Optometry</option>
                                                <option value="BS Optometry & Vision Sciences">BS Optometry & Vision Sciences</option>
                                                <option value="Transitional Doctor of Optometry">Transitional Doctor of Optometry</option>
                                                <option value="Post Professional Doctor of Optometry">Post Professional Doctor of Optometry</option>
                                                <option value="BSc (HONS) Vision Sciences (Investigative Ophthalmology)">BSc (HONS) Vision Sciences (Investigative Ophthalmology)</option>
                                                <option value="BS Vision Sciences">BS Vision Sciences</option>
                                                <option value="Ophthalmic Technician/Optometric Diploma">Ophthalmic Technician/Optometric Diploma</option>
                                                <option value="Other">Other (Specify below)</option>
                                            </select>
                                        </div>
                                        {formData.qualification === 'Other' && (
                                            <div className="form-group">
                                                <label className="label">Other Qualification</label>
                                                <input name="otherQualification" value={formData.otherQualification} onChange={handleChange} className="input" placeholder="Specify Qualification" />
                                            </div>
                                        )}

                                        <div className="form-group">
                                            <label className="label">College Attended (Graduation)</label>
                                            <input name="collegeAttended" value={formData.collegeAttended} onChange={handleChange} className="input" required />
                                        </div>

                                        {/* Post Grad Checkboxes */}
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                            <h4 className="text-sm font-bold text-gray-700">Post Graduate Degrees</h4>

                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" name="hasRelevantPg" checked={formData.hasRelevantPg} onChange={handleChange} id="pg_relevent" />
                                                <label htmlFor="pg_relevent" className="text-sm">Relevant PG (MS, MPhil, PhD, PGD in Optometry/Orthoptics)</label>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" name="hasNonRelevantPg" checked={formData.hasNonRelevantPg} onChange={handleChange} id="pg_non_relevent" />
                                                <label htmlFor="pg_non_relevent" className="text-sm">Other PG Degree (Not relevant to Vision Sciences)</label>
                                            </div>

                                            {(formData.hasRelevantPg || formData.hasNonRelevantPg) && (
                                                <div className="form-group mt-2">
                                                    <label className="label">Postgraduate Institution</label>
                                                    <input name="postGraduateInstitution" value={formData.postGraduateInstitution} onChange={handleChange} className="input" placeholder="Institution Name" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Employment */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Employment Status</h4>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="form-group">
                                                <label className="label">Current Status</label>
                                                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="input" required>
                                                    <option value="Student">Student</option>
                                                    <option value="Full Time Practitioner (Optical)">Full Time Practitioner (Optical)</option>
                                                    <option value="Part Time Practitioner (Optical)">Part Time Practitioner (Optical)</option>
                                                    <option value="Academia">Academia (Faculty)</option>
                                                    <option value="Govt Employee">Govt Employee</option>
                                                    <option value="Private Hospital (Part Time)">Private Hospital (Part Time)</option>
                                                    <option value="Private Hospital (Full Time)">Private Hospital (Full Time)</option>
                                                    <option value="Unemployed">Unemployed</option>
                                                </select>
                                            </div>
                                            {formData.employmentStatus !== 'Student' && formData.employmentStatus !== 'Unemployed' && (
                                                <div className="form-group">
                                                    <label className="label">Designation</label>
                                                    <input name="designation" value={formData.designation} onChange={handleChange} className="input" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <button type="button" onClick={prevStep} className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 px-8">Back</button>
                                        <button type="button" onClick={nextStep} className="btn btn-primary px-8">Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Documents & Security */}
                            {step === 3 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Documents & Security</h3>

                                    <div className="alert bg-blue-50 text-blue-900 px-4 py-3 rounded-lg border border-blue-100 text-sm mb-6">
                                        Please upload clear images/scans of your documents. Allowed formats: JPG, PNG, PDF. Max size: 5MB.
                                    </div>

                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-6">
                                        <h4 className="text-lg font-bold text-primary-900 mb-3 flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" /> Bank Account Details
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Please transfer the membership fee to the following account and upload the receipt below.
                                        </p>
                                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-2 text-sm">
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-gray-500">Bank Name</span>
                                                <span className="font-semibold text-gray-900">Meezan Bank (NASERABDFERZPRRD-LHR)</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-gray-500">Account Title</span>
                                                <span className="font-semibold text-gray-900">RUHULLAH</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-gray-500">Account Number</span>
                                                <span className="font-semibold text-gray-900 select-all">02750112976719</span>
                                            </div>
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-gray-500">IBAN</span>
                                                <span className="font-semibold text-gray-900 select-all">PK75MEZN0002750112976719</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Fee Amount</span>
                                                <span className="font-semibold text-primary">
                                                    {formData.membershipType === 'Student' ? 'Rs. 1,000' :
                                                        formData.membershipType === 'Associate' ? 'Rs. 500' :
                                                            formData.membershipType === 'Overseas' ? 'Rs. 3,000' : 'Rs. 1,500'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-primary-600 mt-3 font-medium text-center">
                                            * To avoid bank charges, prefer IBAN transfer. Please keep your transaction ID handy.
                                        </p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="form-group">
                                            <label className="label">Profile Photo (Passport Size)</label>
                                            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                <input type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={(e) => handleFileChange(e, 'profilePhoto')} />
                                                <p className="text-xs text-gray-400 mt-2">Required for ID Card</p>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Payment Proof (Receipt)</label>
                                            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={(e) => handleFileChange(e, 'paymentProof')} />
                                                <p className="text-xs text-gray-400 mt-2">Upload Bank Receipt</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="form-group">
                                            <label className="label">CNIC Front</label>
                                            <input type="file" className="file-input w-full" onChange={(e) => handleFileChange(e, 'cnicFront')} />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">CNIC Back</label>
                                            <input type="file" className="file-input w-full" onChange={(e) => handleFileChange(e, 'cnicBack')} />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mt-4">
                                        <div className="form-group">
                                            <label className="label">Transcript Front</label>
                                            <input type="file" className="file-input w-full" onChange={(e) => handleFileChange(e, 'transcript')} />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Transcript Back</label>
                                            <input type="file" className="file-input w-full" onChange={(e) => handleFileChange(e, 'transcriptBack')} />
                                        </div>
                                    </div>

                                    {formData.membershipType === 'Student' && (
                                        <div className="form-group mt-4">
                                            <label className="label">Student ID Card (Copy)</label>
                                            <input type="file" className="file-input w-full" onChange={(e) => handleFileChange(e, 'studentId')} />
                                        </div>
                                    )}

                                    {formData.isRenewal && (
                                        <div className="form-group mt-4">
                                            <label className="label">Old Membership Card</label>
                                            <input type="file" className="file-input w-full" onChange={(e) => handleFileChange(e, 'renewalCard')} />
                                        </div>
                                    )}

                                    <div className="border-t pt-6 mt-6">
                                        <h4 className="font-bold text-gray-800 mb-4">Set Password</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="form-group">
                                                <label className="label">Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="input pl-10" placeholder="Min 6 characters" required minLength={6} />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Confirm Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input pl-10" placeholder="Repeat password" required minLength={6} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-6">
                                        <button type="button" onClick={prevStep} className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 px-8">Back</button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="btn btn-primary px-8 flex items-center"
                                        >
                                            {isLoading ? (
                                                <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div> Processing...</>
                                            ) : (
                                                <>Submit Application</>
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
        </>
    );
}
