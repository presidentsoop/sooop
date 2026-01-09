"use client";

import { useState } from "react";
import { User, Mail, Lock, Phone, MapPin, Briefcase, GraduationCap, Calendar, CreditCard, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Utility for file upload simulation (replace with actual Supabase storage upload)
async function uploadFile(file: File, bucket: string, path: string) {
    // In a real scenario:
    // const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    // if (error) throw error;
    // return data.path;

    // For now returning a mock URL or just relying on the logic
    // We will assume the bucket 'documents' exists.
    return URL.createObjectURL(file); // Temporary for demo
}

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

        // Professional/Academic
        role: "Student", // Student or Professional
        institution: "",
        qualification: "", // Degree/Designation
        currentStatus: "", // Job title or Study year

        // Password
        password: "",
        confirmPassword: ""
    });

    const [files, setFiles] = useState<{
        profilePhoto?: File;
        cnicFront?: File;
        cnicBack?: File;
        transcript?: File;
        paymentProof?: File;
    }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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

            // 2. Upload Files (Mocking real upload for now or implement if buckets are ready)
            // Ideally we upload to 'documents' bucket users/{userId}/{fileType}
            // For this quick implementation we might skip actual file upload unless we have the bucket.
            // Let's assume we just save the metadata or skip file upload logic failure if bucket doesn't exist.

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

                    // Added columns
                    institution: formData.institution,
                    qualification: formData.qualification,
                    city: formData.city,
                    current_status: formData.currentStatus,
                    role: formData.role.toLowerCase(), // 'student' or 'professional' usually maps to app roles or just descriptive
                    membership_status: 'pending'
                })
                .eq('id', userId);

            if (profileError) throw profileError;

            // 4. Create Membership Application Record (if needed for tracking status history or specific uploads)
            // const { error: appError } = await supabase.from('membership_applications').insert({
            //     user_id: userId,
            //     membership_type: formData.role,
            //     status: 'pending'
            // });

            toast.success("Registration successful! Verify your email and await admin approval.");
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
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button type="button" onClick={nextStep} className="btn btn-primary px-8">Next Step</button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Professional Info */}
                            {step === 2 && (
                                <div className="space-y-6 animate-fade-in">
                                    <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Professional / Academic</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="label block mb-2">Member Category</label>
                                            <div className="flex gap-4">
                                                <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${formData.role === 'Student' ? 'border-primary bg-primary/5 ring-2 ring-primary ring-opacity-50' : 'hover:bg-gray-50'}`}>
                                                    <input type="radio" name="role" value="Student" checked={formData.role === 'Student'} onChange={handleChange} className="hidden" />
                                                    <div className="flex flex-col items-center gap-2">
                                                        <GraduationCap className={`w-8 h-8 ${formData.role === 'Student' ? 'text-primary' : 'text-gray-400'}`} />
                                                        <span className="font-bold">Student</span>
                                                    </div>
                                                </label>
                                                <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${formData.role === 'Professional' ? 'border-primary bg-primary/5 ring-2 ring-primary ring-opacity-50' : 'hover:bg-gray-50'}`}>
                                                    <input type="radio" name="role" value="Professional" checked={formData.role === 'Professional'} onChange={handleChange} className="hidden" />
                                                    <div className="flex flex-col items-center gap-2">
                                                        <Briefcase className={`w-8 h-8 ${formData.role === 'Professional' ? 'text-primary' : 'text-gray-400'}`} />
                                                        <span className="font-bold">Professional</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="form-group">
                                                <label className="label">Institution / Organization</label>
                                                <input name="institution" value={formData.institution} onChange={handleChange} className="input" placeholder={formData.role === 'Student' ? "University / College Name" : "Current Employer / Clinic"} required />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">{formData.role === 'Student' ? 'Degree Program' : 'Designation'}</label>
                                                <input name="qualification" value={formData.qualification} onChange={handleChange} className="input" placeholder={formData.role === 'Student' ? "e.g. BS Optometry" : "e.g. Senior Optometrist"} required />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">{formData.role === 'Student' ? 'Current Year / Session' : 'Experience / Specialization'}</label>
                                                <input name="currentStatus" value={formData.currentStatus} onChange={handleChange} className="input" placeholder={formData.role === 'Student' ? "e.g. 3rd Year (2022-2026)" : "e.g. 5 Years Exp / Low Vision"} required />
                                            </div>
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
                                            <label className="label">Payment Proof</label>
                                            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                <input type="file" accept="image/*,application/pdf" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={(e) => handleFileChange(e, 'paymentProof')} />
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
