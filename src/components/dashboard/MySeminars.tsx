"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Calendar, MapPin, Download, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import QRCode from "qrcode";

type MySeminar = {
    attendance_status: string;
    certificate_issued_at: string | null;
    seminars: {
        id: string;
        title: string;
        seminar_date: string;
        location: string;
        certificate_templates: {
            background_image_url: string;
            layout_config: any;
        } | null;
    };
};

export default function MySeminars({ userId }: { userId: string }) {
    const [mySeminars, setMySeminars] = useState<MySeminar[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [generatingId, setGeneratingId] = useState<string | null>(null);

    const supabase = createClient();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const fetchSeminars = async () => {
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
            setProfile(profileData);

            const { data, error } = await supabase
                .from("seminar_attendees")
                .select(`
                    attendance_status,
                    certificate_issued_at,
                    seminars (
                        id,
                        title,
                        seminar_date,
                        location,
                        certificate_templates (
                            background_image_url,
                            layout_config
                        )
                    )
                `)
                .eq('profile_id', userId);

            if (!error && data) {
                setMySeminars(data as any);
            }
            setIsLoading(false);
        };
        fetchSeminars();
    }, [userId, supabase]);

    const handleGenerate = async (seminar: MySeminar['seminars']) => {
        if (!profile || !profile.full_name || profile.full_name.includes('@')) {
            toast.error("Please update your profile with your actual Full Name before generating.");
            return;
        }

        const template = seminar.certificate_templates;
        if (!template) {
            toast.error("No certificate template assigned to this seminar.");
            return;
        }

        setGeneratingId(seminar.id);
        toast.info("Generating certificate...");

        try {
            const canvas = canvasRef.current;
            if (!canvas) throw new Error("Canvas missing");
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Context missing");

            // 1. Load Background Image
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.src = template.background_image_url;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // 2. Parse Layout Config
            const config = typeof template.layout_config === 'string' ? JSON.parse(template.layout_config) : template.layout_config;

            // Helper to draw text
            const drawText = (text: string, conf: any) => {
                if (!conf) return;
                ctx.font = `bold ${conf.fontSize || 40}px Arial`;
                ctx.fillStyle = conf.color || '#000000';
                ctx.textAlign = conf.align || 'center';
                ctx.fillText(text, conf.x, conf.y);
            };

            // 3. Draw Elements
            drawText(profile.full_name.toUpperCase(), config.name);
            drawText(format(new Date(seminar.seminar_date), 'MMMM d, yyyy'), config.date);
            if (config.membership_number && profile.membership_number) {
                drawText(profile.membership_number, config.membership_number);
            }

            // 4. Generate QR Code
            if (config.qr) {
                const verifyUrl = `${window.location.origin}/verify/seminar/${seminar.id}/${userId}`;
                const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: config.qr.size || 200 });
                const qrImg = new window.Image();
                qrImg.src = qrDataUrl;
                await new Promise((resolve) => { qrImg.onload = resolve; });
                ctx.drawImage(qrImg, config.qr.x, config.qr.y);
            }

            // 5. Download
            const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
            const link = document.createElement('a');
            link.download = `Certificate_${seminar.title.replace(/\s+/g, '_')}.jpg`;
            link.href = dataUrl;
            link.click();

            // Mark as generated in DB
            await supabase.from('seminar_attendees').update({ certificate_issued_at: new Date().toISOString() }).match({ seminar_id: seminar.id, profile_id: userId });
            
            toast.success("Certificate Downloaded!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate certificate. Ensure image URLs have CORS enabled.");
        } finally {
            setGeneratingId(null);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading seminars...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Seminars & Certificates</h1>
                <p className="text-gray-500 mt-1">View the seminars you attended and download your certificates.</p>
            </div>

            {mySeminars.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No Seminars Found</h3>
                    <p className="text-gray-500 mt-1">You haven't been marked as attended for any seminars yet.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mySeminars.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            <div className="p-6 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                    {item.attendance_status === 'approved' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                            <CheckCircle className="w-3.5 h-3.5" /> Approved
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                                            <Clock className="w-3.5 h-3.5" /> Pending
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.seminars.title}</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>{format(new Date(item.seminars.seminar_date), 'MMMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{item.seminars.location}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                                {item.attendance_status === 'approved' ? (
                                    <button
                                        onClick={() => handleGenerate(item.seminars)}
                                        disabled={generatingId === item.seminars.id}
                                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-600 text-white py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
                                    >
                                        {generatingId === item.seminars.id ? (
                                            "Generating..."
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" /> Download Certificate
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button disabled className="w-full py-2.5 rounded-xl font-medium text-gray-400 bg-gray-100 cursor-not-allowed">
                                        Awaiting Approval
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Hidden Canvas for Generation */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
}
